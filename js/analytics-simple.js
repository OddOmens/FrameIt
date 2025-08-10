/**
 * Simplified Analytics Module for FrameIt
 * Removes all authentication and database dependencies
 */

window.Analytics = {
    state: {
        user: { id: 'local-user', email: 'user@frameit.local' },
        userProfile: { user_level: 'standard' },
        isInitialized: false
    },

    // Initialize analytics - simplified, no auth needed
    async init() {
        console.log('📊 Initializing Analytics (simplified mode)...');
        this.state.isInitialized = true;
        console.log('📊 Analytics initialized successfully (simplified mode)');
    },

    // Stub functions for compatibility - all return success
    async manualUpdateUploadCount() {
        console.log('📊 Upload count update (stub)');
        return { success: true, reason: 'No database - stub mode' };
    },

    async updateGlobalUploadCount() {
        console.log('📊 Global upload count update (stub)');
        return { success: true };
    },

    async manualUpdateCanvasCount() {
        console.log('📊 Canvas count update (stub)');
        return { success: true, reason: 'No database - stub mode' };
    },

    async updateGlobalCanvasCount() {
        console.log('📊 Global canvas count update (stub)');
        return { success: true };
    },

    async trackImageUpload() {
        console.log('📊 Image upload tracking (stub)');
        return { success: true, reason: 'No database - stub mode' };
    },

    async trackExport(format = 'png', dimensions = null) {
        console.log('📊 Export tracking (stub):', format, dimensions);
        return { success: true, reason: 'No database - stub mode' };
    },

    async trackCanvasCreation() {
        console.log('📊 Canvas creation tracking (stub)');
        return { success: true, reason: 'No database - stub mode' };
    },

    // No-op functions
    getSupabase() {
        return null;
    },

    getCurrentUser() {
        return this.state.user;
    },

    getUserProfile() {
        return this.state.userProfile;
    }
};

console.log('✅ Simplified Analytics module loaded successfully');