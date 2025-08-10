/**
 * FrameIt Stripe Integration
 * Handles subscription creation, management, and status checking
 */

class StripeIntegration {
    constructor() {
        // Initialize Stripe with publishable key
        if (typeof Stripe === 'undefined') {
            console.error('Stripe.js not loaded. Make sure to include Stripe.js in your HTML.');
            return;
        }
        
        if (!window.STRIPE_CONFIG?.publishableKey) {
            console.error('Stripe publishable key not found. Please configure STRIPE_CONFIG in config.js');
            return;
        }
        
        this.stripe = Stripe(window.STRIPE_CONFIG.publishableKey);
        this.subscriptionStatus = null;
        this.currentUser = null;
        
        // Initialize subscription checking
        this.initializeSubscriptionCheck();
    }

    /**
     * Initialize subscription status checking
     */
    async initializeSubscriptionCheck() {
        try {
            // No auth needed - simplified mode
            this.currentUser = { id: 'local-user', email: 'user@frameit.local' };
            if (this.currentUser) {
                this.checkAndUpdateSubscriptionStatus();
            }
        } catch (error) {
            console.error('Failed to initialize subscription checking:', error);
        }
    }

    /**
     * Create a checkout session for subscription
     */
    async createCheckoutSession(priceId, planType = 'monthly') {
        try {
            if (!this.currentUser) {
                throw new Error('User must be logged in to subscribe');
            }

            // Show loading state
            this.setButtonLoading(true, planType);

            console.log('Creating Stripe checkout session for:', { priceId, planType, user: this.currentUser.email });
            
            // Since we need a backend to create checkout sessions, let's use Payment Links
            // For now, we'll redirect to a payment link or show that backend is needed
            
            // Option 1: If you have payment links set up in Stripe
            // You can create payment links in Stripe Dashboard and redirect to them
            
            // Option 2: Show message that backend is needed for full implementation
            alert(`🚀 Ready to subscribe to ${planType} plan!\n\n` +
                  `To complete this integration, you'll need:\n` +
                  `1. A backend server to create Stripe checkout sessions\n` +
                  `2. Or use Stripe Payment Links from your Dashboard\n\n` +
                  `Your Stripe configuration is ready with:\n` +
                  `- Live publishable key: ✅\n` +
                  `- Price ID: ${priceId}\n` +
                  `- User: ${this.currentUser.email}\n\n` +
                  `See STRIPE_SETUP_GUIDE.md for backend setup instructions.`);
            
            // For demo: simulate successful subscription
            const shouldSimulateSuccess = confirm('Simulate successful subscription for testing?');
            if (shouldSimulateSuccess) {
                // Update local subscription status for demo
                this.subscriptionStatus = {
                    active: true,
                    plan: 'pro',
                    planType: planType,
                    status: 'active'
                };
                
                // Store in localStorage for persistence
                localStorage.setItem(`subscription_${this.currentUser.uid}`, JSON.stringify(this.subscriptionStatus));
                
                this.updateUIForSubscriptionStatus();
                alert(`✅ Demo subscription activated!\nPlan: ${planType}\nUser: ${this.currentUser.email}`);
            }
            
        } catch (error) {
            console.error('Checkout session creation failed:', error);
            alert('Subscription checkout failed: ' + error.message);
        } finally {
            this.setButtonLoading(false, planType);
        }
    }

    /**
     * Create actual Stripe checkout session (for production)
     */
    async createStripeCheckoutSession(priceId) {
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: this.currentUser.uid,
                    userEmail: this.currentUser.email,
                    successUrl: `${window.location.origin}/?subscription=success`,
                    cancelUrl: `${window.location.origin}/?subscription=cancelled`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const { sessionId } = await response.json();
            
            // Redirect to Stripe Checkout
            const { error } = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Stripe checkout error:', error);
            throw error;
        }
    }

    /**
     * Check subscription status from server
     */
    async checkAndUpdateSubscriptionStatus() {
        try {
            if (!this.currentUser) return;

            // For demo purposes, we'll use local storage
            // In production, check with your backend
            const stored = localStorage.getItem(`subscription_${this.currentUser.uid}`);
            if (stored) {
                this.subscriptionStatus = JSON.parse(stored);
            } else {
                this.subscriptionStatus = {
                    active: false,
                    plan: 'free',
                    status: 'inactive'
                };
            }

            this.updateUIForSubscriptionStatus();
            
        } catch (error) {
            console.error('Subscription status check failed:', error);
            this.subscriptionStatus = { active: false, plan: 'free', status: 'error' };
        }
    }

    /**
     * Update UI based on subscription status
     */
    updateUIForSubscriptionStatus() {
        if (!this.subscriptionStatus) return;

        // Update pricing modal buttons
        this.updatePricingButtons();
        
        // Update export limits in UI
        this.updateExportLimits();
        
        // Update any plan badges or indicators
        this.updatePlanIndicators();
        
        // Store subscription status for other parts of the app
        if (window.App) {
            window.App.subscriptionStatus = this.subscriptionStatus;
        }
    }

    /**
     * Update pricing modal buttons based on subscription status
     */
    updatePricingButtons() {
        const monthlyBtn = document.getElementById('subscribe-pro-monthly');
        const yearlyBtn = document.getElementById('subscribe-pro-yearly');
        
        if (this.subscriptionStatus.active && this.subscriptionStatus.plan === 'pro') {
            // User has active pro subscription
            if (monthlyBtn) {
                monthlyBtn.innerHTML = '<span class="btn-text">Current Plan</span>';
                monthlyBtn.disabled = true;
                monthlyBtn.classList.add('current-plan');
            }
            if (yearlyBtn) {
                yearlyBtn.innerHTML = '<span class="btn-text">Upgrade to Yearly</span>';
                yearlyBtn.disabled = false;
            }
        } else {
            // User is on free plan or no subscription
            if (monthlyBtn) {
                monthlyBtn.innerHTML = '<span class="btn-text">Monthly - $5</span><span class="btn-spinner" style="display: none;"></span>';
                monthlyBtn.disabled = false;
                monthlyBtn.classList.remove('current-plan');
            }
            if (yearlyBtn) {
                yearlyBtn.innerHTML = '<span class="btn-text">Yearly - $29.99</span><span class="btn-spinner" style="display: none;"></span>';
                yearlyBtn.disabled = false;
            }
        }
    }

    /**
     * Update export limits display
     */
    updateExportLimits() {
        if (this.subscriptionStatus.active && this.subscriptionStatus.plan === 'pro') {
            // Pro user - unlimited exports
            const usageMeter = document.querySelector('.usage-meter');
            if (usageMeter) {
                usageMeter.innerHTML = `
                    <h4>Pro Plan</h4>
                    <div class="usage-progress">
                        <div class="usage-progress-bar" style="width: 100%; background: linear-gradient(90deg, #28a745, #28a745);"></div>
                    </div>
                    <div class="usage-text">
                        <span>Unlimited exports</span>
                        <span>Pro member</span>
                    </div>
                `;
            }
        }
    }

    /**
     * Update plan indicators throughout the UI
     */
    updatePlanIndicators() {
        // Add plan badges, update navigation, etc.
        const accountBtn = document.getElementById('account-btn');
        if (accountBtn && this.subscriptionStatus.active && this.subscriptionStatus.plan === 'pro') {
            const existingBadge = accountBtn.querySelector('.plan-badge');
            if (!existingBadge) {
                const badge = document.createElement('span');
                badge.className = 'plan-badge pro';
                badge.textContent = 'PRO';
                badge.style.cssText = `
                    font-size: 10px;
                    background: linear-gradient(135deg, #43A047, #3b92ff);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 8px;
                    margin-left: 4px;
                `;
                accountBtn.appendChild(badge);
            }
        }
    }

    /**
     * Set loading state on subscription buttons
     */
    setButtonLoading(loading, planType) {
        const buttonId = planType === 'yearly' ? 'subscribe-pro-yearly' : 'subscribe-pro-monthly';
        const button = document.getElementById(buttonId);
        
        if (button) {
            const textSpan = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');
            
            if (loading) {
                button.disabled = true;
                if (textSpan) textSpan.style.display = 'none';
                if (spinner) spinner.style.display = 'inline-block';
            } else {
                button.disabled = false;
                if (textSpan) textSpan.style.display = 'inline';
                if (spinner) spinner.style.display = 'none';
            }
        }
    }

    /**
     * Get authentication token
     */
    async getAuthToken() {
        // No auth needed - return mock token
        return 'mock-token-no-auth-needed';
    }

    /**
     * Check if user can perform an action (e.g., export)
     */
    canPerformAction(action, currentUsage = 0) {
        if (!this.subscriptionStatus) return false;
        
        if (this.subscriptionStatus.active && this.subscriptionStatus.plan === 'pro') {
            return true; // Pro users have unlimited access
        }
        
        // Free tier limits
        switch (action) {
            case 'export':
                return currentUsage < 10; // 10 exports per month for free
            case 'premium_template':
                return false; // Premium templates only for Pro
            default:
                return true;
        }
    }

    /**
     * Get current subscription info
     */
    getSubscriptionInfo() {
        return this.subscriptionStatus || { active: false, plan: 'free' };
    }

    /**
     * Cancel subscription (for future implementation)
     */
    async cancelSubscription() {
        try {
            // Implement subscription cancellation
            console.log('Cancelling subscription...');
            // API call to cancel subscription
            
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            throw error;
        }
    }
}

// Initialize Stripe integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.StripeIntegration = new StripeIntegration();
    }, 500);
});

// Export for use in other files
window.StripeIntegration = window.StripeIntegration || null; 