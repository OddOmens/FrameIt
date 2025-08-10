/**
 * Authentication Bypass Module for FrameIt
 * Provides stub functions to replace authentication system
 */

console.log('🔍 Auth bypass loaded - no authentication required');

window.Auth = {
    // Bypass all authentication - always return true/success
    currentUser: { email: 'user@frameit.local', id: 'local-user' },
    currentSession: null,
    
    // Initialize - no-op
    async init() {
        console.log('✅ Auth bypass initialized - no authentication required');
        return Promise.resolve();
    },
    
    // Always return authenticated
    isAuthenticated() {
        return true;
    },
    
    // Stub callback system
    onAuthStateChanged(callback) {
        // Immediately call with mock user
        if (callback) {
            callback(this.currentUser);
        }
    },
    
    // No-op functions for compatibility
    showAuthModal() { /* no-op */ },
    hideAuthModal() { /* no-op */ },
    showUserSettings() { /* no-op */ },
    hideUserSettings() { /* no-op */ },
    handleLogin() { return Promise.resolve(); },
    handleSignup() { return Promise.resolve(); },
    handleLogout() { /* no-op */ },
    
    // Mock functions that other parts of the app might call
    showAuthGate() { /* no-op */ },
    showMainApp() { /* no-op */ },
    setupEventListeners() { /* no-op */ },
    
    // Mock user profile functions
    async ensureCurrentUserProfile() {
        return Promise.resolve();
    },
    
    // Mock analytics functions
    async updateGlobalStats() {
        return Promise.resolve();
    },
    
    refreshAnalyticsIfOpen() { /* no-op */ },
    
    showNotification(message, type, duration) {
        console.log(`📢 ${type}: ${message}`);
    }
};

console.log('✅ Auth bypass module loaded successfully');