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
    hasRunSyncCheck: false, // Flag to prevent repeated sync checks
    
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
            
            // Ensure current user's profile has email
            this.ensureCurrentUserProfile();
            
            this.hideAuthModal(); // Hide modal immediately when signed in
            this.showMainApp();
        } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            this.currentSession = null; // Clear session
            this.showAuthGate();
        }
    },
    
    // Ensure current user's profile exists and has email
    async ensureCurrentUserProfile() {
        if (!this.currentUser?.email || !this.supabase) return;
        
        try {
            console.log('🔍 Checking current user profile...');
            
            // Check if profile exists and has email
            const { data: existingProfile, error } = await this.supabase
                .from('profiles')
                .select('id, email')
                .eq('id', this.currentUser.id)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                console.warn('⚠️ Error checking user profile:', error.message);
                return;
            }
            
            if (!existingProfile) {
                // Create new profile
                try {
                    await this.supabase
                        .from('profiles')
                        .insert({
                            id: this.currentUser.id,
                            email: this.currentUser.email,
                            user_level: 'standard',
                            export_count: 0,
                            canvas_count: 0,
                            upload_count: 0
                        });
                    console.log('✅ Created profile for current user');
                    
                    // Update global statistics
                    await this.updateGlobalStats('new_user', 'standard');
                    
                    // Refresh analytics if open
                    this.refreshAnalyticsIfOpen();
                    
                    // Show notification that stats were updated
                    this.showNotification('Global statistics updated with new user!', 'success');
                } catch (insertError) {
                    console.warn('⚠️ Could not create profile for current user:', insertError.message);
                }
            } else if (!existingProfile.email) {
                // Update existing profile with email
                try {
                    await this.supabase
                        .from('profiles')
                        .update({ email: this.currentUser.email })
                        .eq('id', this.currentUser.id);
                    console.log('✅ Updated current user profile with email');
                } catch (updateError) {
                    console.warn('⚠️ Could not update current user profile:', updateError.message);
                }
            }
        } catch (profileError) {
            console.warn('⚠️ Error ensuring current user profile:', profileError.message);
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
        
        // Update all email displays using the helper method
        this.updateEmailDisplays();
        
        // Show logout button when logged in
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }
        
        this.hideAuthModal();
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
            
            // Try to create/update user profile with email
            if (data.user) {
                try {
                    console.log('📧 Creating/updating user profile with email...');
                    
                    // First try to get existing profile
                    const { data: existingProfile } = await this.supabase
                        .from('profiles')
                        .select('id, email')
                        .eq('id', data.user.id)
                        .single();
                    
                    if (existingProfile) {
                        // Update existing profile with email if it's missing
                        if (!existingProfile.email) {
                            await this.supabase
                                .from('profiles')
                                .update({ email: email })
                                .eq('id', data.user.id);
                            console.log('✅ Updated existing profile with email');
                        }
                    } else {
                        // Create new profile with email
                        await this.supabase
                            .from('profiles')
                            .insert({
                                id: data.user.id,
                                email: email,
                                user_level: 'standard',
                                export_count: 0,
                                canvas_count: 0,
                                upload_count: 0
                            });
                        console.log('✅ Created new profile with email');
                        
                        // Update global statistics
                        await this.updateGlobalStats('new_user', 'standard');
                        
                        // Refresh analytics if open
                        this.refreshAnalyticsIfOpen();
                        
                        // Show notification that stats were updated
                        this.showNotification('Global statistics updated with new user!', 'success');
                    }
                } catch (profileError) {
                    console.warn('⚠️ Could not create/update profile:', profileError.message);
                    // Don't fail signup if profile creation fails
                }
            }
            
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
        console.log('🔍 showUserSettings called, currentUser:', this.currentUser);
        
        const userSettingsModal = document.getElementById('user-settings-modal');
        
        if (userSettingsModal) {
            userSettingsModal.classList.add('visible');
            
            // Update all email displays using the helper method
            this.updateEmailDisplays();
            
            // Set other user fields
            this.setOtherUserFields();
            
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
                } else {
                    // Create default stats if profile loading failed
                    const defaultStats = {
                        level: 'standard', // Use standard level as default (matches database default)
                        exports: 0,
                        canvases: 0,
                        uploads: 0,
                        memberSince: new Date()
                    };
                    this.displayUserStats(defaultStats);
                }
            }).catch(error => {
                console.error('Failed to load user level info:', error);
                // Create default stats with standard level (matches database default)
                const defaultStats = {
                    level: 'standard', // Use standard level as default (matches database default)
                    exports: 0,
                    canvases: 0,
                    uploads: 0,
                    memberSince: new Date()
                };
                this.displayUserStats(defaultStats);
            });
        }
    },
    
    // Set other user fields (member since, verification status)
    setOtherUserFields() {
        const userCreatedDate = document.getElementById('member-since');
        const emailStatus = document.getElementById('verification-status');
        
        // Set member since date
        if (userCreatedDate) {
            if (this.currentUser && this.currentUser.created_at) {
                const createdAt = new Date(this.currentUser.created_at);
                userCreatedDate.textContent = createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                userCreatedDate.textContent = 'Date not available';
            }
        }
        
        // Set verification status
        if (emailStatus) {
            if (this.currentUser && this.currentUser.email_confirmed_at !== null) {
                emailStatus.className = 'verification-status pill-badge verified';
                emailStatus.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            } else {
                emailStatus.className = 'verification-status pill-badge unverified';
                emailStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Unverified';
            }
        }
    },
    
    // Load user level and stats information
    async loadUserLevelInfo() {
        if (!this.supabase || !this.currentUser) return null;
        
        try {
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();
                
            if (error) {
                console.log('Profile not found for user:', this.currentUser.id);
                return null;
            }
            
            console.log('📊 Loaded user profile:', profile);
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
                <span class="user-level-badge pill-badge ${userStats.level}">${this.formatUserLevel(userStats.level)}</span>
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
            
            // Check if user is dev level - use direct profile check
            const isDev = userStats.level === 'dev';
            console.log('🔧 Checking dev access:', { userLevel: userStats.level, isDev });
            
            if (isDev) {
                console.log('📊 Adding Global Statistics section for dev user');
                userStatsSection.innerHTML += `
                    <div class="global-stats-section">
                        <h5><i class="fas fa-globe"></i> Global Statistics</h5>
                        <p class="section-description">View application-wide analytics and usage data.</p>
                        <div class="dev-actions" style="margin-bottom: 16px;">
                            <button onclick="window.Auth.syncExistingUsers()" class="btn primary-btn small-btn">
                                <i class="fas fa-sync-alt"></i>
                                <span>Sync Profile Data</span>
                            </button>
                        </div>
                        <div id="global-analytics-container">
                            <div class="analytics-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Loading global analytics...</p>
                            </div>
                            <div class="analytics-content" style="display: none;">
                                <!-- Analytics content will be inserted here -->
                            </div>
                        </div>
                    </div>
                `;
            } else {
                console.log('👤 Not adding Global Statistics - user level:', userStats.level);
            }
            
            // Insert before the update profile section
            const updateSection = document.querySelector('.user-settings-section:nth-child(2)');
            if (updateSection) {
                updateSection.parentNode.insertBefore(userStatsSection, updateSection);
            }
            
            // Load analytics data for dev users automatically
            if (isDev) {
                console.log('🎯 Loading analytics data automatically for dev user');
                
                // Run one-time sync check for existing users if not already done
                if (!this.hasRunSyncCheck) {
                    console.log('🔧 Running one-time sync check for existing users...');
                    this.hasRunSyncCheck = true;
                    this.checkAndSyncIfNeeded().then(() => {
                        // After sync check, load analytics directly
                        this.loadGlobalAnalytics();
                    });
                } else {
                    // Regular flow for subsequent opens
                this.loadGlobalAnalytics();
                }
            } else {
                console.log('📊 Non-dev user');
            }
        } else {
            // Update existing stats
            const statValues = userStatsSection.querySelectorAll('.stat-value');
            if (statValues[0]) statValues[0].textContent = userStats.exports;
            if (statValues[1]) statValues[1].textContent = userStats.canvases;
            if (statValues[2]) statValues[2].textContent = userStats.uploads;
        }
    },
    
    // Load global analytics data
    async loadGlobalAnalytics() {
        console.log('📊 Loading global analytics data...');
        
        const analyticsContainer = document.getElementById('global-analytics-container');
        console.log('📊 Analytics container found:', !!analyticsContainer);
        
        if (!analyticsContainer) {
            console.log('❌ Analytics container not found');
            return;
        }

        try {
            // Use the Auth module's supabase instance
            const supabase = this.supabase;
            console.log('📊 Using Auth supabase instance:', !!supabase);
            
            if (!supabase) {
                throw new Error('Supabase not available in Auth module');
            }

            console.log('📊 Fetching analytics data from Supabase...');

            // Fetch only global stats (no longer need profiles for recent users)
            const { data: globalData, error: globalError } = await supabase
                .from('global')
                .select('*')
                .single();

            console.log('📊 Raw data received:', { 
                globalData: globalData, 
                globalError: globalError
            });

            let globalStats;

            if (globalError) {
                console.error('Global data error:', globalError);
                
                // If global table doesn't exist, create default stats
                if (globalError.code === 'PGRST116' || globalError.message.includes('does not exist')) {
                    console.log('📊 Global stats table not found, using default values');
                    globalStats = {
                        total_users: 1,
                        standard_users: 1,
                        beta_users: 0,
                        total_exports: 0,
                        total_canvases: 0,
                        total_uploads: 0
                    };
                } else {
                    throw globalError;
                }
            } else {
                globalStats = globalData;
            }
            
            console.log('📊 Processed data:', { globalStats });

            // Hide loading and show content (removed recent users section)
            const loadingDiv = analyticsContainer.querySelector('.analytics-loading');
            const contentDiv = analyticsContainer.querySelector('.analytics-content');
            
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (contentDiv) {
                contentDiv.style.display = 'block';
                contentDiv.innerHTML = `
                    <div class="user-stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${globalStats.total_users}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${globalStats.standard_users}</div>
                            <div class="stat-label">Standard Users</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${globalStats.beta_users}</div>
                            <div class="stat-label">Beta Users</div>
                        </div>
                    </div>
                    
                    <div class="user-stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${globalStats.total_exports}</div>
                            <div class="stat-label">Total Exports</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${globalStats.total_canvases}</div>
                            <div class="stat-label">Total Canvases</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${globalStats.total_uploads}</div>
                            <div class="stat-label">Total Uploads</div>
                        </div>
                    </div>
                `;
            }

            console.log('✅ Global analytics loaded successfully');

        } catch (error) {
            console.error('❌ Failed to load global analytics:', error);
            
            const loadingDiv = analyticsContainer.querySelector('.analytics-loading');
            if (loadingDiv) {
                loadingDiv.innerHTML = `
                    <div class="analytics-error" style="text-align: center; padding: 20px; color: #dc2626;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 12px;"></i>
                        <h4 style="margin: 0 0 8px 0;">Failed to Load Analytics</h4>
                        <p style="margin: 0 0 16px 0; color: #a1a1aa;">${error.message}</p>
                        <button onclick="window.Auth.loadGlobalAnalytics()" class="btn primary-btn" style="padding: 8px 16px; font-size: 13px;">
                            <i class="fas fa-refresh"></i>
                            Retry
                        </button>
                    </div>
                `;
            }
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

    // Get user level color
    getUserLevelColor(level) {
        const colors = {
            'standard': { bg: '#10b981', text: 'white' },
            'beta': { bg: '#3b82f6', text: 'white' },
            'dev': { bg: '#8b5cf6', text: 'white' }
        };
        return colors[level] || colors['standard'];
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
        // Clear form inputs (excluding the account settings email display)
        const inputs = document.querySelectorAll('#user-settings-modal input');
        inputs.forEach(input => {
            // Don't clear the email display element (it's a span, not input anyway)
                input.value = '';
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
            
            // Try to create/update user profile with email
            if (data.user) {
                try {
                    console.log('📧 Creating/updating user profile with email...');
                    
                    // First try to get existing profile
                    const { data: existingProfile } = await this.supabase
                        .from('profiles')
                        .select('id, email')
                        .eq('id', data.user.id)
                        .single();
                    
                    if (existingProfile) {
                        // Update existing profile with email if it's missing
                        if (!existingProfile.email) {
                            await this.supabase
                                .from('profiles')
                                .update({ email: email })
                                .eq('id', data.user.id);
                            console.log('✅ Updated existing profile with email');
                        }
                    } else {
                        // Create new profile with email
                        await this.supabase
                            .from('profiles')
                            .insert({
                                id: data.user.id,
                                email: email,
                                user_level: 'standard',
                                export_count: 0,
                                canvas_count: 0,
                                upload_count: 0
                            });
                        console.log('✅ Created new profile with email');
                        
                        // Update global statistics
                        await this.updateGlobalStats('new_user', 'standard');
                        
                        // Refresh analytics if open
                        this.refreshAnalyticsIfOpen();
                        
                        // Show notification that stats were updated
                        this.showNotification('Global statistics updated with new user!', 'success');
                    }
                } catch (profileError) {
                    console.warn('⚠️ Could not create/update profile:', profileError.message);
                    // Don't fail signup if profile creation fails
                }
            }
            
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
    },

    // Update email displays throughout the app
    updateEmailDisplays() {
        if (!this.currentUser?.email) {
            console.warn('⚠️ No user email available to update displays');
            return;
        }

        const email = this.currentUser.email;
        console.log('📧 Updating email displays to:', email);

        // Update account button in toolbar
        const accountBtn = document.getElementById('account-btn');
        if (accountBtn) {
            const accountSpan = accountBtn.querySelector('span');
            if (accountSpan) {
                accountSpan.textContent = email;
                console.log('✅ Updated account button email');
            }
        }

        // Update account settings modal if it's open
        const accountSettingsEmail = document.getElementById('account-settings-email');
        if (accountSettingsEmail) {
            accountSettingsEmail.textContent = email;
            console.log('✅ Updated account settings email');
        }

        // Update any other email displays as needed
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(element => {
            element.textContent = email;
        });
    },

    // Backfill emails for existing user profiles
    async backfillProfileEmails() {
        if (!this.supabase) {
            console.warn('⚠️ Supabase not available for email backfill');
            return;
        }

        try {
            console.log('🔧 Starting email backfill for existing profiles...');
            
            // Get profiles without emails
            const { data: profilesWithoutEmails, error: profilesError } = await this.supabase
                .from('profiles')
                .select('id, email')
                .is('email', null);
            
            if (profilesError) {
                console.error('❌ Error fetching profiles without emails:', profilesError);
                return;
            }
            
            if (!profilesWithoutEmails || profilesWithoutEmails.length === 0) {
                console.log('✅ All profiles already have emails');
                return;
            }
            
            console.log(`📧 Found ${profilesWithoutEmails.length} profiles without emails`);
            
            // Try to get auth users to match with profiles
            try {
                const { data: authUsers, error: authError } = await this.supabase.auth.admin.listUsers();
                
                if (authError) {
                    console.warn('⚠️ Cannot access admin API for email backfill:', authError.message);
                    return;
                }
                
                let updatedCount = 0;
                
                // Update each profile with its corresponding auth user email
                for (const profile of profilesWithoutEmails) {
                    const authUser = authUsers.users?.find(u => u.id === profile.id);
                    
                    if (authUser?.email) {
                        try {
                            await this.supabase
                                .from('profiles')
                                .update({ email: authUser.email })
                                .eq('id', profile.id);
                            
                            updatedCount++;
                            console.log(`✅ Updated profile ${profile.id.slice(0, 8)}... with email ${authUser.email}`);
                        } catch (updateError) {
                            console.warn(`⚠️ Failed to update profile ${profile.id.slice(0, 8)}...:`, updateError.message);
                        }
                    }
                }
                
                console.log(`🎉 Email backfill complete: Updated ${updatedCount} out of ${profilesWithoutEmails.length} profiles`);
                
            } catch (adminError) {
                console.warn('⚠️ Admin API not available for email backfill:', adminError.message);
            }
            
        } catch (error) {
            console.error('❌ Error during email backfill:', error);
        }
    },

    // Update global statistics
    async updateGlobalStats(action, level) {
        if (!this.supabase) {
            console.warn('⚠️ Supabase not available for global stats update');
            return;
        }

        // Skip global stats update for dev users
        if (level === 'dev') {
            console.log('📊 Skipping global stats update for dev user');
            return;
        }

        try {
            console.log(`🔄 Updating global stats: action=${action}, level=${level}`);
            
            // Try using the database function first
            const { data, error } = await this.supabase.rpc('update_global_stats', {
                action: action,
                level: level
            });
            
            if (error) {
                if (error.message.includes('function update_global_stats() does not exist')) {
                    console.warn('⚠️ Global stats function not available, using manual update');
                    await this.manualUpdateGlobalStats(action, level);
                } else {
                    console.error('Failed to update global stats:', error);
                }
            } else {
                console.log('✅ Global stats updated successfully');
            }
        } catch (error) {
            console.error('❌ Error updating global stats:', error);
        }
    },

    // Manual update of global statistics (fallback)
    async manualUpdateGlobalStats(action, level) {
        if (action !== 'new_user') return;
        
        // Skip global stats update for dev users
        if (level === 'dev') {
            console.log('📊 Skipping global stats update for dev user');
            return;
        }
        
        try {
            // Get current global stats
            const { data: currentStats, error: fetchError } = await this.supabase
                .from('global')
                .select('*')
                .single();
            
            if (fetchError) {
                console.error('Failed to fetch current global stats:', fetchError);
                return;
            }
            
            // Calculate new values
            const updates = {
                total_users: currentStats.total_users + 1
            };
            
            if (level === 'standard') {
                updates.standard_users = currentStats.standard_users + 1;
            } else if (level === 'beta') {
                updates.beta_users = currentStats.beta_users + 1;
            }
            
            // Update global stats
            const { error: updateError } = await this.supabase
                .from('global')
                .update(updates)
                .eq('id', currentStats.id);
            
            if (updateError) {
                console.error('Failed to manually update global stats:', updateError);
            } else {
                console.log('✅ Global stats updated manually');
            }
        } catch (error) {
            console.error('❌ Error in manual global stats update:', error);
        }
    },

    // Refresh analytics if open
    refreshAnalyticsIfOpen() {
        // Check if user settings modal is open and has analytics section
        const userSettingsModal = document.getElementById('user-settings-modal');
        const analyticsContainer = document.getElementById('global-analytics-container');
        
        if (userSettingsModal && userSettingsModal.classList.contains('visible') && analyticsContainer) {
            console.log('🔄 Refreshing analytics data...');
            
            // Add a small delay to ensure database updates are complete, then reload analytics
            setTimeout(() => {
                this.loadGlobalAnalytics();
            }, 1000);
        }
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 400px;
            word-wrap: break-word;
            line-height: 1.4;
        `;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> ${message}`;
        document.body.appendChild(notification);
        
        // Remove notification after 6 seconds for longer messages, 4 for short ones
        const duration = message.length > 100 ? 6000 : 4000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    },

    // Sync existing users (migration for users created before this system)
    async syncExistingUsers() {
        if (!this.supabase) {
            console.warn('⚠️ Supabase not available for user sync');
            return;
        }

        try {
            console.log('🔧 Starting user sync (client-side)...');
            this.showNotification('Starting user sync process...', 'info');

            // Step 1: Ensure current user has proper profile
            let currentUserFixed = false;
            if (this.currentUser) {
                await this.ensureCurrentUserProfile();
                currentUserFixed = true;
                console.log('✅ Ensured current user profile exists');
            }

            // Step 2: Get all existing profiles to analyze the data
            const { data: existingProfiles, error: profilesError } = await this.supabase
                .from('profiles')
                .select('id, email, user_level, export_count, canvas_count, upload_count, created_at');
            
            if (profilesError) {
                console.error('❌ Error fetching existing profiles:', profilesError);
                this.showNotification('Error accessing profile data: ' + profilesError.message, 'error');
                return;
            }

            console.log(`📊 Found ${existingProfiles.length} existing profiles`);

            // Step 3: Count profiles without emails
            const profilesWithoutEmails = existingProfiles.filter(p => !p.email);
            console.log(`📊 Found ${profilesWithoutEmails.length} profiles without emails`);

            // Step 4: Recalculate and update global statistics based on existing profiles
            await this.recalculateGlobalStats();

            // Step 5: Show completion summary
            let summary = `User sync complete!\n• Analyzed ${existingProfiles.length} profiles`;
            
            if (currentUserFixed) {
                summary += `\n• Fixed current user profile`;
            }
            
            if (profilesWithoutEmails.length > 0) {
                summary += `\n• Found ${profilesWithoutEmails.length} profiles without emails`;
                summary += `\n• These will be fixed when users log in`;
            }
            
            summary += `\n• Recalculated global statistics`;
            
            console.log('🎉 ' + summary.replace(/\n/g, ' '));
            this.showNotification(summary.replace(/\n/g, '<br>'), 'success');

            // Step 6: Refresh analytics if open
            this.refreshAnalyticsIfOpen();

        } catch (error) {
            console.error('❌ Error during user sync:', error);
            this.showNotification('User sync failed: ' + error.message, 'error');
        }
    },

    // Recalculate global statistics from scratch
    async recalculateGlobalStats() {
        try {
            console.log('📊 Recalculating global statistics...');

            // Get all profiles with counts, excluding dev users from global stats
            const { data: allProfiles, error: profilesError } = await this.supabase
                .from('profiles')
                .select('user_level, export_count, canvas_count, upload_count');
            
            if (profilesError) {
                console.error('❌ Error fetching profiles for stats calculation:', profilesError);
                return;
            }

            // Filter out dev users for global statistics
            const nonDevProfiles = allProfiles.filter(p => p.user_level !== 'dev');

            // Calculate totals excluding dev users
            const stats = {
                total_users: nonDevProfiles.length,
                standard_users: nonDevProfiles.filter(p => p.user_level === 'standard').length,
                beta_users: nonDevProfiles.filter(p => p.user_level === 'beta').length,
                total_exports: nonDevProfiles.reduce((sum, p) => sum + (p.export_count || 0), 0),
                total_canvases: nonDevProfiles.reduce((sum, p) => sum + (p.canvas_count || 0), 0),
                total_uploads: nonDevProfiles.reduce((sum, p) => sum + (p.upload_count || 0), 0)
            };

            console.log('📊 Calculated stats (excluding dev users):', stats);
            console.log('📊 Total profiles found:', allProfiles.length);
            console.log('📊 Dev users excluded:', allProfiles.length - nonDevProfiles.length);

            // Update global stats table
            const { error: updateError } = await this.supabase
                .from('global')
                .update(stats)
                .eq('id', 1); // Assuming global stats row has id = 1

            if (updateError) {
                console.error('❌ Error updating global stats:', updateError);
            } else {
                console.log('✅ Global statistics recalculated and updated');
            }

        } catch (error) {
            console.error('❌ Error recalculating global stats:', error);
        }
    },

    // Calculate stats from profiles when global table not available
    calculateStatsFromProfiles(profiles) {
        // Filter out dev users for global statistics
        const nonDevProfiles = profiles.filter(p => p.user_level !== 'dev');
        
        const stats = {
            total_users: nonDevProfiles.length,
            standard_users: nonDevProfiles.filter(p => p.user_level === 'standard').length,
            beta_users: nonDevProfiles.filter(p => p.user_level === 'beta').length,
            total_exports: nonDevProfiles.reduce((sum, p) => sum + (p.export_count || 0), 0),
            total_canvases: nonDevProfiles.reduce((sum, p) => sum + (p.canvas_count || 0), 0),
            total_uploads: nonDevProfiles.reduce((sum, p) => sum + (p.upload_count || 0), 0)
        };
        
        console.log('📊 Calculated stats from profiles (excluding dev users):', stats);
        console.log('📊 Total profiles:', profiles.length);
        console.log('📊 Dev users excluded:', profiles.length - nonDevProfiles.length);
        return stats;
    },

    // Check if sync is needed and run it automatically
    async checkAndSyncIfNeeded() {
        if (!this.supabase) {
            console.warn('⚠️ Supabase not available for sync check');
            return;
        }

        try {
            console.log('🔍 Checking if user sync is needed...');

            // Check current user profile and profiles without emails
            const [currentUserCheck, profilesData] = await Promise.all([
                this.currentUser ? this.supabase
                    .from('profiles')
                    .select('id, email')
                    .eq('id', this.currentUser.id)
                    .single() : Promise.resolve({ data: null }),
                this.supabase.from('profiles').select('id, email', { count: 'exact' }).is('email', null)
            ]);

            const profilesWithoutEmails = profilesData.count || 0;
            const currentUserNeedsProfile = this.currentUser && (!currentUserCheck.data || !currentUserCheck.data.email);

            console.log(`📊 Profiles without emails: ${profilesWithoutEmails}`);
            console.log(`📊 Current user needs profile fix: ${currentUserNeedsProfile}`);

            // If there are profiles without emails or current user needs fixing, run sync
            if (profilesWithoutEmails > 0 || currentUserNeedsProfile) {
                console.log('🔧 Running sync to fix profile issues...');
                await this.syncExistingUsers();
            } else {
                console.log('✅ User sync not needed, profiles look good');
            }

        } catch (error) {
            console.warn('⚠️ Error checking sync status:', error.message);
        }
    },

    // Track image upload (fallback when Analytics module not available)
    async trackImageUpload() {
        if (!this.supabase || !this.currentUser) {
            console.warn('⚠️ Cannot track upload - no auth or user');
            return { success: false, reason: 'Not authenticated' };
        }

        try {
            console.log('📊 Auth: Tracking image upload for user:', this.currentUser.id);
            
            // First try using the database function
            const { data, error } = await this.supabase.rpc('increment_upload_count', {
                user_id: this.currentUser.id
            });

            if (error) {
                if (error.message.includes('function increment_upload_count() does not exist')) {
                    console.warn('⚠️ Upload count function not available, using manual update');
                    return await this.manualUpdateUploadCount();
                } else {
                    throw error;
                }
            }

            console.log('✅ Upload tracked successfully:', data);
            
            // Refresh analytics if open
            this.refreshAnalyticsIfOpen();
            
            return { success: true, data: data };

        } catch (error) {
            console.error('❌ Failed to track upload:', error);
            return { success: false, error: error.message };
        }
    },

    // Manual upload count update (fallback)
    async manualUpdateUploadCount() {
        try {
            console.log('📊 Starting manual upload count update...');
            console.log('📊 Current user:', this.currentUser?.id);
            
            // Get current profile with user_level
            const { data: profile, error: fetchError } = await this.supabase
                .from('profiles')
                .select('upload_count, user_level')
                .eq('id', this.currentUser.id)
                .single();

            console.log('📊 Current profile fetch result:', { profile, fetchError });

            if (fetchError) {
                console.error('Failed to fetch current upload count:', fetchError);
                return { success: false, error: fetchError.message };
            }

            const newUploadCount = (profile.upload_count || 0) + 1;
            console.log('📊 Updating upload count from', profile.upload_count, 'to', newUploadCount);

            // Update profile
            const { data: updateData, error: updateError } = await this.supabase
                .from('profiles')
                .update({ upload_count: newUploadCount })
                .eq('id', this.currentUser.id)
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
            
            // Refresh analytics if open
            this.refreshAnalyticsIfOpen();

            return { success: true, data: { new_upload_count: newUploadCount } };

        } catch (error) {
            console.error('❌ Manual upload count update failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Update global upload count
    async updateGlobalUploadCount() {
        try {
            console.log('📊 Starting global upload count update...');
            
            const { data: currentStats, error: fetchError } = await this.supabase
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

            const { data: updateData, error: updateError } = await this.supabase
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

    // Track canvas creation (fallback when Analytics module not available)
    async trackCanvasCreated() {
        if (!this.supabase || !this.currentUser) {
            console.warn('⚠️ Cannot track canvas creation - no auth or user');
            return { success: false, reason: 'Not authenticated' };
        }

        try {
            console.log('📊 Auth: Tracking canvas creation for user:', this.currentUser.id);
            
            // First try using the database function
            const { data, error } = await this.supabase.rpc('increment_canvas_count', {
                user_id: this.currentUser.id
            });

            if (error) {
                if (error.message.includes('function increment_canvas_count() does not exist')) {
                    console.warn('⚠️ Canvas count function not available, using manual update');
                    return await this.manualUpdateCanvasCount();
                } else {
                    throw error;
                }
            }

            console.log('✅ Canvas creation tracked successfully:', data);
            
            // Refresh analytics if open
            this.refreshAnalyticsIfOpen();
            
            return { success: true, data: data };

        } catch (error) {
            console.error('❌ Failed to track canvas creation:', error);
            return { success: false, error: error.message };
        }
    },

    // Manual canvas count update (fallback)
    async manualUpdateCanvasCount() {
        try {
            // Get current profile with user_level
            const { data: profile, error: fetchError } = await this.supabase
                .from('profiles')
                .select('canvas_count, user_level')
                .eq('id', this.currentUser.id)
                .single();

            if (fetchError) {
                console.error('Failed to fetch current canvas count:', fetchError);
                return { success: false, error: fetchError.message };
            }

            const newCanvasCount = (profile.canvas_count || 0) + 1;

            // Update profile
            const { error: updateError } = await this.supabase
                .from('profiles')
                .update({ canvas_count: newCanvasCount })
                .eq('id', this.currentUser.id);

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
            
            // Refresh analytics if open
            this.refreshAnalyticsIfOpen();

            return { success: true, data: { new_canvas_count: newCanvasCount } };

        } catch (error) {
            console.error('❌ Manual canvas count update failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Update global canvas count
    async updateGlobalCanvasCount() {
        try {
            const { data: currentStats, error: fetchError } = await this.supabase
                .from('global')
                .select('total_canvases')
                .single();

            if (fetchError) {
                console.warn('Could not fetch global stats for canvas update:', fetchError);
                return;
            }

            const { error: updateError } = await this.supabase
                .from('global')
                .update({ total_canvases: (currentStats.total_canvases || 0) + 1 })
                .eq('id', currentStats.id);

            if (updateError) {
                console.warn('Could not update global canvas count:', updateError);
            } else {
                console.log('✅ Global canvas count updated');
            }

        } catch (error) {
            console.warn('Error updating global canvas count:', error);
        }
    },
}; 
