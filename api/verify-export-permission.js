// Vercel serverless function for export permission verification
// File: api/verify-export-permission.js

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get export settings from request body
    const {
      export_format = 'png',
      export_size = 'original',
      file_size_bytes = null,
      export_settings = null
    } = req.body

    // Call the Supabase function to verify and track export
    const { data: result, error: exportError } = await supabase
      .rpc('verify_and_track_export', {
        p_user_id: user.id,
        p_export_format: export_format,
        p_export_size: export_size,
        p_file_size_bytes: file_size_bytes,
        p_export_settings: export_settings
      })

    if (exportError) {
      console.error('Export verification error:', exportError)
      return res.status(500).json({ error: 'Failed to verify export permission' })
    }

    // Return the result from the database function
    if (result.allowed) {
      return res.status(200).json({
        allowed: true,
        current_exports: result.current_exports,
        remaining_exports: result.remaining_exports,
        export_limit: result.export_limit,
        subscription_tier: result.subscription_tier
      })
    } else {
      return res.status(403).json({
        allowed: false,
        subscription_required: true,
        usage: {
          current_exports: result.current_exports,
          export_limit: result.export_limit
        },
        subscription_tier: result.subscription_tier,
        error: 'Export limit reached. Please upgrade your subscription.'
      })
    }

  } catch (error) {
    console.error('Unexpected error in export verification:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 