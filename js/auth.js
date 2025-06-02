/**
 * Authentication Module for FrameIt
 * Handles user registration, login, logout, and session management using Supabase
 */

console.log('🔍 Auth.js file loaded successfully');

window.Auth = {
    supabase: null,
    currentUser: null,
    currentSession: null,
    testMode: false, // Set to true to bypass auth for testing
    
    // Initialize authentication
    async init() {
        // Check for test mode (remove this in production)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'true' || urlParams.get('demo') === 'true' || this.testMode) {
            console.log('🧪 Running in test mode - bypassing authentication');
            this.currentUser = { email: 'test@frameit.com', id: 'test-user' };
            this.showMainApp();
            this.setupEventListeners();
            return;
        }
        
        // Check for email confirmation or auth callback
        if (window.location.hash && window.location.hash.includes('access_token')) {
            console.log('🔗 Handling auth callback...');
            await this.handleAuthCallback();
        }
        
        // Get configuration from config file
        const config = window.FrameItConfig?.supabase;
        
        if (!config || !config.url || !config.anonKey) {
            console.error('Supabase configuration missing! Check js/frameit-config.js');
            this.showAuthGate();
            return;
        }
        
        const SUPABASE_URL = config.url;
        const SUPABASE_ANON_KEY = config.anonKey;
        
        console.log('Initializing Supabase...', { url: SUPABASE_URL });
        
        // Real initialization:
        try {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            console.log('Supabase client created successfully');
            
            // Listen for auth state changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session?.user?.email || 'No user');
                this.handleAuthStateChange(event, session);
            });
            
            // Check current session
            console.log('Checking current session...');
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
            }
            
            if (session) {
                console.log('User already logged in:', session.user.email);
                this.currentUser = session.user;
                this.currentSession = session;
                this.showMainApp();
            } else {
                console.log('No active session, showing auth gate');
                this.showAuthGate();
            }
            
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.showError('auth-error', 'Failed to connect to authentication service. Please check your internet connection.');
            this.showAuthGate();
        }
        
        // For testing without Supabase (remove these lines when you have real credentials):
        // console.log('Auth initialized - Please configure Supabase credentials');
        // this.setupEventListeners();
        // this.checkAuthState();
    },
    
    // Handle auth callback (email confirmations, etc.)
    async handleAuthCallback() {
        try {
            console.log('📧 Processing auth callback...');
            
            if (!this.supabase) {
                console.error('Supabase not initialized for callback');
                return;
            }
            
            // Get session from URL fragments
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Auth callback error:', error);
                // Show user-friendly message
                alert('There was an issue confirming your email. Please try again or contact support if the problem persists.');
                return;
            }
            
            if (data.session) {
                console.log('✅ Email confirmation successful');
                this.currentUser = data.session.user;
                this.currentSession = data.session;
                
                // Show success message
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4caf50;
                    color: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                notification.innerHTML = '<i class="fas fa-check-circle"></i> Email confirmed successfully!';
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);
                
                // Clean URL
                window.history.replaceState(null, null, window.location.pathname);
                
                this.showMainApp();
            }
        } catch (error) {
            console.error('Auth callback error:', error);
        }
    },
    
    // Set up event listeners for authentication UI
    setupEventListeners() {
        console.log('Setting up authentication event listeners...');
        
        // Debug: Check if buttons exist
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const accountBtn = document.getElementById('account-btn');
        const showLandingSignup = document.getElementById('show-landing-signup');
        const showLandingLogin = document.getElementById('show-landing-login');
        const landingLoginForm = document.getElementById('landing-login-form-element');
        const landingSignupForm = document.getElementById('landing-signup-form-element');
        
        console.log('🔍 Button availability check:', {
            loginBtn: !!loginBtn,
            signupBtn: !!signupBtn,
            accountBtn: !!accountBtn,
            showLandingSignup: !!showLandingSignup,
            showLandingLogin: !!showLandingLogin,
            landingLoginForm: !!landingLoginForm,
            landingSignupForm: !!landingSignupForm
        });
        
        // Modal close buttons
        const authCloseBtn = document.getElementById('auth-close-btn');
        const userSettingsCloseBtn = document.getElementById('user-settings-close-btn');
        const settingsCloseBtn = document.getElementById('settings-close-btn');
        const deleteAccountCloseBtn = document.getElementById('delete-account-close-btn');
        
        if (authCloseBtn) {
            authCloseBtn.addEventListener('click', () => this.hideAuthModal());
        }
        if (userSettingsCloseBtn) {
            userSettingsCloseBtn.addEventListener('click', () => this.hideUserSettings());
        }
        if (settingsCloseBtn) {
            settingsCloseBtn.addEventListener('click', () => this.hideUserSettings());
        }
        if (deleteAccountCloseBtn) {
            deleteAccountCloseBtn.addEventListener('click', () => this.hideDeleteAccountModal());
        }
        
        // Gate buttons (old modal triggers)
        const gateSignupBtn = document.getElementById('gate-signup-btn');
        const gateLoginBtn = document.getElementById('gate-login-btn');
        
        if (gateSignupBtn) {
            gateSignupBtn.addEventListener('click', () => this.showAuthModal('signup'));
        }
        if (gateLoginBtn) {
            gateLoginBtn.addEventListener('click', () => this.showAuthModal('login'));
        }
        
        // Account button - shows login modal when not logged in, user settings when logged in
        if (accountBtn) {
            console.log('✅ Setting up account button listener');
            accountBtn.addEventListener('click', () => {
                console.log('👤 Account button clicked, authenticated:', this.isAuthenticated());
                if (this.isAuthenticated()) {
                    this.showUserSettings();
                } else {
                    this.showAuthModal('login');
                }
            });
        } else {
            console.warn('⚠️ Account button not found');
        }
        
        // Toolbar auth buttons (legacy)
        if (loginBtn) {
            console.log('✅ Setting up login button listener');
            loginBtn.addEventListener('click', () => {
                console.log('🔐 Login button clicked');
                this.showAuthModal('login');
            });
        } else {
            console.warn('⚠️ Login button not found');
        }
        
        if (signupBtn) {
            console.log('✅ Setting up signup button listener');
            signupBtn.addEventListener('click', () => {
                console.log('📝 Signup button clicked');
                this.showAuthModal('signup');
            });
        } else {
            console.warn('⚠️ Signup button not found');
        }
        
        // Landing page form switching
        if (showLandingSignup) {
            console.log('✅ Setting up landing signup switch listener');
            showLandingSignup.addEventListener('click', () => {
                console.log('🔄 Switching to signup form');
                this.switchLandingForm('signup');
            });
        } else {
            console.warn('⚠️ Landing signup switch button not found');
        }
        
        if (showLandingLogin) {
            console.log('✅ Setting up landing login switch listener');
            showLandingLogin.addEventListener('click', () => {
                console.log('🔄 Switching to login form');
                this.switchLandingForm('login');
            });
        } else {
            console.warn('⚠️ Landing login switch button not found');
        }
        
        // Modal form switching
        const showSignup = document.getElementById('show-signup');
        const showLogin = document.getElementById('show-login');
        
        if (showSignup) {
            showSignup.addEventListener('click', () => this.switchAuthForm('signup'));
        }
        if (showLogin) {
            showLogin.addEventListener('click', () => this.switchAuthForm('login'));
        }
        
        // Form submissions - Modal forms
        const loginForm = document.getElementById('login-form-element');
        const signupForm = document.getElementById('signup-form-element');
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', () => this.handleForgotPassword());
        }
        
        // Form submissions - Landing page forms
        if (landingLoginForm) {
            console.log('✅ Setting up landing login form listener');
            landingLoginForm.addEventListener('submit', (e) => {
                console.log('🔐 Landing login form submitted');
                this.handleLandingLogin(e);
            });
        } else {
            console.warn('⚠️ Landing login form not found');
        }
        
        if (landingSignupForm) {
            console.log('✅ Setting up landing signup form listener');
            landingSignupForm.addEventListener('submit', (e) => {
                console.log('📝 Landing signup form submitted');
                this.handleLandingSignup(e);
            });
        } else {
            console.warn('⚠️ Landing signup form not found');
        }
        
        const landingForgotPasswordBtn = document.getElementById('landing-forgot-password-btn');
        if (landingForgotPasswordBtn) {
            landingForgotPasswordBtn.addEventListener('click', () => this.handleLandingForgotPassword());
        }
        
        // User menu
        const userMenuBtn = document.getElementById('user-menu-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => this.toggleUserDropdown());
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // User settings button
        const userSettingsBtn = document.getElementById('user-settings-btn');
        
        if (userSettingsBtn) {
            userSettingsBtn.addEventListener('click', (e) => {
                console.log('🔍 User settings button clicked');
                e.preventDefault();
                this.showUserSettings();
            });
        } else {
            console.warn('⚠️ User settings button not found');
        }
        
        // User settings forms
        const changeEmailForm = document.getElementById('change-email-form');
        const changePasswordForm = document.getElementById('change-password-form');
        const updateEmailBtn = document.getElementById('update-email-btn');
        const changePasswordBtn = document.getElementById('change-password-btn');
        
        if (updateEmailBtn) {
            updateEmailBtn.addEventListener('click', (e) => this.handleChangeEmail(e));
        }
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', (e) => this.handleChangePassword(e));
        }
        
        // Delete account flow
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const deleteConfirmationEmail = document.getElementById('delete-confirmation-email');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.showDeleteAccountModal());
        }
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.handleDeleteAccount());
        }
        if (deleteConfirmationEmail) {
            deleteConfirmationEmail.addEventListener('input', () => this.validateDeleteConfirmation());
        }
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.hideDeleteAccountModal());
        }
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.hideUserSettings());
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            const userDropdown = document.getElementById('user-dropdown');
            
            if (userMenu && !userMenu.contains(e.target)) {
                if (userDropdown) {
                    userDropdown.classList.add('hidden');
                }
            }
        });
        
        // Close modal when clicking outside
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    this.hideAuthModal();
                }
            });
        }
        
        console.log('✅ Authentication event listeners setup complete');
    },
    
    // Handle authentication state changes
    handleAuthStateChange(event, session) {
        console.log('🔍 Auth state change:', event, session?.user?.email || 'No user');
        
        if (event === 'SIGNED_IN' && session) {
            this.currentUser = session.user;
            this.currentSession = session; // Store the full session with access token
            this.hideAuthModal(); // Hide modal immediately when signed in
            this.showMainApp();
        } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            this.currentSession = null; // Clear session
            this.showAuthGate();
        }
    },
    
    // Show the authentication gate
    showAuthGate() {
        const authGate = document.getElementById('auth-gate');
        const appContainer = document.querySelector('.app-container');
        const accountBtn = document.getElementById('account-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (authGate) {
            authGate.style.display = 'flex';
        }
        if (appContainer) {
            appContainer.style.display = 'none';
        }
        
        // Reset account button to show "Account" when logged out
        if (accountBtn) {
            const accountSpan = accountBtn.querySelector('span');
            if (accountSpan) {
                accountSpan.textContent = 'Account';
            }
        }
        
        // Hide logout button when logged out
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
    },
    
    // Show the main application
    showMainApp() {
        const authGate = document.getElementById('auth-gate');
        const appContainer = document.querySelector('.app-container');
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userEmail = document.getElementById('user-email');
        const accountBtn = document.getElementById('account-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (authGate) {
            authGate.style.display = 'none';
        }
        if (appContainer) {
            appContainer.style.display = 'flex';
        }
        
        // Update toolbar UI
        if (authButtons) {
            authButtons.classList.add('hidden');
        }
        if (userMenu) {
            userMenu.classList.add('hidden'); // Hide the separate user menu
        }
        
        // Update account button to show user email
        if (accountBtn && this.currentUser) {
            const accountSpan = accountBtn.querySelector('span');
            if (accountSpan) {
                accountSpan.textContent = this.currentUser.email;
            }
            console.log('👤 Account button updated with user email:', this.currentUser.email);
        }
        
        // Show logout button when logged in
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }
        
        this.hideAuthModal();
        
        // Also update user settings modal if it's open
        const currentUserEmailElement = document.getElementById('current-user-email');
        if (currentUserEmailElement && this.currentUser) {
            currentUserEmailElement.textContent = this.currentUser.email;
        }
    },
    
    // Show authentication modal
    showAuthModal(mode = 'login') {
        console.log('🔍 showAuthModal called with mode:', mode);
        const authModal = document.getElementById('auth-modal');
        console.log('🔍 Auth modal element found:', authModal);
        console.log('🔍 Modal current classList:', authModal?.classList?.toString());
        
        if (authModal) {
            console.log('🔍 Adding visible class to auth modal');
            authModal.classList.add('visible');
            
            // Force display as backup
            authModal.style.display = 'flex';
            authModal.style.zIndex = '10001';
            
            console.log('🔍 Modal classList after adding visible:', authModal.classList.toString());
            console.log('🔍 Modal computed display style:', window.getComputedStyle(authModal).display);
            
            this.switchAuthForm(mode);
        } else {
            console.error('❌ Auth modal not found in DOM!');
            // Fallback: create a simple alert
            alert(`Please ${mode === 'signup' ? 'sign up' : 'log in'} to continue. Modal not loading properly.`);
        }
    },
    
    // Hide authentication modal
    hideAuthModal() {
        console.log('🔍 Hiding auth modal');
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('visible');
            authModal.style.display = 'none'; // Force hide
            console.log('🔍 Auth modal hidden');
        }
        this.clearAuthForms();
    },
    
    // Switch between login and signup forms
    switchAuthForm(mode) {
        console.log('switchAuthForm called with mode:', mode);
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const modalTitle = document.getElementById('auth-modal-title');
        
        console.log('Form elements found:', { loginForm, signupForm, modalTitle });
        
        if (mode === 'signup') {
            if (loginForm) loginForm.classList.add('hidden');
            if (signupForm) signupForm.classList.remove('hidden');
            if (modalTitle) modalTitle.textContent = 'Join FrameIt';
            console.log('Switched to signup form');
        } else {
            if (signupForm) signupForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
            if (modalTitle) modalTitle.textContent = 'Welcome Back';
            console.log('Switched to login form');
        }
        
        this.clearAuthForms();
    },
    
    // Clear form data and error messages
    clearAuthForms() {
        // Clear form inputs
        const inputs = document.querySelectorAll('#auth-modal input');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Clear error messages
        const errorElements = document.querySelectorAll('.auth-error, .auth-success');
        errorElements.forEach(element => {
            element.classList.add('hidden');
            element.textContent = '';
        });
        
        // Reset button states
        const submitBtns = document.querySelectorAll('.auth-submit-btn');
        submitBtns.forEach(btn => {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
    },
    
    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('login-submit');
        const errorElement = document.getElementById('login-error');
        
        console.log('Login attempt for:', email);
        
        if (!email || !password) {
            this.showError('login-error', 'Please fill in all fields');
            return;
        }
        
        if (!this.supabase) {
            this.showError('login-error', 'Authentication service not initialized');
            return;
        }
        
        this.setLoading(submitBtn, true);
        
        try {
            console.log('Attempting login with Supabase...');
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            console.log('Login response:', { data, error });
            
            if (error) {
                throw error;
            }
            
            console.log('Login successful for:', data.user?.email);
            // User will be handled by auth state change listener
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and click the confirmation link before logging in.';
            } else if (error.message.includes('Too many requests')) {
                errorMessage = 'Too many login attempts. Please wait a moment and try again.';
            }
            
            this.showError('login-error', errorMessage);
        } finally {
            this.setLoading(submitBtn, false);
        }
    },
    
    // Handle signup form submission
    async handleSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const submitBtn = document.getElementById('signup-submit');
        
        console.log('Signup attempt for:', email);
        
        if (!email || !password || !confirmPassword) {
            this.showError('signup-error', 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('signup-error', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError('signup-error', 'Password must be at least 6 characters');
            return;
        }
        
        if (!this.supabase) {
            this.showError('signup-error', 'Authentication service not initialized');
            return;
        }
        
        this.setLoading(submitBtn, true);
        
        try {
            console.log('Attempting signup with Supabase...');
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            
            console.log('Signup response:', { data, error });
            
            if (error) {
                throw error;
            }
            
            // Show success message
            document.getElementById('signup-success').classList.remove('hidden');
            document.getElementById('signup-error').classList.add('hidden');
            
            console.log('Signup successful! Check email for confirmation.');
            
            // Auto-switch to login after 3 seconds
            setTimeout(() => {
                this.switchAuthForm('login');
                // Pre-fill email
                document.getElementById('login-email').value = email;
            }, 3000);
            
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Signup failed. Please try again.';
            
            if (error.message.includes('User already registered')) {
                errorMessage = 'An account with this email already exists. Try logging in instead.';
            } else if (error.message.includes('Password should be')) {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            }
            
            this.showError('signup-error', errorMessage);
        } finally {
            this.setLoading(submitBtn, false);
        }
    },
    
    // Handle logout
    async handleLogout() {
        try {
            if (!this.supabase) {
                console.error('Supabase not initialized');
                return;
            }
            
            console.log('Logging out...');
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                throw error;
            }
            console.log('Logout successful');
            // User will be handled by auth state change listener
        } catch (error) {
            console.error('Logout error:', error);
        }
    },
    
    // Toggle user dropdown menu
    toggleUserDropdown() {
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    },
    
    // Show error message
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        
        // Hide success messages
        const successElements = document.querySelectorAll('.auth-success');
        successElements.forEach(element => {
            element.classList.add('hidden');
        });
    },
    
    // Hide error message
    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
        }
    },
    
    // Set loading state for buttons
    setLoading(button, isLoading) {
        console.log('🔄 setLoading called:', { button: !!button, isLoading, buttonId: button?.id });
        
        if (!button) {
            console.warn('⚠️ setLoading: button is null');
            return;
        }
        
        const textSpan = button.querySelector('.btn-text');
        const spinner = button.querySelector('.btn-spinner');
        
        console.log('🔍 Button elements:', { textSpan: !!textSpan, spinner: !!spinner });
        
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            if (textSpan) textSpan.style.display = 'none';
            if (spinner) {
                spinner.classList.remove('hidden');
                spinner.style.display = 'inline-block';
            }
            console.log('✅ Button set to loading state');
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (textSpan) textSpan.style.display = 'inline';
            if (spinner) {
                spinner.classList.add('hidden');
                spinner.style.display = 'none';
            }
            console.log('✅ Button loading state removed');
        }
    },
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },
    
    // Get current session (includes access token)
    getCurrentSession() {
        return this.currentSession;
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    },
    
    // Show user settings modal
    showUserSettings() {
        const userSettingsModal = document.getElementById('user-settings-modal');
        const currentUserEmail = document.getElementById('user-email');
        const userCreatedDate = document.getElementById('member-since');
        const emailStatus = document.getElementById('verification-status');
        
        if (userSettingsModal) {
            userSettingsModal.classList.add('visible');
            
            // Populate user info
            if (currentUserEmail && this.currentUser) {
                currentUserEmail.textContent = this.currentUser.email;
            }
            if (userCreatedDate && this.currentUser) {
                const createdAt = new Date(this.currentUser.created_at);
                userCreatedDate.textContent = createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            if (emailStatus && this.currentUser) {
                const isVerified = this.currentUser.email_confirmed_at !== null;
                emailStatus.className = `verification-status ${isVerified ? 'verified' : 'unverified'}`;
                emailStatus.innerHTML = isVerified 
                    ? '<i class="fas fa-check-circle"></i> Verified'
                    : '<i class="fas fa-exclamation-triangle"></i> Unverified';
            }
            
            // Load and display user level and stats
            this.loadUserLevelInfo().then(profile => {
                if (profile) {
                    const userStats = {
                        level: profile.user_level || 'standard',
                        exports: profile.export_count || 0,
                        canvases: profile.canvas_count || 0,
                        uploads: profile.upload_count || 0,
                        memberSince: profile.created_at
                    };
                    this.displayUserStats(userStats);
                }
            }).catch(error => {
                console.error('Failed to load user level info:', error);
            });
        }
    },
    
    // Load user level and stats information
    async loadUserLevelInfo() {
        if (!this.supabase) return null;
        
        try {
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('*')
                .single();
                
            if (error) {
                console.log('Profile not found');
                return null;
            }
            
            return profile;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            return null;
        }
    },
    
    // Display user level and statistics in the account settings
    displayUserStats(userStats) {
        // Find the account information section
        const accountSection = document.querySelector('.user-settings-section .user-info-display');
        if (!accountSection) return;
        
        // Check if user level info already exists
        let userLevelItem = accountSection.querySelector('.user-level-item');
        let userStatsSection = document.querySelector('.user-stats-section');
        
        if (!userLevelItem) {
            // Create user level display
            userLevelItem = document.createElement('div');
            userLevelItem.className = 'info-item user-level-item';
            userLevelItem.innerHTML = `
                <label><i class="fas fa-star"></i> User Level</label>
                <span class="user-level-badge ${userStats.level}">${this.formatUserLevel(userStats.level)}</span>
            `;
            accountSection.appendChild(userLevelItem);
        }
        
        if (!userStatsSection) {
            // Create user statistics section
            userStatsSection = document.createElement('div');
            userStatsSection.className = 'user-settings-section user-stats-section';
            userStatsSection.innerHTML = `
                <h4><i class="fas fa-chart-line"></i> Your Statistics</h4>
                <p class="section-description">Track your usage and activity on FrameIt.</p>
                <div class="user-stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${userStats.exports}</div>
                        <div class="stat-label">Exports</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${userStats.canvases}</div>
                        <div class="stat-label">Canvases</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${userStats.uploads}</div>
                        <div class="stat-label">Uploads</div>
                    </div>
                </div>
            `;
            
            // Add Global Statistics section for dev users
            if (window.Analytics && window.Analytics.hasFeatureAccess && window.Analytics.hasFeatureAccess('dev')) {
                userStatsSection.innerHTML += `
                    <div class="global-stats-section">
                        <h5><i class="fas fa-globe"></i> Global Statistics</h5>
                        <p class="section-description">View application-wide analytics and usage data.</p>
                        <button id="view-global-analytics-btn" class="btn primary-btn">
                            <i class="fas fa-chart-bar"></i>
                            <span>View Global Analytics</span>
                            <span class="dev-feature-indicator">Dev</span>
                        </button>
                    </div>
                `;
            }
            
            // Insert before the update profile section
            const updateSection = document.querySelector('.user-settings-section:nth-child(2)');
            if (updateSection) {
                updateSection.parentNode.insertBefore(userStatsSection, updateSection);
            }
            
            // Set up analytics button event listener for dev users
            if (window.Analytics && window.Analytics.hasFeatureAccess && window.Analytics.hasFeatureAccess('dev')) {
                const globalAnalyticsBtn = document.getElementById('view-global-analytics-btn');
                if (globalAnalyticsBtn) {
                    globalAnalyticsBtn.addEventListener('click', () => {
                        if (window.Analytics && window.Analytics.showAnalyticsDashboard) {
                            window.Analytics.showAnalyticsDashboard();
                        }
                    });
                }
            }
        } else {
            // Update existing stats
            const statValues = userStatsSection.querySelectorAll('.stat-value');
            if (statValues[0]) statValues[0].textContent = userStats.exports;
            if (statValues[1]) statValues[1].textContent = userStats.canvases;
            if (statValues[2]) statValues[2].textContent = userStats.uploads;
        }
    },
    
    // Format user level for display
    formatUserLevel(level) {
        const levelMap = {
            'standard': 'Standard',
            'beta': 'Beta Tester',
            'dev': 'Developer'
        };
        return levelMap[level] || 'Standard';
    },
    
    // Hide user settings modal
    hideUserSettings() {
        const userSettingsModal = document.getElementById('user-settings-modal');
        if (userSettingsModal) {
            userSettingsModal.classList.remove('visible');
        }
        this.clearUserSettingsForms();
    },
    
    // Clear user settings forms
    clearUserSettingsForms() {
        // Clear form inputs
        const inputs = document.querySelectorAll('#user-settings-modal input');
        inputs.forEach(input => {
            if (input.type !== 'email' || input.id !== 'current-user-email') {
                input.value = '';
            }
        });
        
        // Clear error/success messages
        const messages = document.querySelectorAll('#user-settings-modal .auth-error, #user-settings-modal .auth-success');
        messages.forEach(element => {
            element.classList.add('hidden');
            element.textContent = '';
        });
        
        // Reset button states
        const buttons = document.querySelectorAll('#user-settings-modal .btn.loading');
        buttons.forEach(btn => {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
    },
    
    // Handle change email
    async handleChangeEmail(e) {
        e.preventDefault();
        
        const newEmail = document.getElementById('new-email').value;
        const submitBtn = document.getElementById('update-email-btn');
        
        if (!newEmail) {
            this.showError('update-email-error', 'Please enter a new email address');
            return;
        }
        
        if (newEmail === this.currentUser?.email) {
            this.showError('update-email-error', 'This is already your current email address');
            return;
        }
        
        if (!this.supabase) {
            this.showError('update-email-error', 'Authentication service not available');
            return;
        }
        
        this.setLoading(submitBtn, true);
        
        try {
            console.log('📧 Requesting email change to:', newEmail);
            
            const { data, error } = await this.supabase.auth.updateUser({
                email: newEmail
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Email change request sent');
            
            // Clear form and show detailed success message
            document.getElementById('new-email').value = '';
            document.getElementById('update-email-error').classList.add('hidden');
            
            const successElement = document.getElementById('update-email-success');
            successElement.innerHTML = `
                <strong>Email change initiated!</strong><br>
                1. Check your current email (${this.currentUser.email}) for a confirmation link<br>
                2. Check your new email (${newEmail}) for a confirmation link<br>
                3. Click both confirmation links to complete the change<br>
                <small>Your email will only update after both confirmations are completed.</small>
            `;
            successElement.classList.remove('hidden');
            
            // Add auto-refresh instruction
            setTimeout(() => {
                const refreshNote = document.createElement('div');
                refreshNote.style.marginTop = '10px';
                refreshNote.style.fontSize = '12px';
                refreshNote.style.color = '#888';
                refreshNote.innerHTML = '<i class="fas fa-info-circle"></i> After confirming both emails, refresh this page to see the updated email address.';
                successElement.appendChild(refreshNote);
            }, 3000);
            
        } catch (error) {
            console.error('Change email error:', error);
            let errorMessage = 'Failed to update email. Please try again.';
            
            if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message.includes('User already registered') || error.message.includes('already registered')) {
                errorMessage = 'This email address is already in use by another account.';
            } else if (error.message.includes('rate limit')) {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (error.message.includes('same email')) {
                errorMessage = 'The new email address must be different from your current email.';
            }
            
            this.showError('update-email-error', errorMessage);
        } finally {
            this.setLoading(submitBtn, false);
        }
    },
    
    // Handle change password
    async handleChangePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitBtn = document.getElementById('change-password-btn');
        
        // Clear previous messages
        this.hideError('change-password-error');
        document.getElementById('change-password-success').classList.add('hidden');
        
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError('change-password-error', 'Please fill in all password fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('change-password-error', 'New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showError('change-password-error', 'New password must be at least 6 characters long');
            return;
        }
        
        if (newPassword === currentPassword) {
            this.showError('change-password-error', 'New password must be different from current password');
            return;
        }
        
        if (!this.supabase) {
            this.showError('change-password-error', 'Authentication service not available');
            return;
        }
        
        this.setLoading(submitBtn, true);
        
        try {
            console.log('🔒 Attempting to change password...');
            
            // Use the simpler approach without current password verification
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Password updated successfully');
            
            // Clear form and show success message
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            
            const successElement = document.getElementById('change-password-success');
            successElement.innerHTML = '<strong>Password updated successfully!</strong> Your new password is now active.';
            successElement.classList.remove('hidden');
            
        } catch (error) {
            console.error('Change password error:', error);
            let errorMessage = 'Failed to update password. Please try again.';
            
            if (error.message.includes('weak_password') || error.message.includes('Password should be')) {
                errorMessage = 'Password is too weak. Please choose a stronger password with at least 6 characters.';
            } else if (error.message.includes('same_password')) {
                errorMessage = 'New password must be different from your current password.';
            } else if (error.message.includes('rate_limit')) {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Current password is incorrect. Please try again.';
            }
            
            this.showError('change-password-error', errorMessage);
        } finally {
            this.setLoading(submitBtn, false);
        }
    },
    
    // Show delete account modal
    showDeleteAccountModal() {
        const deleteAccountModal = document.getElementById('delete-account-modal');
        if (deleteAccountModal) {
            deleteAccountModal.classList.add('visible');
        }
        this.hideUserSettings();
    },
    
    // Hide delete account modal
    hideDeleteAccountModal() {
        const deleteAccountModal = document.getElementById('delete-account-modal');
        if (deleteAccountModal) {
            deleteAccountModal.classList.remove('visible');
        }
        
        // Clear form
        document.getElementById('delete-confirmation-email').value = '';
        document.getElementById('confirm-delete-btn').disabled = true;
        document.getElementById('delete-account-error').classList.add('hidden');
        
        this.showUserSettings(); // Return to user settings
    },
    
    // Validate delete confirmation
    validateDeleteConfirmation() {
        const confirmationEmail = document.getElementById('delete-confirmation-email').value;
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        
        if (confirmationEmail === this.currentUser?.email) {
            confirmDeleteBtn.disabled = false;
        } else {
            confirmDeleteBtn.disabled = true;
        }
    },
    
    // Handle delete account
    async handleDeleteAccount() {
        const confirmationEmail = document.getElementById('delete-confirmation-email').value;
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        
        if (confirmationEmail !== this.currentUser?.email) {
            this.showError('delete-account-error', 'Email address does not match');
            return;
        }
        
        if (!this.supabase) {
            this.showError('delete-account-error', 'Authentication service not available');
            return;
        }
        
        this.setLoading(confirmDeleteBtn, true);
        
        try {
            console.log('🗑️ Attempting to delete user account...');
            
            // Call the database function to delete the user account
            const { data, error } = await this.supabase.rpc('delete_user_account');
            
            if (error) {
                console.error('Delete account error:', error);
                
                // Handle specific errors
                if (error.message.includes('function delete_user_account() does not exist')) {
                    throw new Error('Account deletion is not properly configured. Please contact support for assistance.');
                } else if (error.message.includes('Not authenticated')) {
                    throw new Error('Authentication expired. Please login again.');
                } else {
                    throw error;
                }
            }
            
            console.log('✅ Account deleted successfully');
            
            // Show success message briefly before redirecting
            document.getElementById('delete-account-error').classList.add('hidden');
            const successDiv = document.createElement('div');
            successDiv.className = 'auth-success';
            successDiv.textContent = 'Account deleted successfully. Redirecting...';
            document.getElementById('delete-account-error').parentNode.appendChild(successDiv);
            
            // Sign out and redirect after a brief delay
            setTimeout(async () => {
                try {
                    await this.supabase.auth.signOut();
                } catch (signOutError) {
                    console.log('Sign out after deletion (expected):', signOutError);
                }
                
                // Clear local data
                this.currentUser = null;
                this.currentSession = null;
                this.showAuthGate();
                this.hideDeleteAccountModal();
                
                // Show confirmation
                alert('Your account has been permanently deleted. Thank you for using FrameIt.');
            }, 2000);
            
        } catch (error) {
            console.error('Delete account error:', error);
            this.showError('delete-account-error', error.message || 'Failed to delete account. Please contact support.');
        } finally {
            this.setLoading(confirmDeleteBtn, false);
        }
    },
    
    // Handle forgot password
    handleForgotPassword() {
        const email = document.getElementById('login-email').value;
        
        if (!email) {
            // Show a simple prompt for email if none is entered
            const userEmail = prompt('Enter your email address to reset your password:');
            if (!userEmail) return;
            
            this.sendPasswordReset(userEmail);
        } else {
            this.sendPasswordReset(email);
        }
    },
    
    // Send password reset email
    async sendPasswordReset(email) {
        if (!this.supabase) {
            alert('Authentication service not available. Please try again later.');
            return;
        }
        
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        
        try {
            console.log('📧 Sending password reset email to:', email);
            
            const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Password reset email sent');
            
            // Show success message
            alert(`Password reset email sent to ${email}. Please check your inbox and follow the instructions to reset your password.`);
            
            // Clear the email field
            const emailField = document.getElementById('login-email');
            if (emailField) {
                emailField.value = '';
            }
            
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send password reset email. Please try again.';
            
            if (error.message.includes('rate limit')) {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'No account found with this email address. Please check the email or sign up for a new account.';
            }
            
            alert(errorMessage);
        }
    },
    
    // Switch landing page forms
    switchLandingForm(mode) {
        const loginForm = document.getElementById('landing-login-form');
        const signupForm = document.getElementById('landing-signup-form');
        
        if (mode === 'signup') {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        } else {
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
        }
        
        this.clearLandingForms();
    },
    
    // Clear landing page forms
    clearLandingForms() {
        // Clear login form
        const landingLoginEmail = document.getElementById('landing-login-email');
        const landingLoginPassword = document.getElementById('landing-login-password');
        const landingLoginError = document.getElementById('landing-login-error');
        
        if (landingLoginEmail) landingLoginEmail.value = '';
        if (landingLoginPassword) landingLoginPassword.value = '';
        if (landingLoginError) landingLoginError.classList.add('hidden');
        
        // Clear signup form
        const landingSignupEmail = document.getElementById('landing-signup-email');
        const landingSignupPassword = document.getElementById('landing-signup-password');
        const landingSignupConfirmPassword = document.getElementById('landing-signup-confirm-password');
        const landingSignupError = document.getElementById('landing-signup-error');
        const landingSignupSuccess = document.getElementById('landing-signup-success');
        
        if (landingSignupEmail) landingSignupEmail.value = '';
        if (landingSignupPassword) landingSignupPassword.value = '';
        if (landingSignupConfirmPassword) landingSignupConfirmPassword.value = '';
        if (landingSignupError) landingSignupError.classList.add('hidden');
        if (landingSignupSuccess) landingSignupSuccess.classList.add('hidden');
    },
    
    // Handle landing page login
    async handleLandingLogin(e) {
        e.preventDefault();
        console.log('🔐 Landing login form submitted');
        
        const email = document.getElementById('landing-login-email').value;
        const password = document.getElementById('landing-login-password').value;
        const submitBtn = document.getElementById('landing-login-submit');
        const errorElement = document.getElementById('landing-login-error');
        
        console.log('🔍 Login attempt with:', { email, password: password ? '***' : 'empty', submitBtn: !!submitBtn });
        
        if (!email || !password) {
            console.log('❌ Missing email or password');
            this.showError('landing-login-error', 'Please fill in all fields');
            return;
        }
        
        if (!this.supabase) {
            console.log('❌ Supabase not initialized');
            this.showError('landing-login-error', 'Authentication service not available');
            return;
        }

        this.setLoading(submitBtn, true);
        this.hideError('landing-login-error');
        console.log('🔄 Starting authentication request...');

        try {
            console.log('🔐 Attempting landing login with:', email);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            console.log('📡 Supabase response:', { data: !!data, error: error?.message || 'none' });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Landing login successful');
            this.currentUser = data.user;
            
            // Clear form and show main app
            this.clearLandingForms();
            
        } catch (error) {
            console.error('❌ Landing login error:', error);
            this.showError('landing-login-error', error.message || 'Login failed. Please try again.');
        } finally {
            console.log('🔄 Setting loading to false');
            this.setLoading(submitBtn, false);
        }
    },
    
    // Handle landing page signup
    async handleLandingSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('landing-signup-email').value;
        const password = document.getElementById('landing-signup-password').value;
        const confirmPassword = document.getElementById('landing-signup-confirm-password').value;
        const submitBtn = document.getElementById('landing-signup-submit');
        const errorElement = document.getElementById('landing-signup-error');
        const successElement = document.getElementById('landing-signup-success');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            this.showError('landing-signup-error', 'Passwords do not match.');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            this.showError('landing-signup-error', 'Password must be at least 6 characters long.');
            return;
        }
        
        this.setLoading(submitBtn, true);
        this.hideError('landing-signup-error');
        if (successElement) successElement.classList.add('hidden');
        
        try {
            console.log('📝 Attempting landing signup with:', email);
            
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Landing signup successful:', data);
            
            // Show success message
            if (successElement) {
                successElement.classList.remove('hidden');
            }
            
            // Clear form
            document.getElementById('landing-signup-email').value = '';
            document.getElementById('landing-signup-password').value = '';
            document.getElementById('landing-signup-confirm-password').value = '';
            
        } catch (error) {
            console.error('Landing signup error:', error);
            let errorMessage = 'Signup failed. Please try again.';
            
            if (error.message.includes('User already registered')) {
                errorMessage = 'An account with this email already exists. Please login instead.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message.includes('Password')) {
                errorMessage = 'Password must be at least 6 characters long.';
            }
            
            this.showError('landing-signup-error', errorMessage);
        } finally {
            this.setLoading(submitBtn, false);
        }
    },
    
    // Handle landing page forgot password
    handleLandingForgotPassword() {
        const email = document.getElementById('landing-login-email').value;
        
        if (!email) {
            // Show a simple prompt for email if none is entered
            const userEmail = prompt('Enter your email address to reset your password:');
            if (!userEmail) return;
            
            this.sendPasswordReset(userEmail);
        } else {
            this.sendPasswordReset(email);
        }
    }
}; 
