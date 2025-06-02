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

    // Start a new session
    async startSession() {
        this.state.sessionId = this.generateUUID();
        this.state.sessionStart = new Date();
        this.state.lastActivity = new Date();

        // Get current user if authenticated
        if (window.Auth && window.Auth.getCurrentUser) {
            this.state.user = window.Auth.getCurrentUser();
            
            // Load user profile for user_level checking
            if (this.state.user && window.supabase) {
                try {
                    const { data: profile, error } = await window.supabase
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

        // Create session record
        if (this.state.user && window.supabase) {
            try {
                await window.supabase
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

    // Flush events to database
    async flushEvents() {
        if (this.state.eventQueue.length === 0 || !this.state.user) return;

        const events = [...this.state.eventQueue];
        this.state.eventQueue = [];

        try {
            const { error } = await window.supabase
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
        if (window.supabase) {
            try {
                await window.supabase.rpc('update_daily_metrics');
                console.log('✅ Daily metrics updated');
            } catch (error) {
                console.error('❌ Failed to update daily metrics:', error);
            }
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other modules to load
    setTimeout(() => {
        if (window.supabase) {
            window.Analytics.init();
        }
    }, 1000);
}); 
