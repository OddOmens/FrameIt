/**
 * FrameIt Analytics Module
 * Tracks user behavior, feature usage, and app performance
 */

window.Analytics = {
    // Configuration
    config: {
        enabled: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        batchSize: 10,
        flushInterval: 30000, // 30 seconds
        debugMode: false
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
        deviceInfo: null
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
        }

        // Track session start
        if (this.state.user) {
            try {
                const { data, error } = await window.supabase
                    .from('user_sessions')
                    .insert({
                        user_id: this.state.user.id,
                        session_start: this.state.sessionStart.toISOString(),
                        user_agent: navigator.userAgent,
                        device_type: this.state.deviceInfo.deviceType,
                        browser: this.state.deviceInfo.browser,
                        os: this.state.deviceInfo.os,
                        referrer: document.referrer || null,
                        page_views: 1
                    })
                    .select()
                    .single();

                if (error) throw error;
                
                if (this.config.debugMode) {
                    console.log('📊 Session started:', data);
                }
            } catch (error) {
                console.error('Failed to start session:', error);
            }
        }
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

    // Track feature usage with timing
    startFeatureTimer(featureName) {
        this.state.featureTimers[featureName] = {
            startTime: Date.now(),
            featureName: featureName
        };
    },

    async endFeatureTimer(featureName, additionalData = null) {
        const timer = this.state.featureTimers[featureName];
        if (!timer) return;

        const timeSpent = Math.round((Date.now() - timer.startTime) / 1000); // seconds
        delete this.state.featureTimers[featureName];

        // Track the feature usage
        await this.trackEvent('feature_use', featureName, {
            time_spent_seconds: timeSpent,
            ...additionalData
        });

        // Update feature usage in database
        if (this.state.user) {
            try {
                await window.supabase.rpc('update_feature_usage', {
                    p_user_id: this.state.user.id,
                    p_feature_name: featureName,
                    p_time_spent_seconds: timeSpent
                });
            } catch (error) {
                console.error('Failed to update feature usage:', error);
            }
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
    },

    async trackExport(exportData) {
        await this.trackEvent('export', 'image_exported', {
            format: exportData.format,
            size: exportData.size,
            file_size_bytes: exportData.fileSizeBytes,
            settings: exportData.settings
        });
    },

    async trackCanvasCreated(canvasData) {
        await this.trackEvent('canvas', 'canvas_created', {
            template: canvasData.template,
            dimensions: canvasData.dimensions,
            background: canvasData.background
        });
    },

    async trackTextAdded(textData) {
        await this.trackEvent('text', 'text_layer_added', {
            font_family: textData.fontFamily,
            font_size: textData.fontSize,
            text_length: textData.text ? textData.text.length : 0
        });
    },

    async trackBackgroundChanged(backgroundData) {
        await this.trackEvent('background', 'background_changed', {
            type: backgroundData.type, // 'color', 'gradient', 'image'
            value: backgroundData.value
        });
    },

    async trackError(errorData) {
        await this.trackEvent('error', 'javascript_error', {
            error_message: errorData.message,
            error_stack: errorData.stack,
            error_type: errorData.type || 'unknown'
        });

        // Also log to error_logs table
        if (this.state.user) {
            try {
                await window.supabase
                    .from('error_logs')
                    .insert({
                        user_id: this.state.user.id,
                        error_type: 'javascript',
                        error_message: errorData.message,
                        error_stack: errorData.stack,
                        page_url: window.location.href,
                        user_agent: navigator.userAgent,
                        browser_info: this.state.deviceInfo
                    });
            } catch (error) {
                console.error('Failed to log error:', error);
            }
        }
    },

    async trackPerformance(metricType, metricValue, additionalData = null) {
        if (!this.state.user) return;

        try {
            await window.supabase
                .from('performance_metrics')
                .insert({
                    user_id: this.state.user.id,
                    metric_type: metricType,
                    metric_value: metricValue,
                    page_url: window.location.href,
                    additional_data: additionalData
                });
        } catch (error) {
            console.error('Failed to track performance:', error);
        }
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

    // End current session
    async endSession() {
        if (!this.state.sessionId || !this.state.user) return;

        const sessionEnd = new Date();
        const duration = Math.round((sessionEnd - this.state.sessionStart) / 1000);

        try {
            // Flush any remaining events
            await this.flushEvents();

            // Update session end time
            await window.supabase
                .from('user_sessions')
                .update({
                    session_end: sessionEnd.toISOString(),
                    duration_seconds: duration
                })
                .eq('user_id', this.state.user.id)
                .eq('session_start', this.state.sessionStart.toISOString());

            if (this.config.debugMode) {
                console.log('📊 Session ended, duration:', duration, 'seconds');
            }
        } catch (error) {
            console.error('Failed to end session:', error);
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
            this.endSession();
            this.flushEvents();
        });

        // Track user activity
        ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.state.lastActivity = new Date();
            }, { passive: true });
        });

        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            this.trackError({
                message: event.message,
                stack: event.error?.stack,
                type: 'javascript_error'
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                type: 'promise_rejection'
            });
        });
    },

    // Start periodic flush
    startPeriodicFlush() {
        setInterval(() => {
            this.flushEvents();
            
            // Check for session timeout
            const now = new Date();
            if (now - this.state.lastActivity > this.config.sessionTimeout) {
                this.endSession();
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
        
        // For now, simple email-based check
        // You can expand this to check subscription tiers, user roles, etc.
        const devEmails = ['hello@medusast.one', 'admin@frameit.app'];
        return devEmails.includes(this.state.user.email);
    },

    // Show analytics dashboard (for dev users)
    async showAnalyticsDashboard() {
        if (!this.hasFeatureAccess('dev')) {
            console.warn('Analytics dashboard access denied');
            return;
        }

        // Create and show analytics modal
        const modal = document.createElement('div');
        modal.className = 'modal visible';
        modal.id = 'analytics-dashboard';
        modal.style.zIndex = '10001';

        try {
            // Fetch analytics data
            const { data: dailyMetrics } = await window.supabase
                .from('daily_metrics')
                .select('*')
                .order('date', { ascending: false })
                .limit(30);

            const { data: featureUsage } = await window.supabase
                .from('feature_popularity')
                .select('*');

            modal.innerHTML = `
                <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3><i class="fas fa-chart-bar"></i> Analytics Dashboard</h3>
                        <button class="modal-close-btn" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                                <h4>Daily Active Users</h4>
                                <div style="font-size: 24px; font-weight: bold; color: #007bff;">
                                    ${dailyMetrics?.[0]?.active_users || 0}
                                </div>
                                <small>Today</small>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                                <h4>Total Exports</h4>
                                <div style="font-size: 24px; font-weight: bold; color: #28a745;">
                                    ${dailyMetrics?.reduce((sum, day) => sum + (day.total_exports || 0), 0) || 0}
                                </div>
                                <small>Last 30 days</small>
                            </div>
                        </div>
                        
                        <h4>Feature Usage</h4>
                        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
                            ${featureUsage?.map(feature => `
                                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: between;">
                                    <span>${feature.feature_name}</span>
                                    <span style="margin-left: auto; font-weight: bold;">${feature.total_usage}</span>
                                </div>
                            `).join('') || '<p style="padding: 20px; text-align: center;">No data available</p>'}
                        </div>
                        
                        <div style="margin-top: 20px; text-align: center;">
                            <small style="color: #666;">
                                Session ID: ${this.state.sessionId}<br>
                                Events in queue: ${this.state.eventQueue.length}
                            </small>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

        } catch (error) {
            console.error('Failed to load analytics dashboard:', error);
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Analytics Dashboard</h3>
                        <button class="modal-close-btn" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Failed to load analytics data.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    },

    // Enable/disable analytics
    setEnabled(enabled) {
        this.config.enabled = enabled;
        if (this.config.debugMode) {
            console.log('📊 Analytics', enabled ? 'enabled' : 'disabled');
        }
    },

    // Enable/disable debug mode
    setDebugMode(debug) {
        this.config.debugMode = debug;
        console.log('📊 Analytics debug mode', debug ? 'enabled' : 'disabled');
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

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.Analytics;
} 