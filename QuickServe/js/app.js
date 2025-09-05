/**
 * QuickServe Main Application
 * Initializes the app and handles core functionality
 */

class QuickServeApp {
    constructor() {
        this.currentView = 'home';
        this.selectedRole = null;
        this.authStep = 'roleSelection';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize storage and auth
        console.log('🚀 QuickServe initializing...');
        
        // Check authentication status
        this.checkAuthStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide loading screen
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1500);

        // Load initial content
        this.loadHomeView();

        console.log('✅ QuickServe initialized successfully');
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Check authentication status
     */
    checkAuthStatus() {
        const user = Storage.getCurrentUser();
        
        if (user) {
            this.updateUIForAuthenticatedUser(user);
        } else {
            this.updateUIForGuest();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.closest('a').getAttribute('href').substring(1));
            });
        });

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (Auth.isAuthenticated()) {
                    this.showUserMenu();
                } else {
                    this.showAuthModal();
                }
            });
        }

        // Service tiles
        document.querySelectorAll('.service-tile').forEach(tile => {
            tile.addEventListener('click', (e) => {
                const service = e.currentTarget.getAttribute('data-service');
                this.handleServiceSelection(service);
            });
        });

        // Auth modal
        this.setupAuthModalListeners();

        // Cart and notifications
        this.setupPanelListeners();

        // Search
        this.setupSearchListeners();
    }

    /**
     * Setup authentication modal listeners
     */
    setupAuthModalListeners() {
        // Close modal
        const closeBtn = document.getElementById('closeAuthModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAuthModal());
        }

        // Role selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const role = e.currentTarget.getAttribute('data-role');
                this.selectRole(role);
            });
        });

        // Phone number input
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                const sendOtpBtn = document.getElementById('sendOtpBtn');
                if (sendOtpBtn) {
                    sendOtpBtn.disabled = !Auth.validatePhoneNumber(value);
                }
            });
        }

        // Send OTP
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        if (sendOtpBtn) {
            sendOtpBtn.addEventListener('click', () => this.sendOTP());
        }

        // OTP input auto-advance
        document.querySelectorAll('.otp-digit').forEach((input, index, inputs) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                
                // Check if all digits are entered
                const otp = Array.from(inputs).map(i => i.value).join('');
                const verifyBtn = document.getElementById('verifyOtpBtn');
                if (verifyBtn) {
                    verifyBtn.disabled = otp.length !== 6;
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

        // Verify OTP
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        if (verifyOtpBtn) {
            verifyOtpBtn.addEventListener('click', () => this.verifyOTP());
        }

        // Aadhaar consent
        const aadhaarConsent = document.getElementById('aadhaarConsent');
        if (aadhaarConsent) {
            aadhaarConsent.addEventListener('change', (e) => {
                const verifyAadhaarBtn = document.getElementById('verifyAadhaarBtn');
                const aadhaarNumber = document.getElementById('aadhaarNumber').value;
                if (verifyAadhaarBtn) {
                    verifyAadhaarBtn.disabled = !e.target.checked || !Auth.validateAadhaarNumber(aadhaarNumber);
                }
            });
        }

        // Aadhaar input
        const aadhaarInput = document.getElementById('aadhaarNumber');
        if (aadhaarInput) {
            aadhaarInput.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                const verifyAadhaarBtn = document.getElementById('verifyAadhaarBtn');
                const consent = document.getElementById('aadhaarConsent').checked;
                if (verifyAadhaarBtn) {
                    verifyAadhaarBtn.disabled = !consent || !Auth.validateAadhaarNumber(value);
                }
            });
        }

        // Verify Aadhaar
        const verifyAadhaarBtn = document.getElementById('verifyAadhaarBtn');
        if (verifyAadhaarBtn) {
            verifyAadhaarBtn.addEventListener('click', () => this.verifyAadhaar());
        }

        // Complete profile
        const completeProfileBtn = document.getElementById('completeProfileBtn');
        if (completeProfileBtn) {
            completeProfileBtn.addEventListener('click', () => this.completeProfile());
        }
    }

    /**
     * Setup panel listeners
     */
    setupPanelListeners() {
        // Notification panel
        const notificationBtn = document.getElementById('notificationBtn');
        const closeNotifications = document.getElementById('closeNotifications');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.togglePanel('notificationPanel');
            });
        }
        
        if (closeNotifications) {
            closeNotifications.addEventListener('click', () => {
                this.closePanel('notificationPanel');
            });
        }

        // Cart sidebar
        const cartBtn = document.getElementById('cartBtn');
        const closeCart = document.getElementById('closeCart');
        
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.togglePanel('cartSidebar');
            });
        }
        
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.closePanel('cartSidebar');
            });
        }
    }

    /**
     * Setup search listeners
     */
    setupSearchListeners() {
        const searchInput = document.getElementById('globalSearch');
        const searchBtn = document.querySelector('.search-btn');
        const pinCodeInput = document.getElementById('pinCodeInput');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        if (pinCodeInput) {
            pinCodeInput.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                if (value.length === 6) {
                    Storage.updateSettings({ location: value });
                }
            });
        }
    }

    /**
     * Show authentication modal
     */
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('active');
            this.authStep = 'roleSelection';
            this.showAuthStep('roleSelection');
        }
    }

    /**
     * Close authentication modal
     */
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Select role
     */
    selectRole(role) {
        this.selectedRole = role;
        this.showAuthStep('phoneInput');
    }

    /**
     * Show specific auth step
     */
    showAuthStep(step) {
        // Hide all steps
        document.querySelectorAll('.auth-step').forEach(el => {
            el.classList.add('hidden');
        });

        // Show selected step
        const stepElement = document.getElementById(step);
        if (stepElement) {
            stepElement.classList.remove('hidden');
        }

        this.authStep = step;
    }

    /**
     * Send OTP
     */
    async sendOTP() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (!Auth.validatePhoneNumber(phoneNumber)) {
            Toast.show('Please enter a valid phone number', 'error');
            return;
        }

        // Generate OTP
        Auth.generateOTP();
        
        // Update UI
        document.getElementById('sentToNumber').textContent = '+91 ' + phoneNumber;
        this.showAuthStep('otpVerification');
        
        // Start OTP timer
        this.startOTPTimer();
        
        Toast.show('OTP sent successfully', 'success');
    }

    /**
     * Start OTP timer
     */
    startOTPTimer() {
        let seconds = 30;
        const timerElement = document.getElementById('otpTimer');
        const resendBtn = document.getElementById('resendOtpBtn');
        
        const interval = setInterval(() => {
            seconds--;
            if (timerElement) {
                timerElement.textContent = seconds;
            }
            
            if (seconds <= 0) {
                clearInterval(interval);
                if (resendBtn) {
                    resendBtn.disabled = false;
                }
            }
        }, 1000);
    }

    /**
     * Verify OTP
     */
    async verifyOTP() {
        const otpInputs = document.querySelectorAll('.otp-digit');
        const otp = Array.from(otpInputs).map(i => i.value).join('');
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        const result = Auth.verifyOTP(otp);
        
        if (result.success) {
            // Check if user exists
            const existingUser = Storage.findInCollection('users', 
                u => u.phoneNumber === phoneNumber
            );
            
            if (existingUser) {
                // Login existing user
                Storage.setCurrentUser(existingUser.id);
                this.updateUIForAuthenticatedUser(existingUser);
                this.closeAuthModal();
                Toast.show('Welcome back!', 'success');
            } else {
                // New user - proceed with registration
                if (this.selectedRole === 'provider') {
                    this.showAuthStep('aadhaarKyc');
                } else {
                    this.showAuthStep('profileSetup');
                    
                    // Hide provider-only fields
                    document.querySelectorAll('.provider-only').forEach(el => {
                        el.classList.add('hidden');
                    });
                }
            }
        } else {
            Toast.show(result.message, 'error');
        }
    }

    /**
     * Verify Aadhaar
     */
    async verifyAadhaar() {
        const aadhaarNumber = document.getElementById('aadhaarNumber').value;
        const consent = document.getElementById('aadhaarConsent').checked;
        
        // Show loading state
        const btn = document.getElementById('verifyAadhaarBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Verifying...';
        btn.disabled = true;
        
        const result = await Auth.verifyAadhaar(aadhaarNumber, consent);
        
        // Reset button
        btn.textContent = originalText;
        btn.disabled = false;
        
        if (result.success) {
            Toast.show('Aadhaar verified successfully', 'success');
            this.showAuthStep('profileSetup');
            
            // Show provider fields
            document.querySelectorAll('.provider-only').forEach(el => {
                el.classList.remove('hidden');
            });
        } else {
            Toast.show(result.message, 'error');
        }
    }

    /**
     * Complete profile
     */
    async completeProfile() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        
        if (!fullName) {
            Toast.show('Please enter your full name', 'error');
            return;
        }
        
        // Get selected services for providers
        let services = [];
        if (this.selectedRole === 'provider') {
            const serviceCheckboxes = document.querySelectorAll('.service-tag input:checked');
            services = Array.from(serviceCheckboxes).map(cb => cb.value);
            
            if (services.length === 0) {
                Toast.show('Please select at least one service category', 'error');
                return;
            }
        }
        
        // Register user
        const userData = {
            phoneNumber,
            fullName,
            email,
            role: this.selectedRole,
            services
        };
        
        const result = await Auth.registerUser(userData);
        
        if (result.success) {
            Storage.setCurrentUser(result.user.id);
            this.updateUIForAuthenticatedUser(result.user);
            this.closeAuthModal();
            Toast.show('Registration successful! Welcome to QuickServe', 'success');
        } else {
            Toast.show(result.message, 'error');
        }
    }

    /**
     * Update UI for authenticated user
     */
    updateUIForAuthenticatedUser(user) {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> <span>${user.fullName || 'Profile'}</span>`;
        }
        
        // Update notification badge
        const unreadCount = Storage.getUnreadNotificationsCount();
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Update UI for guest
     */
    updateUIForGuest() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
        }
    }

    /**
     * Handle navigation
     */
    handleNavigation(view) {
        // Update active link
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.category-link[href="#${view}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load view
        this.currentView = view;
        this.loadView(view);
    }

    /**
     * Load view
     */
    loadView(view) {
        const contentContainer = document.getElementById('dynamicContent');
        
        switch (view) {
            case 'services':
                this.loadServicesView();
                break;
            case 'providers':
                this.loadProvidersView();
                break;
            case 'products':
                this.loadProductsView();
                break;
            case 'bookings':
                this.loadBookingsView();
                break;
            case 'offers':
                this.loadOffersView();
                break;
            default:
                this.loadHomeView();
        }
    }

    /**
     * Load home view
     */
    loadHomeView() {
        // Home view is already loaded by default
        document.getElementById('heroSection').style.display = 'block';
        document.getElementById('dynamicContent').innerHTML = '';
    }

    /**
     * Load services view
     */
    loadServicesView() {
        document.getElementById('heroSection').style.display = 'none';
        const content = `
            <section class="py-12">
                <div class="container">
                    <h2 class="text-3xl font-bold mb-8">Our Services</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this.generateServiceCards()}
                    </div>
                </div>
            </section>
        `;
        document.getElementById('dynamicContent').innerHTML = content;
    }

    /**
     * Generate service cards
     */
    generateServiceCards() {
        const services = [
            { name: 'Plumbing', icon: 'fa-wrench', price: '₹500/hr' },
            { name: 'Electrical', icon: 'fa-bolt', price: '₹450/hr' },
            { name: 'Carpentry', icon: 'fa-hammer', price: '₹600/hr' },
            { name: 'Painting', icon: 'fa-paint-roller', price: '₹400/hr' },
            { name: 'Cleaning', icon: 'fa-broom', price: '₹350/hr' },
            { name: 'AC Repair', icon: 'fa-snowflake', price: '₹800/hr' }
        ];
        
        return services.map(service => `
            <div class="glass-card hover:scale-105 transition cursor-pointer">
                <div class="text-center">
                    <i class="fas ${service.icon} text-4xl text-primary-blue mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">${service.name}</h3>
                    <p class="text-gray-600 mb-4">Starting from ${service.price}</p>
                    <button class="glass-btn">Book Now</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load providers view
     */
    loadProvidersView() {
        document.getElementById('heroSection').style.display = 'none';
        // Implementation for providers view
        document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Providers View - Coming Soon</h2></div>';
    }

    /**
     * Load products view
     */
    loadProductsView() {
        document.getElementById('heroSection').style.display = 'none';
        // Implementation for products view
        document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Products View - Coming Soon</h2></div>';
    }

    /**
     * Load bookings view
     */
    loadBookingsView() {
        document.getElementById('heroSection').style.display = 'none';
        
        if (!Auth.isAuthenticated()) {
            Toast.show('Please login to view bookings', 'warning');
            this.showAuthModal();
            return;
        }
        
        // Implementation for bookings view
        document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Your Bookings - Coming Soon</h2></div>';
    }

    /**
     * Load offers view
     */
    loadOffersView() {
        document.getElementById('heroSection').style.display = 'none';
        // Implementation for offers view
        document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Special Offers - Coming Soon</h2></div>';
    }

    /**
     * Handle service selection
     */
    handleServiceSelection(service) {
        if (service === 'more') {
            this.loadServicesView();
        } else {
            // Search for providers of this service
            this.searchProvidersByService(service);
        }
    }

    /**
     * Search providers by service
     */
    searchProvidersByService(service) {
        const providers = Storage.filterCollection('providers', 
            p => p.services && p.services.includes(service)
        );
        
        Toast.show(`Found ${providers.length} ${service} providers near you`, 'info');
        // Load providers view with filtered results
        this.loadProvidersView();
    }

    /**
     * Perform search
     */
    performSearch() {
        const searchTerm = document.getElementById('globalSearch').value;
        const pinCode = document.getElementById('pinCodeInput').value;
        
        if (!searchTerm) {
            Toast.show('Please enter a search term', 'warning');
            return;
        }
        
        // Save to search history
        Storage.saveSearchHistory(searchTerm);
        
        // Perform search logic here
        Toast.show(`Searching for "${searchTerm}"...`, 'info');
    }

    /**
     * Toggle panel
     */
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    /**
     * Close panel
     */
    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('active');
        }
    }

    /**
     * Show user menu
     */
    showUserMenu() {
        // Implementation for user menu dropdown
        Toast.show('User menu coming soon', 'info');
    }
}

// Toast notification helper
class Toast {
    static show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Make Toast globally available
window.Toast = Toast;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuickServeApp();
});
