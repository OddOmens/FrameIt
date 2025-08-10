const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Use raw body parser for Stripe webhook signature verification
router.use(express.raw({ type: 'application/json' }));

router.post('/', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature using raw body
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📦 Received webhook event: ${event.type}`);

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session) {
  console.log('🛒 Processing checkout.session.completed');
  
  const userId = session.client_reference_id || session.metadata?.user_id;
  const customerId = session.customer;
  
  if (!userId) {
    console.error('❌ No user ID found in checkout session');
    return;
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Determine plan from price ID
  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  
  // Create or update subscription record
  await upsertSubscription(userId, customerId, subscription, plan);
  
  console.log(`✅ Checkout completed for user ${userId}, plan: ${plan}`);
}

async function handleSubscriptionCreated(subscription) {
  console.log('🆕 Processing customer.subscription.created');
  
  const customerId = subscription.customer;
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    // Try to find user by customer ID
    const { data: existingRecord } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
      
    if (!existingRecord) {
      console.error('❌ No user found for customer ID:', customerId);
      return;
    }
    userId = existingRecord.user_id;
  }
  
  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  
  await upsertSubscription(userId, customerId, subscription, plan);
  
  console.log(`✅ Subscription created for user ${userId}, plan: ${plan}`);
}

async function handleSubscriptionUpdated(subscription) {
  console.log('📝 Processing customer.subscription.updated');
  
  const customerId = subscription.customer;
  let userId = subscription.metadata?.user_id;
  
  if (!userId) {
    // Find user by subscription ID
    const { data: existingRecord } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (!existingRecord) {
      console.error('❌ No user found for subscription ID:', subscription.id);
      return;
    }
    userId = existingRecord.user_id;
  }
  
  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  
  await upsertSubscription(userId, customerId, subscription, plan);
  
  console.log(`✅ Subscription updated for user ${userId}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription) {
  console.log('🗑️ Processing customer.subscription.deleted');
  
  try {
    // Update subscription status to canceled
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('❌ Error updating canceled subscription:', error);
      return;
    }

    // Update user level back to standard
    const { data: subscriptionRecord } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subscriptionRecord) {
      await supabase
        .from('profiles')
        .update({ user_level: 'standard' })
        .eq('id', subscriptionRecord.user_id);
    }

    console.log(`✅ Subscription canceled for subscription ID: ${subscription.id}`);
  } catch (error) {
    console.error('❌ Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Processing invoice.payment_succeeded');
  
  if (invoice.subscription) {
    // Update subscription status to active if it was past due
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription)
      .in('status', ['past_due', 'unpaid']);
      
    console.log(`✅ Payment succeeded for subscription: ${invoice.subscription}`);
  }
}

async function handlePaymentFailed(invoice) {
  console.log('💸 Processing invoice.payment_failed');
  
  if (invoice.subscription) {
    // Update subscription status to past_due
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription);
      
    console.log(`⚠️ Payment failed for subscription: ${invoice.subscription}`);
  }
}

async function upsertSubscription(userId, customerId, subscription, plan) {
  try {
    // Prepare subscription data
    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_name: plan,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };

    // Add trial dates if present
    if (subscription.trial_start) {
      subscriptionData.trial_start = new Date(subscription.trial_start * 1000).toISOString();
    }
    if (subscription.trial_end) {
      subscriptionData.trial_end = new Date(subscription.trial_end * 1000).toISOString();
    }
    if (subscription.canceled_at) {
      subscriptionData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
    }

    // Upsert subscription record
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'stripe_subscription_id'
      });

    if (subscriptionError) {
      console.error('❌ Error upserting subscription:', subscriptionError);
      return;
    }

    // Update user level in profiles table
    const userLevel = plan === 'team' ? 'dev' : plan === 'pro' ? 'beta' : 'standard';
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ user_level: userLevel })
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error updating user level:', profileError);
    }

    console.log(`✅ Subscription upserted successfully for user ${userId}`);
  } catch (error) {
    console.error('❌ Error in upsertSubscription:', error);
  }
}

function getPlanFromPriceId(priceId) {
  // You'll need to update these with your actual Stripe price IDs
  const priceMapping = {
    'price_1234567890abcdef': 'pro',  // Pro monthly
    'price_0987654321fedcba': 'team', // Team monthly
    // Add more price IDs as needed (annual plans, etc.)
  };
  
  return priceMapping[priceId] || 'pro'; // Default to pro if unknown
}

});

module.exports = router;