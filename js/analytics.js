/**
 * FrameIt Analytics Module
 * Tracks user behavior using simplified profiles and global tables
 */

window.Analytics = {
    // Configuration
    config: {
        enabled: true,
        debugMode: true
    },

    // State
    state: {
        user: null,
        initialized: false,
        userProfile: null,
        profileLoaded: false
    },

    // Initialize analytics
    async init() {
        if (this.state.initialized) return;

        try {
            // Get current user if authenticated
            if (window.Auth && window.Auth.getCurrentUser) {
                this.state.user = window.Auth.getCurrentUser();
                
                // Load user profile for user_level checking
                if (this.state.user) {
                    const supabase = this.getSupabase();
                    if (supabase) {
                        try {
                            const { data: profile, error } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', this.state.user.id)
                                .single();
                            
                            if (!error && profile) {
                                this.state.userProfile = profile;
                                
                                if (this.config.debugMode) {
                                    console.log('📊 User profile loaded:', profile);
                                }
                                
                                // Trigger dev features check after profile is loaded
                                this.onProfileLoaded();
                            }
                        } catch (error) {
                            if (this.config.debugMode) {
                                console.log('📊 No user profile found (this is normal for new users)');
                            }
                        }
                    }
                }
            }
            
            this.state.initialized = true;
            
            if (this.config.debugMode) {
                console.log('📊 Analytics initialized', this.state);
            }
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    },

    // Get Supabase client
    getSupabase() {
        // First try to get it from the Auth module
        if (window.Auth && window.Auth.supabase) {
            return window.Auth.supabase;
        }
        // Fallback to global supabase
        return window.supabase;
    },

    // Called when user profile is loaded
    onProfileLoaded() {
        if (this.config.debugMode) {
            console.log('📊 Profile loaded, checking user level:', this.state.userProfile?.user_level);
        }
        
        // Mark profile as loaded for any waiting functions
        this.state.profileLoaded = true;
    },

    // Track image upload
    async trackImageUpload() {
        console.log('📊 trackImageUpload called');
        console.log('📊 Analytics state:', this.state);
        console.log('📊 Auth module user:', window.Auth?.getCurrentUser());
        console.log('📊 Analytics user:', this.state.user);
        
        // Try to get user from Auth module directly if not in analytics state
        let currentUser = this.state.user;
        if (!currentUser) {
            console.log('📊 No user in analytics state - trying to get from Auth module...');
            
            const authUser = window.Auth?.getCurrentUser();
            if (authUser) {
                console.log('📊 Found user in Auth module, updating analytics state:', authUser.id);
                this.state.user = authUser;
                currentUser = authUser;
            } else {
                console.log('📊 No user found in Auth module either - skipping upload tracking');
                return { success: false, reason: 'No user logged in' };
            }
        }

        console.log('📊 User found:', currentUser.id);

        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                console.error('📊 Supabase not available for upload tracking');
                return { success: false, reason: 'Supabase not available' };
            }

            console.log('📊 Calling increment_upload_count with user_id:', currentUser.id);
            
            const { data, error } = await supabase.rpc('increment_upload_count', {
                user_id: currentUser.id
            });

            if (error) {
                console.error('📊 Upload tracking error:', error);
                throw error;
            }

            console.log('📊 Upload tracked successfully:', data);
            return { success: true, data: data };

        } catch (error) {
            console.error('📊 Failed to track upload:', error);
            return { success: false, error: error.message };
        }
    },

    // Track canvas creation
    async trackCanvasCreated() {
        console.log('📊 trackCanvasCreated called');
        console.log('📊 Analytics state:', this.state);
        console.log('📊 Auth module user:', window.Auth?.getCurrentUser());
        console.log('📊 Analytics user:', this.state.user);
        
        if (!this.state.user) {
            console.log('📊 No user in analytics state - trying to get from Auth module...');
            
            // Try to get user from Auth module directly
            const authUser = window.Auth?.getCurrentUser();
            if (authUser) {
                console.log('📊 Found user in Auth module, updating analytics state:', authUser.id);
                this.state.user = authUser;
            } else {
                console.log('📊 No user found in Auth module either - skipping canvas tracking');
                return;
            }
        }

        console.log('📊 User found:', this.state.user.id);

        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                console.error('📊 Supabase not available for canvas tracking');
                return;
            }

            console.log('📊 Calling increment_canvas_count with user_id:', this.state.user.id);

            const { data, error } = await supabase.rpc('increment_canvas_count', {
                user_id: this.state.user.id
            });

            if (error) {
                console.error('📊 Canvas tracking error:', error);
                console.error('📊 Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                return;
            }

            console.log('📊 Canvas tracking response:', data);

            if (this.config.debugMode) {
                console.log('📊 Canvas creation tracked successfully');
            }
        } catch (error) {
            console.error('📊 Failed to track canvas creation:', error);
            console.error('📊 Canvas tracking exception:', {
                message: error.message,
                stack: error.stack
            });
        }
    },

    // Track export
    async trackExport() {
        console.log('📊 trackExport called');
        console.log('📊 Analytics state:', this.state);
        console.log('📊 Auth module user:', window.Auth?.getCurrentUser());
        console.log('📊 Analytics user:', this.state.user);
        
        if (!this.state.user) {
            console.log('📊 No user in analytics state - trying to get from Auth module...');
            
            // Try to get user from Auth module directly
            const authUser = window.Auth?.getCurrentUser();
            if (authUser) {
                console.log('📊 Found user in Auth module, updating analytics state:', authUser.id);
                this.state.user = authUser;
            } else {
                console.log('📊 No user found in Auth module either - skipping export tracking');
                return;
            }
        }

        console.log('📊 User found:', this.state.user.id);

        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                console.error('📊 Supabase not available for export tracking');
                return;
            }

            console.log('📊 Calling increment_export_count with user_id:', this.state.user.id);

            const { data, error } = await supabase.rpc('increment_export_count', {
                user_id: this.state.user.id
            });

            if (error) {
                console.error('📊 Export tracking error:', error);
                console.error('📊 Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                return;
            }

            console.log('📊 Export tracking response:', data);

            if (this.config.debugMode) {
                console.log('📊 Export tracked successfully');
            }
            
            return data;
        } catch (error) {
            console.error('📊 Failed to track export:', error);
            console.error('📊 Export tracking exception:', {
                message: error.message,
                stack: error.stack
            });
            throw error; // Re-throw so the calling function can handle it
        }
    },

    // Check if user has feature access (for dev features)
    hasFeatureAccess(feature) {
        if (!this.state.user) return false;
        
        // Check user level from profile (database-driven only)
        if (this.state.userProfile && this.state.userProfile.user_level === 'dev') {
            return true;
        }
        
        return false;
    },

    // Show analytics dashboard with real Supabase data
    async showAnalyticsDashboard() {
        if (!this.hasFeatureAccess('dev')) {
            console.warn('📊 Analytics dashboard access denied - dev level required');
            return;
        }

        console.log('📊 Loading analytics dashboard...');
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal analytics-modal';
        modal.id = 'analytics-dashboard-modal';
        modal.innerHTML = `
            <div class="modal-content analytics-dashboard-content">
                <div class="modal-header">
                    <h3><i class="fas fa-chart-bar"></i> Global Analytics Dashboard</h3>
                    <button class="modal-close-btn" id="analytics-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="analytics-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading analytics data...</p>
                    </div>
                    <div class="analytics-content" style="display: none;">
                        <!-- Analytics content will be inserted here -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        modal.classList.add('visible');
        
        // Close button
        document.getElementById('analytics-close-btn').addEventListener('click', () => {
            this.hideAnalyticsDashboard();
        });
        
        // Load analytics data
        try {
            const data = await this.loadAnalyticsData();
            this.renderAnalyticsDashboard(data);
        } catch (error) {
            console.error('📊 Failed to load analytics data:', error);
            this.showAnalyticsError(error.message);
        }
    },

    // Hide analytics dashboard
    hideAnalyticsDashboard() {
        const modal = document.getElementById('analytics-dashboard-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Load analytics data from Supabase
    async loadAnalyticsData() {
        const supabase = this.getSupabase();
        if (!supabase) {
            throw new Error('Supabase not available');
        }

        console.log('📊 Fetching analytics data from Supabase...');

        // Fetch global stats and user breakdown in parallel
        const [globalStats, userStats] = await Promise.all([
            this.getGlobalStats(),
            this.getUserStats()
        ]);

        return {
            globalStats,
            userStats,
            generatedAt: new Date()
        };
    },

    // Get global statistics
    async getGlobalStats() {
        const supabase = this.getSupabase();
        const { data, error } = await supabase
            .from('global')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    },

    // Get user statistics breakdown
    async getUserStats() {
        const supabase = this.getSupabase();
        const { data, error } = await supabase
            .from('profiles')
            .select('user_level, export_count, canvas_count, upload_count, created_at')
            .not('user_level', 'is', null);

        if (error) throw error;

        // Calculate user level breakdown
        const stats = {
            totalUsers: data.length,
            devUsers: data.filter(u => u.user_level === 'dev').length,
            betaUsers: data.filter(u => u.user_level === 'beta').length,
            standardUsers: data.filter(u => u.user_level === 'standard').length,
            topUsers: data
                .sort((a, b) => (b.export_count + b.canvas_count + b.upload_count) - (a.export_count + a.canvas_count + a.upload_count))
                .slice(0, 5)
                .map(user => ({
                    level: user.user_level,
                    totalActivity: user.export_count + user.canvas_count + user.upload_count,
                    exports: user.export_count,
                    canvases: user.canvas_count,
                    uploads: user.upload_count,
                    memberSince: user.created_at
                }))
        };

        return stats;
    },

    // Render analytics dashboard
    renderAnalyticsDashboard(data) {
        const loadingDiv = document.querySelector('.analytics-loading');
        const contentDiv = document.querySelector('.analytics-content');
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'block';
        
        contentDiv.innerHTML = `
            <div class="analytics-section">
                <h4><i class="fas fa-globe"></i> Global Statistics</h4>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-users"></i></div>
                        <div class="analytics-card-value">${data.globalStats.total_users}</div>
                        <div class="analytics-card-label">Total Users</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-download"></i></div>
                        <div class="analytics-card-value">${data.globalStats.total_exports}</div>
                        <div class="analytics-card-label">Total Exports</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-palette"></i></div>
                        <div class="analytics-card-value">${data.globalStats.total_canvases}</div>
                        <div class="analytics-card-label">Total Canvases</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                        <div class="analytics-card-value">${data.globalStats.total_uploads}</div>
                        <div class="analytics-card-label">Total Uploads</div>
                    </div>
                </div>
            </div>
            
            <div class="analytics-section">
                <h4><i class="fas fa-user-friends"></i> User Level Breakdown</h4>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-code"></i></div>
                        <div class="analytics-card-value">${data.globalStats.dev_users}</div>
                        <div class="analytics-card-label">Dev Users</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-flask"></i></div>
                        <div class="analytics-card-value">${data.globalStats.beta_users}</div>
                        <div class="analytics-card-label">Beta Users</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-user"></i></div>
                        <div class="analytics-card-value">${data.globalStats.standard_users}</div>
                        <div class="analytics-card-label">Standard Users</div>
                    </div>
                </div>
            </div>
            
            <div class="analytics-section">
                <h4><i class="fas fa-trophy"></i> Top Active Users</h4>
                <div class="analytics-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User Level</th>
                                <th>Total Activity</th>
                                <th>Exports</th>
                                <th>Canvases</th>
                                <th>Uploads</th>
                                <th>Member Since</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.userStats.topUsers.map(user => `
                                <tr>
                                    <td><span class="user-level-badge ${user.level}">${user.level}</span></td>
                                    <td><strong>${user.totalActivity}</strong></td>
                                    <td>${user.exports}</td>
                                    <td>${user.canvases}</td>
                                    <td>${user.uploads}</td>
                                    <td>${new Date(user.memberSince).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="analytics-card-updated">
                Last updated: ${data.generatedAt.toLocaleString()}
            </div>
        `;
    },

    // Show analytics error
    showAnalyticsError(message) {
        const loadingDiv = document.querySelector('.analytics-loading');
        const contentDiv = document.querySelector('.analytics-content');
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (contentDiv) {
            contentDiv.style.display = 'block';
            contentDiv.innerHTML = `
                <div class="analytics-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Failed to Load Analytics</h4>
                    <p>${message}</p>
                    <button onclick="window.Analytics.showAnalyticsDashboard()" class="btn primary-btn">
                        <i class="fas fa-refresh"></i>
                        Retry
                    </button>
                </div>
            `;
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other modules to load, especially Auth with Supabase
    const initializeAnalytics = () => {
        if (window.Auth && window.Auth.supabase) {
            window.Analytics.init();
        } else {
            // Keep checking every 500ms for up to 10 seconds
            setTimeout(initializeAnalytics, 500);
        }
    };
    
    setTimeout(initializeAnalytics, 1000);
}); 
