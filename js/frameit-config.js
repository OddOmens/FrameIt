/**
 * FrameIt Configuration
 */

window.FrameItConfig = {
    app: {
        name: 'FrameIt',
        version: '1.0.0',
        description: 'Professional Screenshot Mockup Tool'
    },
    
    // Supabase configuration
    supabase: {
        url: 'https://jhvprlsabmijwufnvvpk.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodnBybHNhYm1pand1Zm52dnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTA1MTYsImV4cCI6MjA2NDQ4NjUxNn0.DWi3yus6NrfV_i3TmhdBYHOqz_MIDukyCZrLq1LZKuw'
    },
    
    // Authentication Configuration
    auth: {
        requireEmailConfirmation: true,
        redirectTo: window.location.origin + '/auth/callback'
    },
    
    // Feature flags
    features: {
        analytics: true,
        payments: true,
        exportTracking: true,
        authentication: true
    },
    
    // API endpoints
    api: {
        baseUrl: '/api',
        endpoints: {
            checkout: '/api/create-checkout-session',
            webhook: '/api/stripe-webhook', 
            portal: '/api/create-portal-session',
            verifyExport: '/api/verify-export-permission'
        }
    }
}; 