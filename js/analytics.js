/**
 * FrameIt Analytics Module
 * Tracks user behavior, feature usage, and app performance
 */

window.Analytics = {
    // Configuration
    config: {
        enabled: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        batchSize: 3, // Reduced from 10 to flush more frequently
        flushInterval: 15000, // Reduced from 30 seconds to 15 seconds
        debugMode: true // Enable debug mode to help troubleshoot
    },

    // State
    state: {
        sessionId: null,
        sessionStart: null,
        lastActivity: null,
        eventQueue: [],
        featureTimers: {},
        isInitialized: false,
        user: null,
        deviceInfo: null,
        userProfile: null,
        profileLoaded: false
    },

    // Initialize analytics
    async init() {
        if (this.state.isInitialized) return;

        try {
            // Get device and browser info
            this.state.deviceInfo = this.getDeviceInfo();
            
            // Start session
            await this.startSession();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start periodic flush
            this.startPeriodicFlush();
            
            this.state.isInitialized = true;
            
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

    // Start a new session
    async startSession() {
        this.state.sessionId = this.generateUUID();
        this.state.sessionStart = new Date();
        this.state.lastActivity = new Date();

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

        // Create session record
        if (this.state.user) {
            const supabase = this.getSupabase();
            if (supabase) {
                try {
                    await supabase
                        .from('user_sessions')
                        .insert({
                            user_id: this.state.user.id,
                            session_start: this.state.sessionStart.toISOString(),
                            user_agent: navigator.userAgent,
                            device_type: this.state.deviceInfo.deviceType,
                            browser: this.state.deviceInfo.browser,
                            os: this.state.deviceInfo.os,
                            ip_address: null, // Server-side detection
                            referrer: document.referrer || null
                        });
                } catch (error) {
                    if (this.config.debugMode) {
                        console.log('📊 Failed to create session record:', error);
                    }
                }
            }
        }
    },

    // Called when user profile is loaded
    onProfileLoaded() {
        if (this.config.debugMode) {
            console.log('📊 Profile loaded, checking user level:', this.state.userProfile?.user_level);
        }
        
        // Check if user is dev level and show analytics button
        if (this.hasFeatureAccess('dev')) {
            console.log('🔧 Dev user detected, showing analytics button');
            if (window.App && window.App.showDevAnalyticsButton) {
                window.App.showDevAnalyticsButton();
            }
        } else {
            console.log('👤 User level:', this.state.userProfile?.user_level || 'none');
            if (window.App && window.App.hideDevFeatures) {
                window.App.hideDevFeatures();
            }
        }
        
        // Mark profile as loaded for any waiting functions
        this.state.profileLoaded = true;
    },

    // Track an event
    async trackEvent(eventType, eventName, eventData = null) {
        if (!this.config.enabled || !this.state.user) return;

        const event = {
            user_id: this.state.user.id,
            session_id: this.state.sessionId,
            event_type: eventType,
            event_name: eventName,
            event_data: eventData,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        };

        // Add to queue
        this.state.eventQueue.push(event);
        
        // Update last activity
        this.state.lastActivity = new Date();

        if (this.config.debugMode) {
            console.log('📊 Event tracked:', event);
        }

        // Flush if queue is full
        if (this.state.eventQueue.length >= this.config.batchSize) {
            await this.flushEvents();
        }
    },

    // Track specific app events
    async trackImageUpload(imageData) {
        await this.trackEvent('image_upload', 'file_selected', {
            file_size: imageData.fileSize,
            file_type: imageData.fileType,
            file_name: imageData.fileName,
            source: imageData.source || 'unknown'
        });
        
        // Immediately flush for important events
        await this.flushEvents();
    },

    async trackCanvasCreated(canvasData) {
        await this.trackEvent('canvas', 'canvas_created', {
            template: canvasData.template,
            dimensions: canvasData.dimensions,
            background: canvasData.background
        });
        
        // Immediately flush for important events
        await this.flushEvents();
    },

    async trackExport(exportData) {
        await this.trackEvent('export', 'image_exported', {
            format: exportData.format,
            size: exportData.size,
            file_size_bytes: exportData.fileSizeBytes,
            width: exportData.settings?.width,
            height: exportData.settings?.height,
            quality: exportData.settings?.quality
        });
        
        // Immediately flush for important events
        await this.flushEvents();
    },

    // Flush events to database
    async flushEvents() {
        if (this.state.eventQueue.length === 0 || !this.state.user) return;

        const events = [...this.state.eventQueue];
        this.state.eventQueue = [];

        try {
            const supabase = this.getSupabase();
            if (!supabase) {
                throw new Error('Supabase client not available');
            }

            const { error } = await supabase
                .from('user_events')
                .insert(events);

            if (error) throw error;

            if (this.config.debugMode) {
                console.log(`📊 Flushed ${events.length} events`);
            }
        } catch (error) {
            console.error('Failed to flush events:', error);
            // Put events back in queue
            this.state.eventQueue.unshift(...events);
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flushEvents();
            } else {
                this.state.lastActivity = new Date();
            }
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            this.flushEvents();
        });

        // Track user activity
        ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.state.lastActivity = new Date();
            }, { passive: true });
        });
    },

    // Start periodic flush
    startPeriodicFlush() {
        setInterval(() => {
            this.flushEvents();
            
            // Check for session timeout
            const now = new Date();
            if (now - this.state.lastActivity > this.config.sessionTimeout) {
                this.startSession();
            }
        }, this.config.flushInterval);
    },

    // Get device and browser information
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect device type
        let deviceType = 'desktop';
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            deviceType = 'tablet';
        } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            deviceType = 'mobile';
        }

        // Detect browser
        let browser = 'unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';

        // Detect OS
        let os = 'unknown';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        return {
            deviceType,
            browser,
            os,
            userAgent,
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
    },

    // Generate UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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

    // Manual flush for testing (accessible via console)
    async manualFlush() {
        console.log('🔧 Manual flush triggered');
        await this.flushEvents();
        
        // Also update daily metrics
        const supabase = this.getSupabase();
        if (supabase) {
            try {
                await supabase.rpc('update_daily_metrics');
                console.log('✅ Daily metrics updated');
            } catch (error) {
                console.error('❌ Failed to update daily metrics:', error);
            }
        }
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

        // Fetch various analytics data in parallel
        const [
            userStats,
            eventStats,
            dailyMetrics,
            recentEvents
        ] = await Promise.all([
            this.getUserStats(),
            this.getEventStats(),
            this.getDailyMetrics(),
            this.getRecentEvents()
        ]);

        return {
            userStats,
            eventStats,
            dailyMetrics,
            recentEvents,
            generatedAt: new Date()
        };
    },

    // Get user statistics
    async getUserStats() {
        const supabase = this.getSupabase();
        const { data, error } = await supabase
            .from('profiles')
            .select('user_level, created_at')
            .neq('user_level', null);

        if (error) throw error;

        const stats = {
            totalUsers: data.length,
            devUsers: data.filter(u => u.user_level === 'dev').length,
            betaUsers: data.filter(u => u.user_level === 'beta').length,
            standardUsers: data.filter(u => u.user_level === 'standard').length
        };

        return stats;
    },

    // Get event statistics
    async getEventStats() {
        const supabase = this.getSupabase();
        const { data, error } = await supabase
            .from('user_events')
            .select('event_type, event_name, created_at')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const stats = {
            totalEvents: data.length,
            eventsByType: {},
            dailyEvents: {}
        };

        // Group by event type
        data.forEach(event => {
            stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;
            
            // Group by day
            const day = event.created_at.split('T')[0];
            stats.dailyEvents[day] = (stats.dailyEvents[day] || 0) + 1;
        });

        return stats;
    },

    // Get daily metrics
    async getDailyMetrics() {
        const supabase = this.getSupabase();
        const { data, error } = await supabase
            .from('daily_metrics')
            .select('*')
            .order('date', { ascending: false })
            .limit(30);

        if (error) throw error;
        return data || [];
    },

    // Get recent events
    async getRecentEvents() {
        const supabase = this.getSupabase();
        const { data, error } = await supabase
            .from('user_events')
            .select('event_type, event_name, event_data, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data || [];
    },

    // Render analytics dashboard
    renderAnalyticsDashboard(data) {
        const loadingDiv = document.querySelector('.analytics-loading');
        const contentDiv = document.querySelector('.analytics-content');
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'block';
        
        contentDiv.innerHTML = `
            <div class="analytics-section">
                <h4><i class="fas fa-users"></i> User Statistics</h4>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-users"></i></div>
                        <div class="analytics-card-value">${data.userStats.totalUsers}</div>
                        <div class="analytics-card-label">Total Users</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-code"></i></div>
                        <div class="analytics-card-value">${data.userStats.devUsers}</div>
                        <div class="analytics-card-label">Dev Users</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-flask"></i></div>
                        <div class="analytics-card-value">${data.userStats.betaUsers}</div>
                        <div class="analytics-card-label">Beta Users</div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-user"></i></div>
                        <div class="analytics-card-value">${data.userStats.standardUsers}</div>
                        <div class="analytics-card-label">Standard Users</div>
                    </div>
                </div>
            </div>
            
            <div class="analytics-section">
                <h4><i class="fas fa-chart-line"></i> Event Statistics (Last 7 Days)</h4>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-card-icon"><i class="fas fa-mouse-pointer"></i></div>
                        <div class="analytics-card-value">${data.eventStats.totalEvents}</div>
                        <div class="analytics-card-label">Total Events</div>
                    </div>
                    ${Object.entries(data.eventStats.eventsByType).map(([type, count]) => `
                        <div class="analytics-card">
                            <div class="analytics-card-icon"><i class="fas fa-tag"></i></div>
                            <div class="analytics-card-value">${count}</div>
                            <div class="analytics-card-label">${type}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="analytics-section">
                <h4><i class="fas fa-history"></i> Recent Events</h4>
                <div class="analytics-events-list">
                    ${data.recentEvents.slice(0, 20).map(event => `
                        <div class="analytics-event">
                            <div class="event-icon"><i class="fas fa-circle"></i></div>
                            <div class="event-content">
                                <div class="event-title">${event.event_type}: ${event.event_name}</div>
                                <div class="event-time">${new Date(event.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('')}
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
