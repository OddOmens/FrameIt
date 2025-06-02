const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, returnUrl } = req.body;

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({ 
        error: 'Missing required field: customerId' 
      });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin || process.env.FRONTEND_URL}/settings`,
    });

    console.log(`✅ Created portal session for customer ${customerId}`);

    res.json({ 
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creating portal session:', error);
    
    // Return appropriate error message
    if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Invalid customer ID' });
    } else {
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }
} 