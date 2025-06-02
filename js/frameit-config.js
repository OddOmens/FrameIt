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
        url: 'https://vgopglmcspquqbjuuuah.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnb3BnbG1jc3BxdXFianV1dWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDMwMjQsImV4cCI6MjA2NDI3OTAyNH0.7Hes6y1WhMRWeKxakdC2MLPLYr8x4wkRxUmSOE4_YuI'
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