const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// API Routes (simplified - no payments/auth needed)
app.use('/api/verify-export-permission', require('./api/verify-export-permission'));
app.use('/api/global-stats', require('./api/global-stats'));

// Stub endpoints for compatibility
app.post('/api/create-checkout-session', (req, res) => {
  res.status(200).json({ message: 'Payments disabled - no checkout needed' });
});

app.post('/api/create-portal-session', (req, res) => {
  res.status(200).json({ message: 'Payments disabled - no portal needed' });
});

app.post('/api/stripe-webhook', (req, res) => {
  res.status(200).json({ message: 'Payments disabled - no webhooks needed' });
});

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FrameIt server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 