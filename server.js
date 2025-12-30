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

// Proxy for iTunes Search API
app.get('/api/search-app', async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Use global fetch (Node 18+)
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=10`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('iTunes Search Error:', error);
    res.status(500).json({ error: 'Failed to fetch from iTunes API' });
  }
});

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