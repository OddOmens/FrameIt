/**
 * Stripe Payment Integration for FrameIt
 * Handles subscription management, checkout, and feature access control
 */

console.log('💳 Stripe.js file loaded successfully');

window.StripeManager = {
    stripe: null,
    supabase: null,
    isInitialized: false,
    currentSubscription: null,
    
    // Stripe configuration
    config: {
        publishableKey: 'pk_test_51234567890abcdef...', // Replace with your actual Stripe publishable key
        products: {
            pro: {
                priceId: 'price_1234567890abcdef', // Replace with your actual price ID
                name: 'Pro',
                price: 9.00,
                interval: 'month',
                features: [
                    'Unlimited exports',
                    'Premium templates', 
                    '4K resolution exports',
                    'No watermarks',
                    'Advanced effects',
                    'Priority support'
                ]
            },
            team: {
                priceId: 'price_0987654321fedcba', // Replace with your actual price ID
                name: 'Team',
                price: 29.00,
                interval: 'month',
                features: [
                    'Everything in Pro',
                    'Team collaboration',
                    'Shared template library',
                    'Brand kit management',
                    'Usage analytics',
                    'API access',
                    'Custom integrations'
                ]
            }
        }
    },
    
    // Initialize Stripe
    async init() {
        console.log('💳 Initializing Stripe...');
        
        try {
            // Get Supabase instance from Auth module
            if (window.Auth && window.Auth.supabase) {
                this.supabase = window.Auth.supabase;
            } else {
                console.error('❌ Supabase not available');
                return false;
            }
            
            // Initialize Stripe (you'll need to include Stripe.js in your HTML)
            if (typeof Stripe !== 'undefined') {
                this.stripe = Stripe(this.config.publishableKey);
                this.isInitialized = true;
                console.log('✅ Stripe initialized successfully');
                
                // Load current subscription status
                await this.loadSubscriptionStatus();
                
                // Setup event listeners
                this.setupEventListeners();
                
                return true;
            } else {
                console.error('❌ Stripe.js not loaded. Please include <script src="https://js.stripe.com/v3/"></script>');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to initialize Stripe:', error);
            return false;
        }
    },
    
    // Setup event listeners for payment buttons
    setupEventListeners() {
        // Subscribe to Pro button
        const subscribeProBtn = document.getElementById('subscribe-pro');
        if (subscribeProBtn) {
            subscribeProBtn.addEventListener('click', () => this.subscribeToPlan('pro'));
        }
        
        // Subscribe to Team button  
        const subscribeTeamBtn = document.getElementById('subscribe-team');
        if (subscribeTeamBtn) {
            subscribeTeamBtn.addEventListener('click', () => this.subscribeToPlan('team'));
        }
        
        // Manage subscription button
        const manageSubBtn = document.getElementById('manage-subscription-btn');
        if (manageSubBtn) {
            manageSubBtn.addEventListener('click', () => this.openCustomerPortal());
        }
        
        // Cancel subscription button
        const cancelSubBtn = document.getElementById('cancel-subscription-btn');
        if (cancelSubBtn) {
            cancelSubBtn.addEventListener('click', () => this.cancelSubscription());
        }
    },
    
    // Load current subscription status from database
    async loadSubscriptionStatus() {
        if (!this.supabase || !window.Auth.getCurrentUser()) return null;
        
        try {
            const { data: subscription, error } = await this.supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', window.Auth.getCurrentUser().id)
                .maybeSingle();
                
            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error loading subscription:', error);
                return null;
            }
            
            this.currentSubscription = subscription;
            console.log('📊 Current subscription:', subscription);
            
            // Update UI based on subscription status
            this.updateSubscriptionUI();
            
            return subscription;
        } catch (error) {
            console.error('❌ Failed to load subscription status:', error);
            return null;
        }
    },
    
    // Subscribe to a plan
    async subscribeToPlan(planType) {
        if (!this.isInitialized) {
            console.error('❌ Stripe not initialized');
            return;
        }
        
        const user = window.Auth.getCurrentUser();
        if (!user) {
            console.error('❌ User not authenticated');
            window.Auth.showLoginModal();
            return;
        }
        
        const button = document.getElementById(`subscribe-${planType}`);
        if (button) {
            this.setButtonLoading(button, true);
        }
        
        try {
            console.log(`💳 Starting subscription to ${planType} plan...`);
            
            // Create checkout session via your backend API
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token || user.session?.access_token}`
                },
                body: JSON.stringify({
                    plan: planType,
                    priceId: this.config.products[planType].priceId,
                    userId: user.id,
                    userEmail: user.email
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const { sessionId, error } = await response.json();
            
            if (error) {
                throw new Error(error);
            }
            
            // Redirect to Stripe Checkout
            const { error: stripeError } = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });
            
            if (stripeError) {
                throw new Error(stripeError.message);
            }
            
        } catch (error) {
            console.error('❌ Subscription error:', error);
            this.showNotification('❌ Payment failed. Please try again.', 'error');
        } finally {
            if (button) {
                this.setButtonLoading(button, false);
            }
        }
    },
    
    // Open Stripe Customer Portal for subscription management
    async openCustomerPortal() {
        if (!this.currentSubscription?.stripe_customer_id) {
            console.error('❌ No customer ID found');
            return;
        }
        
        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.Auth.getCurrentUser()?.access_token}`
                },
                body: JSON.stringify({
                    customerId: this.currentSubscription.stripe_customer_id,
                    returnUrl: window.location.origin
                })
            });
            
            const { url } = await response.json();
            window.location.href = url;
            
        } catch (error) {
            console.error('❌ Error opening customer portal:', error);
            this.showNotification('❌ Unable to open billing portal. Please try again.', 'error');
        }
    },
    
    // Cancel subscription
    async cancelSubscription() {
        if (!this.currentSubscription?.stripe_subscription_id) {
            console.error('❌ No subscription ID found');
            return;
        }
        
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.Auth.getCurrentUser()?.access_token}`
                },
                body: JSON.stringify({
                    subscriptionId: this.currentSubscription.stripe_subscription_id
                })
            });
            
            if (response.ok) {
                this.showNotification('✅ Subscription cancelled successfully', 'success');
                await this.loadSubscriptionStatus();
            } else {
                throw new Error('Failed to cancel subscription');
            }
            
        } catch (error) {
            console.error('❌ Error cancelling subscription:', error);
            this.showNotification('❌ Unable to cancel subscription. Please try again.', 'error');
        }
    },
    
    // Check if user has access to premium features
    hasFeatureAccess(feature) {
        if (!this.currentSubscription) return false;
        
        const subscription = this.currentSubscription;
        const now = new Date();
        const periodEnd = new Date(subscription.current_period_end);
        
        // Check if subscription is active and not expired
        if (subscription.status === 'active' && periodEnd > now) {
            const planFeatures = {
                pro: ['unlimited_exports', 'premium_templates', '4k_exports', 'no_watermarks', 'advanced_effects'],
                team: ['unlimited_exports', 'premium_templates', '4k_exports', 'no_watermarks', 'advanced_effects', 'team_collaboration', 'api_access', 'analytics']
            };
            
            return planFeatures[subscription.plan_name]?.includes(feature) || false;
        }
        
        return false;
    },
    
    // Get current plan information
    getCurrentPlan() {
        if (!this.currentSubscription) {
            return {
                name: 'free',
                displayName: 'Free',
                active: true,
                features: ['5 exports per month', 'Basic templates', 'Standard resolution']
            };
        }
        
        const subscription = this.currentSubscription;
        const plan = this.config.products[subscription.plan_name];
        
        return {
            name: subscription.plan_name,
            displayName: plan?.name || subscription.plan_name,
            active: subscription.status === 'active',
            periodEnd: subscription.current_period_end,
            features: plan?.features || []
        };
    },
    
    // Update UI based on subscription status
    updateSubscriptionUI() {
        const currentPlan = this.getCurrentPlan();
        
        // Update user level in profiles table if needed
        this.syncUserLevel(currentPlan.name);
        
        // Update pricing modal
        this.updatePricingModal(currentPlan);
        
        // Update account settings
        this.updateAccountSettings(currentPlan);
        
        // Update feature access
        this.updateFeatureAccess(currentPlan);
    },
    
    // Sync subscription status with user level in profiles table
    async syncUserLevel(planName) {
        if (!this.supabase || !window.Auth.getCurrentUser()) return;
        
        try {
            // First, check if the user level has been manually set
            const { data: currentProfile, error: fetchError } = await this.supabase
                .from('profiles')
                .select('user_level, level_manually_set')
                .eq('id', window.Auth.getCurrentUser().id)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('❌ Error fetching current profile:', fetchError);
                return;
            }
            
            // If user level has been manually set, don't override it
            if (currentProfile?.level_manually_set === true) {
                console.log('🔒 User level manually set, skipping automatic sync');
                return;
            }
            
            // Map subscription plans to user levels (only if not manually set)
            const levelMapping = {
                free: 'standard',
                pro: 'beta', 
                team: 'dev'
            };
            
            const userLevel = levelMapping[planName] || 'standard';
            
            // Only update if the level would actually change
            if (currentProfile?.user_level === userLevel) {
                console.log('✅ User level already matches subscription tier');
                return;
            }
            
            const { error } = await this.supabase
                .from('profiles')
                .update({ 
                    user_level: userLevel,
                    level_manually_set: false // Reset manual flag since this is automatic
                })
                .eq('id', window.Auth.getCurrentUser().id);
                
            if (error) {
                console.error('❌ Error syncing user level:', error);
            } else {
                console.log(`✅ User level synced to: ${userLevel} (based on ${planName} subscription)`);
            }
        } catch (error) {
            console.error('❌ Failed to sync user level:', error);
        }
    },
    
    // Update pricing modal based on current plan
    updatePricingModal(currentPlan) {
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            const planName = card.querySelector('h4')?.textContent?.toLowerCase();
            const button = card.querySelector('.btn');
            
            if (planName === currentPlan.name) {
                if (button) {
                    button.textContent = 'Current Plan';
                    button.className = 'btn current-plan';
                    button.disabled = true;
                }
                card.classList.add('current-plan-card');
            } else {
                if (button) {
                    button.disabled = false;
                    if (planName === 'pro') {
                        button.innerHTML = '<span class="btn-text">Upgrade to Pro</span>';
                        button.className = 'btn primary-btn';
                    } else if (planName === 'team') {
                        button.innerHTML = '<span class="btn-text">Upgrade to Team</span>';
                        button.className = 'btn primary-btn';
                    }
                }
                card.classList.remove('current-plan-card');
            }
        });
    },
    
    // Update account settings with subscription info
    updateAccountSettings(currentPlan) {
        // Add subscription section to user settings if it doesn't exist
        this.addSubscriptionSection(currentPlan);
    },
    
    // Add subscription section to account settings
    addSubscriptionSection(currentPlan) {
        const userSettingsBody = document.querySelector('#user-settings-modal .modal-body');
        if (!userSettingsBody) return;
        
        // Remove existing subscription section
        const existingSection = userSettingsBody.querySelector('.subscription-section');
        if (existingSection) {
            existingSection.remove();
        }
        
        // Create subscription section
        const subscriptionSection = document.createElement('div');
        subscriptionSection.className = 'user-settings-section subscription-section';
        
        let subscriptionHTML = `
            <h4>
                <i class="fas fa-credit-card"></i>
                Subscription & Billing
            </h4>
            <p class="section-description">Manage your subscription and billing information.</p>
            
            <div class="info-item">
                <label><i class="fas fa-tag"></i> Current Plan</label>
                <span class="plan-info">
                    <span class="plan-name">${currentPlan.displayName}</span>
                    <span class="plan-badge ${currentPlan.name}">${currentPlan.displayName}</span>
                </span>
            </div>
        `;
        
        if (currentPlan.name !== 'free') {
            const periodEnd = new Date(this.currentSubscription.current_period_end).toLocaleDateString();
            subscriptionHTML += `
                <div class="info-item">
                    <label><i class="fas fa-calendar"></i> Billing Period</label>
                    <span>Renews on ${periodEnd}</span>
                </div>
                
                <div class="info-item">
                    <label><i class="fas fa-dollar-sign"></i> Amount</label>
                    <span>$${this.config.products[currentPlan.name].price}/month</span>
                </div>
                
                <div class="subscription-actions">
                    <button class="btn" id="manage-subscription-btn">
                        <i class="fas fa-cog"></i>
                        Manage Billing
                    </button>
                    <button class="btn danger-btn" id="cancel-subscription-btn">
                        <i class="fas fa-times"></i>
                        Cancel Subscription
                    </button>
                </div>
            `;
        } else {
            subscriptionHTML += `
                <div class="upgrade-prompt">
                    <h4>Upgrade for More Features</h4>
                    <p>Get unlimited exports, premium templates, and more with a Pro or Team plan.</p>
                    <button class="btn primary-btn" onclick="window.PaymentManager?.showPricingModal()">
                        <i class="fas fa-arrow-up"></i>
                        View Plans
                    </button>
                </div>
            `;
        }
        
        subscriptionSection.innerHTML = subscriptionHTML;
        
        // Insert before danger zone
        const dangerSection = userSettingsBody.querySelector('.danger-section');
        if (dangerSection) {
            userSettingsBody.insertBefore(subscriptionSection, dangerSection);
        } else {
            userSettingsBody.appendChild(subscriptionSection);
        }
        
        // Re-setup event listeners
        this.setupEventListeners();
    },
    
    // Update feature access based on plan
    updateFeatureAccess(currentPlan) {
        // Update export limits
        if (window.PaymentManager) {
            if (currentPlan.name === 'free') {
                window.PaymentManager.usageLimit = 5;
            } else {
                window.PaymentManager.usageLimit = Infinity;
            }
        }
        
        // Update UI elements based on features
        this.updateFeatureUI(currentPlan);
    },
    
    // Update UI elements based on feature access
    updateFeatureUI(currentPlan) {
        // Add premium badges to locked features
        const premiumFeatures = document.querySelectorAll('[data-premium-feature]');
        premiumFeatures.forEach(element => {
            const feature = element.getAttribute('data-premium-feature');
            const hasAccess = this.hasFeatureAccess(feature);
            
            if (!hasAccess && currentPlan.name === 'free') {
                element.classList.add('feature-lock');
                // Add premium badge if it doesn't exist
                if (!element.querySelector('.premium-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'premium-badge';
                    badge.innerHTML = '<i class="fas fa-crown"></i> Pro';
                    element.appendChild(badge);
                }
            } else {
                element.classList.remove('feature-lock');
                const badge = element.querySelector('.premium-badge');
                if (badge) badge.remove();
            }
        });
    },
    
    // Utility functions
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            const text = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');
            if (text) text.style.opacity = '0';
            if (spinner) spinner.style.display = 'flex';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            const text = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');
            if (text) text.style.opacity = '1';
            if (spinner) spinner.style.display = 'none';
        }
    },
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    },
    
    // Reset user level to automatic (based on subscription)
    async resetUserLevelToAutomatic() {
        if (!this.supabase || !window.Auth.getCurrentUser()) return false;
        
        try {
            // Clear the manual flag and let syncUserLevel handle the rest
            const { error } = await this.supabase
                .from('profiles')
                .update({ level_manually_set: false })
                .eq('id', window.Auth.getCurrentUser().id);
                
            if (error) {
                console.error('❌ Error resetting user level to automatic:', error);
                return false;
            }
            
            // Now sync based on current subscription
            const currentPlan = this.getCurrentPlan();
            await this.syncUserLevel(currentPlan.name);
            
            console.log('✅ User level reset to automatic based on subscription');
            return true;
        } catch (error) {
            console.error('❌ Failed to reset user level to automatic:', error);
            return false;
        }
    }
};

// Initialize when DOM is loaded and Auth is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Auth to be ready
    const initStripe = () => {
        if (window.Auth && window.Auth.supabase) {
            window.StripeManager.init();
        } else {
            setTimeout(initStripe, 100);
        }
    };
    initStripe();
}); 
