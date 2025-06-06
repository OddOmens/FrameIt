/**
 * FrameIt Analytics Module
 * Tracks user behavior using simplified profiles and global tables
 * 
 * DEV USER EXCLUSION FEATURE:
 * Users with user_level = 'dev' have their personal analytics tracked normally,
 * but their activity is excluded from global statistics to prevent skewing
 * production metrics during development and testing.
 * 
 * - Personal stats: Always tracked for all users (including dev)
 * - Global stats: Exclude dev users from totals
 * - Dev analytics: Show both global stats (non-dev) and dev user breakdown
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

    // Manual upload count update (fallback)
    async manualUpdateUploadCount() {
        try {
            const supabase = this.getSupabase();
            if (!supabase || !this.state.user) {
                return { success: false, reason: 'Not authenticated or no supabase' };
            }

            console.log('📊 Starting manual upload count update...');
            console.log('📊 Current user:', this.state.user.id);
            
            // Get current profile with user_level
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('upload_count, user_level')
                .eq('id', this.state.user.id)
                .single();

            console.log('📊 Current profile fetch result:', { profile, fetchError });

            if (fetchError) {
                console.error('Failed to fetch current upload count:', fetchError);
                return { success: false, error: fetchError.message };
            }

            const newUploadCount = (profile.upload_count || 0) + 1;
            console.log('📊 Updating upload count from', profile.upload_count, 'to', newUploadCount);

            // Update profile
            const { data: updateData, error: updateError } = await supabase
                .from('profiles')
                .update({ upload_count: newUploadCount })
                .eq('id', this.state.user.id)
                .select();

            console.log('📊 Profile update result:', { updateData, updateError });

            if (updateError) {
                console.error('Failed to update upload count:', updateError);
                return { success: false, error: updateError.message };
            }

            console.log('✅ Upload count updated manually to:', newUploadCount);
            
            // Update global stats only if user is not dev
            if (profile.user_level !== 'dev') {
                console.log('📊 Updating global upload count (non-dev user)...');
                await this.updateGlobalUploadCount();
            } else {
                console.log('📊 Skipping global upload count update (dev user)');
            }

            return { success: true, data: { new_upload_count: newUploadCount } };

        } catch (error) {
            console.error('❌ Manual upload count update failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Update global upload count
    async updateGlobalUploadCount() {
        try {
            const supabase = this.getSupabase();
            console.log('📊 Starting global upload count update...');
            
            const { data: currentStats, error: fetchError } = await supabase
                .from('global')
                .select('total_uploads')
                .single();

            console.log('📊 Current global stats fetch result:', { currentStats, fetchError });

            if (fetchError) {
                console.warn('Could not fetch global stats for upload update:', fetchError);
                return;
            }

            const newTotalUploads = (currentStats.total_uploads || 0) + 1;
            console.log('📊 Updating global uploads from', currentStats.total_uploads, 'to', newTotalUploads);

            const { data: updateData, error: updateError } = await supabase
                .from('global')
                .update({ total_uploads: newTotalUploads })
                .eq('id', 1)
                .select();

            console.log('📊 Global stats update result:', { updateData, updateError });

            if (updateError) {
                console.warn('Could not update global upload count:', updateError);
            } else {
                console.log('✅ Global upload count updated successfully');
            }

        } catch (error) {
            console.warn('Error updating global upload count:', error);
        }
    },

    // Manual canvas count update (fallback)
    async manualUpdateCanvasCount() {
        try {
            const supabase = this.getSupabase();
            if (!supabase || !this.state.user) {
                return { success: false, reason: 'Not authenticated or no supabase' };
            }

            console.log('📊 Starting manual canvas count update...');
            console.log('📊 Current user:', this.state.user.id);
            
            // Get current profile with user_level
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('canvas_count, user_level')
                .eq('id', this.state.user.id)
                .single();

            if (fetchError) {
                console.error('Failed to fetch current canvas count:', fetchError);
                return { success: false, error: fetchError.message };
            }

            const newCanvasCount = (profile.canvas_count || 0) + 1;
            console.log('📊 Updating canvas count from', profile.canvas_count, 'to', newCanvasCount);

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ canvas_count: newCanvasCount })
                .eq('id', this.state.user.id);

            if (updateError) {
                console.error('Failed to update canvas count:', updateError);
                return { success: false, error: updateError.message };
            }

            console.log('✅ Canvas count updated manually to:', newCanvasCount);
            
            // Update global stats only if user is not dev
            if (profile.user_level !== 'dev') {
                console.log('📊 Updating global canvas count (non-dev user)...');
                await this.updateGlobalCanvasCount();
            } else {
                console.log('📊 Skipping global canvas count update (dev user)');
            }

            return { success: true, data: { new_canvas_count: newCanvasCount } };

        } catch (error) {
            console.error('❌ Manual canvas count update failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Update global canvas count
    async updateGlobalCanvasCount() {
        try {
            const supabase = this.getSupabase();
            console.log('📊 Starting global canvas count update...');
            
            const { data: currentStats, error: fetchError } = await supabase
                .from('global')
                .select('total_canvases')
                .single();

            if (fetchError) {
                console.warn('Could not fetch global stats for canvas update:', fetchError);
                return;
            }

            const newTotalCanvases = (currentStats.total_canvases || 0) + 1;
            console.log('📊 Updating global canvases from', currentStats.total_canvases, 'to', newTotalCanvases);

            const { error: updateError } = await supabase
                .from('global')
                .update({ total_canvases: newTotalCanvases })
                .eq('id', 1);

            if (updateError) {
                console.warn('Could not update global canvas count:', updateError);
            } else {
                console.log('✅ Global canvas count updated successfully');
            }

        } catch (error) {
            console.warn('Error updating global canvas count:', error);
        }
    },

    // Track image upload
    async trackImageUpload() {
        console.log('📊 === trackImageUpload START ===');
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

            console.log('📊 Supabase client confirmed, calling increment_upload_count...');
            console.log('📊 Function parameters:', { user_id: currentUser.id });
            
            const startTime = Date.now();
            const { data, error } = await supabase.rpc('increment_upload_count', {
                user_id: currentUser.id
            });
            const endTime = Date.now();

            console.log(`📊 Function call completed in ${endTime - startTime}ms`);
            console.log('📊 Raw response data:', data);
            console.log('📊 Raw response error:', error);

            if (error) {
                if (error.message.includes('function increment_upload_count() does not exist')) {
                    console.warn('⚠️ Upload count function not available, using manual update');
                    return await this.manualUpdateUploadCount();
                } else {
                console.error('📊 Upload tracking error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
                }
            }

            console.log('📊 Upload tracked successfully, response:', data);
            console.log('📊 === trackImageUpload END SUCCESS ===');
            return { success: true, data: data };

        } catch (error) {
            console.error('📊 === trackImageUpload END ERROR ===');
            console.error('📊 Failed to track upload:', error);
            console.error('📊 Error details:', {
                message: error.message,
                stack: error.stack,
                user: currentUser,
                timestamp: new Date().toISOString()
            });
            return { success: false, error: error.message };
        }
    },

    // Track canvas creation
    async trackCanvasCreated() {
        console.log('📊 trackCanvasCreated called');
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
                console.log('📊 No user found in Auth module either - skipping canvas tracking');
                return { success: false, reason: 'No user logged in' };
            }
        }

        console.log('📊 User found:', currentUser.id);

        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                console.error('📊 Supabase not available for canvas tracking');
                return { success: false, reason: 'Supabase not available' };
            }

            console.log('📊 Calling increment_canvas_count with user_id:', currentUser.id);

            const { data, error } = await supabase.rpc('increment_canvas_count', {
                user_id: currentUser.id
            });

            if (error) {
                if (error.message.includes('function increment_canvas_count() does not exist')) {
                    console.warn('⚠️ Canvas count function not available, using manual update');
                    return await this.manualUpdateCanvasCount();
                } else {
                console.error('📊 Canvas tracking error:', error);
                throw error;
                }
            }

            console.log('📊 Canvas tracked successfully:', data);
            return { success: true, data: data };

        } catch (error) {
            console.error('📊 Failed to track canvas creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if current user is a dev user
    async isDevUser() {
        if (!this.state.user) return false;
        
        // Check user level from profile (database-driven only)
        if (this.state.userProfile && this.state.userProfile.user_level === 'dev') {
            return true;
        }
        
        // If profile not loaded yet, try to fetch it
        if (!this.state.userProfile) {
            const supabase = this.getSupabase();
            if (supabase && this.state.user) {
                try {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('user_level')
                        .eq('id', this.state.user.id)
                        .single();
                    
                    if (!error && profile) {
                        return profile.user_level === 'dev';
                    }
                } catch (error) {
                    console.log('📊 Could not fetch user profile for dev check');
                }
            }
        }
        
        return false;
    },

    // Manual export count update (fallback)
    async manualUpdateExportCount() {
        try {
            const supabase = this.getSupabase();
            if (!supabase || !this.state.user) {
                return { success: false, reason: 'Not authenticated or no supabase' };
            }

            console.log('📊 Starting manual export count update...');
            console.log('📊 Current user:', this.state.user.id);
            
            // Get current profile with user_level
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('export_count, user_level')
                .eq('id', this.state.user.id)
                .single();

            console.log('📊 Current profile fetch result:', { profile, fetchError });

            if (fetchError) {
                console.error('Failed to fetch current export count:', fetchError);
                return { success: false, error: fetchError.message };
            }

            const newExportCount = (profile.export_count || 0) + 1;
            console.log('📊 Updating export count from', profile.export_count, 'to', newExportCount);

            // Update profile
            const { data: updateData, error: updateError } = await supabase
                .from('profiles')
                .update({ export_count: newExportCount })
                .eq('id', this.state.user.id)
                .select();

            console.log('📊 Profile update result:', { updateData, updateError });

            if (updateError) {
                console.error('Failed to update export count:', updateError);
                return { success: false, error: updateError.message };
            }

            console.log('✅ Export count updated manually to:', newExportCount);
            
            // Update global stats only if user is not dev
            if (profile.user_level !== 'dev') {
                console.log('📊 Updating global export count (non-dev user)...');
                await this.updateGlobalExportCount();
            } else {
                console.log('📊 Skipping global export count update (dev user)');
            }

            return { success: true, data: { new_export_count: newExportCount } };

        } catch (error) {
            console.error('❌ Manual export count update failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Update global export count
    async updateGlobalExportCount() {
        try {
            const supabase = this.getSupabase();
            console.log('📊 Starting global export count update...');
            
            const { data: currentStats, error: fetchError } = await supabase
                .from('global')
                .select('total_exports')
                .single();

            console.log('📊 Current global stats fetch result:', { currentStats, fetchError });

            if (fetchError) {
                console.warn('Could not fetch global stats for export update:', fetchError);
                return;
            }

            const newTotalExports = (currentStats.total_exports || 0) + 1;
            console.log('📊 Updating global exports from', currentStats.total_exports, 'to', newTotalExports);

            const { data: updateData, error: updateError } = await supabase
                .from('global')
                .update({ total_exports: newTotalExports })
                .eq('id', 1)
                .select();

            console.log('📊 Global stats update result:', { updateData, updateError });

            if (updateError) {
                console.warn('Could not update global export count:', updateError);
            } else {
                console.log('✅ Global export count updated successfully');
            }

        } catch (error) {
            console.warn('Error updating global export count:', error);
        }
    },

    // Track export
    async trackExport() {
        console.log('📊 trackExport called');
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
                console.log('📊 No user found in Auth module either - skipping export tracking');
                return { success: false, reason: 'No user logged in' };
            }
        }

        console.log('📊 User found:', currentUser.id);

        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                console.error('📊 Supabase not available for export tracking');
                return { success: false, reason: 'Supabase not available' };
            }

            console.log('📊 Calling increment_export_count with user_id:', currentUser.id);

            const { data, error } = await supabase.rpc('increment_export_count', {
                user_id: currentUser.id
            });

            if (error) {
                if (error.message.includes('function increment_export_count() does not exist')) {
                    console.warn('⚠️ Export count function not available, using manual update');
                    return await this.manualUpdateExportCount();
                } else {
                console.error('📊 Export tracking error:', error);
                throw error;
                }
            }

            console.log('📊 Export tracked successfully:', data);
            return { success: true, data: data };
            
        } catch (error) {
            console.error('📊 Failed to track export:', error);
            return { success: false, error: error.message };
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

        // Filter out dev users for global statistics
        const nonDevUsers = data.filter(u => u.user_level !== 'dev');

        // Calculate user level breakdown (excluding dev users from totals)
        const stats = {
            totalUsers: nonDevUsers.length,
            devUsers: data.filter(u => u.user_level === 'dev').length, // Still show dev count for analytics
            betaUsers: nonDevUsers.filter(u => u.user_level === 'beta').length,
            standardUsers: nonDevUsers.filter(u => u.user_level === 'standard').length,
            topUsers: data // Include all users in top users list for dev analytics
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

        console.log('📊 User stats calculated (dev users excluded from totals):', {
            totalProfiles: data.length,
            devUsersExcluded: data.length - nonDevUsers.length,
            stats
        });

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
    },

    // Test function to verify dev user exclusion (for debugging)
    async testDevUserExclusion() {
        if (!this.hasFeatureAccess('dev')) {
            console.warn('📊 Test function only available for dev users');
            return;
        }

        console.log('📊 Testing dev user exclusion...');
        
        try {
            const supabase = this.getSupabase();
            
            // Get all profiles
            const { data: allProfiles, error } = await supabase
                .from('profiles')
                .select('user_level, export_count, canvas_count, upload_count')
                .not('user_level', 'is', null);
            
            if (error) throw error;
            
            // Calculate stats with and without dev users
            const allUsersStats = {
                total_users: allProfiles.length,
                total_exports: allProfiles.reduce((sum, p) => sum + (p.export_count || 0), 0),
                total_canvases: allProfiles.reduce((sum, p) => sum + (p.canvas_count || 0), 0),
                total_uploads: allProfiles.reduce((sum, p) => sum + (p.upload_count || 0), 0)
            };
            
            const nonDevProfiles = allProfiles.filter(p => p.user_level !== 'dev');
            const nonDevStats = {
                total_users: nonDevProfiles.length,
                total_exports: nonDevProfiles.reduce((sum, p) => sum + (p.export_count || 0), 0),
                total_canvases: nonDevProfiles.reduce((sum, p) => sum + (p.canvas_count || 0), 0),
                total_uploads: nonDevProfiles.reduce((sum, p) => sum + (p.upload_count || 0), 0)
            };
            
            const devUsers = allProfiles.filter(p => p.user_level === 'dev');
            const devStats = {
                count: devUsers.length,
                total_exports: devUsers.reduce((sum, p) => sum + (p.export_count || 0), 0),
                total_canvases: devUsers.reduce((sum, p) => sum + (p.canvas_count || 0), 0),
                total_uploads: devUsers.reduce((sum, p) => sum + (p.upload_count || 0), 0)
            };
            
            console.log('📊 Dev User Exclusion Test Results:');
            console.log('📊 All Users Stats:', allUsersStats);
            console.log('📊 Non-Dev Users Stats (what shows in global):', nonDevStats);
            console.log('📊 Dev Users Stats (excluded from global):', devStats);
            console.log('📊 Difference (dev user activity excluded):', {
                users: allUsersStats.total_users - nonDevStats.total_users,
                exports: allUsersStats.total_exports - nonDevStats.total_exports,
                canvases: allUsersStats.total_canvases - nonDevStats.total_canvases,
                uploads: allUsersStats.total_uploads - nonDevStats.total_uploads
            });
            
            return {
                allUsersStats,
                nonDevStats,
                devStats,
                exclusionWorking: devUsers.length > 0 && nonDevStats.total_users < allUsersStats.total_users
            };
            
        } catch (error) {
            console.error('📊 Test failed:', error);
            return { error: error.message };
        }
    },
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
