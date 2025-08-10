// Express router for export permission verification (simplified - no auth)
// File: api/verify-export-permission.js

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // No authentication needed - always allow exports
    console.log('Export permission check (no auth mode) - always allowing');
    
    // Get export settings from request body for logging
    const {
      export_format = 'png',
      export_size = 'original',
      file_size_bytes = null,
      export_settings = null
    } = req.body;

    console.log('Export request:', { export_format, export_size, file_size_bytes });

    // Always return success - unlimited exports
    return res.status(200).json({
      allowed: true,
      current_exports: 0,
      remaining_exports: 999999, // Unlimited
      export_limit: 999999,
      subscription_tier: 'unlimited'
    });

  } catch (error) {
    console.error('Unexpected error in export verification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
