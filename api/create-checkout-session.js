const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, priceId, userId, userEmail } = req.body;

    // Validate required fields
    if (!plan || !priceId || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: plan, priceId, userId, userEmail' 
      });
    }

    // Validate plan type
    if (!['pro', 'team'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSubscription) {
      return res.status(400).json({ 
        error: 'User already has an active subscription' 
      });
    }

    // Create or get Stripe customer
    let customer;
    const { data: existingCustomer } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .maybeSingle();

    if (existingCustomer?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          user_id: userId,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || process.env.FRONTEND_URL}/pricing`,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        plan: plan,
        user_email: userEmail,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan: plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    console.log(`✅ Created checkout session for user ${userId}, plan: ${plan}`);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    
    // Return appropriate error message
    if (error.type === 'StripeCardError') {
      res.status(400).json({ error: 'Card was declined' });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Invalid request to Stripe' });
    } else {
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
});

module.exports = router;