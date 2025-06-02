// Payment Management System for FrameIt
// Handles subscription plans and upgrade flows
const PaymentManager = {
    currentPlan: 'free',
    usageCount: 3, // Demo: 3 exports used
    usageLimit: 5, // Free plan limit
    
    init() {
        this.setupEventListeners();
        this.updateUI();
    },
    
    setupEventListeners() {
        // Upgrade button in toolbar
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.showPricingModal());
        }
        
        // Pricing modal close button
        const pricingCloseBtn = document.getElementById('pricing-close-btn');
        if (pricingCloseBtn) {
            pricingCloseBtn.addEventListener('click', () => this.hidePricingModal());
        }
        
        // Subscription buttons
        const subscribeProBtn = document.getElementById('subscribe-pro');
        const subscribeTeamBtn = document.getElementById('subscribe-team');
        
        if (subscribeProBtn) {
            subscribeProBtn.addEventListener('click', () => this.subscribeToPlan('pro'));
        }
        if (subscribeTeamBtn) {
            subscribeTeamBtn.addEventListener('click', () => this.subscribeToPlan('team'));
        }
        
        // Close modal when clicking outside
        const pricingModal = document.getElementById('pricing-modal');
        if (pricingModal) {
            pricingModal.addEventListener('click', (e) => {
                if (e.target === pricingModal) {
                    this.hidePricingModal();
                }
            });
        }
    },
    
    showPricingModal() {
        const modal = document.getElementById('pricing-modal');
        if (modal) {
            modal.classList.add('visible');
            this.updatePricingModal();
        }
    },
    
    hidePricingModal() {
        const modal = document.getElementById('pricing-modal');
        if (modal) {
            modal.classList.remove('visible');
        }
    },
    
    updatePricingModal() {
        // Update usage meter
        const progressBar = document.querySelector('.usage-progress-bar');
        const usageText = document.querySelector('.usage-text');
        
        if (progressBar && usageText) {
            const percentage = (this.usageCount / this.usageLimit) * 100;
            progressBar.style.width = `${percentage}%`;
            
            const remainingDays = Math.ceil((new Date(2025, 1, 1) - new Date()) / (1000 * 60 * 60 * 24));
            usageText.innerHTML = `
                <span>${this.usageCount} of ${this.usageLimit} exports used</span>
                <span>Resets in ${remainingDays} days</span>
            `;
        }
        
        // Update current plan button
        const cards = document.querySelectorAll('.pricing-card');
        cards.forEach(card => {
            const button = card.querySelector('.btn');
            const planName = card.querySelector('h4').textContent.toLowerCase();
            
            if (planName === this.currentPlan) {
                button.textContent = 'Current Plan';
                button.className = 'btn current-plan';
                button.disabled = true;
            } else {
                button.disabled = false;
                if (planName === 'pro') {
                    button.innerHTML = '<span class="btn-text">Upgrade to Pro</span><span class="btn-spinner" style="display: none;"></span>';
                    button.className = 'btn primary-btn';
                } else if (planName === 'team') {
                    button.innerHTML = '<span class="btn-text">Upgrade to Team</span><span class="btn-spinner" style="display: none;"></span>';
                    button.className = 'btn primary-btn';
                }
            }
        });
    },
    
    async subscribeToPlan(planType) {
        const button = document.getElementById(`subscribe-${planType}`);
        if (!button) return;
        
        // Show loading state
        this.setButtonLoading(button, true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real implementation, this would:
            // 1. Create Stripe checkout session
            // 2. Redirect to Stripe Checkout
            // 3. Handle webhook to update user plan
            
            // For demo purposes, show success
            this.showNotification(`🎉 Successfully upgraded to ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan!`, 'success');
            this.currentPlan = planType;
            this.hidePricingModal();
            this.updateUI();
            
        } catch (error) {
            console.error('Subscription error:', error);
            this.showNotification('❌ Payment failed. Please try again.', 'error');
        } finally {
            this.setButtonLoading(button, false);
        }
    },
    
    setButtonLoading(button, loading) {
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
    },
    
    checkExportLimit() {
        if (this.currentPlan === 'free') {
            return this.usageCount >= this.usageLimit;
        }
        return false; // Pro/Team plans have unlimited exports
    },
    
    trackExport() {
        if (this.currentPlan === 'free') {
            this.usageCount++;
            this.updateUI();
        }
    },
    
    updateUI() {
        // Show/hide upgrade button based on plan
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            if (this.currentPlan === 'free') {
                upgradeBtn.style.display = 'flex';
                
                // Update button text based on usage
                if (this.usageCount >= this.usageLimit - 1) {
                    upgradeBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade Now';
                    upgradeBtn.classList.add('primary-btn');
                } else {
                    upgradeBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade';
                    upgradeBtn.classList.remove('primary-btn');
                }
            } else {
                upgradeBtn.style.display = 'none';
            }
        }
        
        // Add plan badge to user menu
        this.updatePlanBadge();
        
        // Update export button if at limit
        this.updateExportButton();
    },
    
    updatePlanBadge() {
        const userMenu = document.getElementById('user-menu');
        if (!userMenu) return;
        
        // Remove existing badge
        const existingBadge = userMenu.querySelector('.plan-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add new badge
        if (this.currentPlan !== 'free') {
            const badge = document.createElement('span');
            badge.className = `plan-badge ${this.currentPlan}`;
            badge.innerHTML = `<i class="fas fa-crown"></i> ${this.currentPlan.toUpperCase()}`;
            
            const userInfo = userMenu.querySelector('.user-info');
            if (userInfo) {
                userInfo.insertBefore(badge, userInfo.firstChild);
            }
        }
    },
    
    updateExportButton() {
        const exportBtn = document.getElementById('export-btn');
        if (!exportBtn) return;
        
        if (this.checkExportLimit()) {
            exportBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade to Export';
            exportBtn.classList.add('primary-btn');
            exportBtn.onclick = () => this.showUpgradePrompt();
        } else {
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Mockup';
            exportBtn.classList.remove('primary-btn');
            exportBtn.onclick = null; // Reset to original handler
        }
    },
    
    showUpgradePrompt() {
        // Create upgrade prompt overlay
        const prompt = document.createElement('div');
        prompt.className = 'upgrade-prompt';
        prompt.innerHTML = `
            <h4>🚀 Export Limit Reached</h4>
            <p>You've used all ${this.usageLimit} exports for this month. Upgrade to Pro for unlimited exports!</p>
            <button class="btn primary-btn" onclick="PaymentManager.showPricingModal(); this.parentElement.remove();">
                <i class="fas fa-crown"></i> Upgrade Now
            </button>
            <button class="btn" onclick="this.parentElement.remove();" style="margin-left: 8px;">
                Maybe Later
            </button>
        `;
        
        // Insert before the export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn && exportBtn.parentNode) {
            exportBtn.parentNode.insertBefore(prompt, exportBtn);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (prompt.parentNode) {
                    prompt.remove();
                }
            }, 10000);
        }
    },
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#2b7de9'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                if (style.parentNode) {
                    style.remove();
                }
            }, 300);
        }, 5000);
    },
    
    // Demo function to simulate different plans
    setDemoPlan(plan) {
        this.currentPlan = plan;
        if (plan === 'free') {
            this.usageCount = 3;
            this.usageLimit = 5;
        } else {
            this.usageCount = 0;
            this.usageLimit = Infinity;
        }
        this.updateUI();
        this.showNotification(`Demo: Switched to ${plan} plan`, 'info');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PaymentManager.init();
});

// Export for global access
window.PaymentManager = PaymentManager; 