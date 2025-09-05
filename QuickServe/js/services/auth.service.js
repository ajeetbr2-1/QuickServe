/**
 * QuickServe Authentication Service
 * Implements Triple-Role system with Aadhaar e-KYC and OTP verification
 */

class AuthenticationService {
    constructor() {
        this.currentOTP = null;
        this.otpExpiry = null;
        this.pendingUser = null;
        this.verificationAttempts = 0;
        this.MAX_ATTEMPTS = 3;
    }

    /**
     * User Roles
     */
    static ROLES = {
        CUSTOMER: 'customer',
        PROVIDER: 'provider',
        OTHER: 'other' // Quick gig worker
    };

    /**
     * Verification Status
     */
    static VERIFICATION_STATUS = {
        UNVERIFIED: 'unverified',
        PHONE_VERIFIED: 'phone_verified',
        AADHAAR_VERIFIED: 'aadhaar_verified',
        FULLY_VERIFIED: 'fully_verified'
    };

    /**
     * Generate OTP
     */
    generateOTP() {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.currentOTP = otp;
        
        // Set expiry to 5 minutes
        this.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        
        // In production, this would send SMS via API
        console.log('Generated OTP:', otp); // For development
        
        // Show OTP in notification for demo
        if (window.Toast) {
            window.Toast.show(`Your OTP is: ${otp}`, 'info');
        }
        
        return true;
    }

    /**
     * Verify OTP
     */
    verifyOTP(inputOTP) {
        // Check if OTP has expired
        if (!this.otpExpiry || new Date() > this.otpExpiry) {
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }

        // Check attempts
        if (this.verificationAttempts >= this.MAX_ATTEMPTS) {
            return { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
        }

        // Verify OTP
        if (inputOTP === this.currentOTP) {
            this.currentOTP = null;
            this.otpExpiry = null;
            this.verificationAttempts = 0;
            return { success: true, message: 'OTP verified successfully' };
        } else {
            this.verificationAttempts++;
            return { 
                success: false, 
                message: `Invalid OTP. ${this.MAX_ATTEMPTS - this.verificationAttempts} attempts remaining.` 
            };
        }
    }

    /**
     * Register new user
     */
    async registerUser(userData) {
        try {
            // Check if phone number already exists
            const existingUser = Storage.findInCollection('users', 
                user => user.phoneNumber === userData.phoneNumber
            );

            if (existingUser) {
                return { 
                    success: false, 
                    message: 'Phone number already registered' 
                };
            }

            // Create user object
            const newUser = {
                ...userData,
                role: userData.role || AuthenticationService.ROLES.CUSTOMER,
                verificationStatus: AuthenticationService.VERIFICATION_STATUS.PHONE_VERIFIED,
                isActive: true,
                profileCompleted: false,
                rating: 0,
                totalReviews: 0,
                joinedAt: new Date().toISOString()
            };

            // Add role-specific fields
            switch (newUser.role) {
                case AuthenticationService.ROLES.PROVIDER:
                    newUser.services = userData.services || [];
                    newUser.availability = {
                        monday: true,
                        tuesday: true,
                        wednesday: true,
                        thursday: true,
                        friday: true,
                        saturday: true,
                        sunday: false
                    };
                    newUser.workingHours = {
                        start: '09:00',
                        end: '18:00'
                    };
                    newUser.serviceRadius = 10; // km
                    newUser.completedJobs = 0;
                    newUser.earnings = 0;
                    newUser.documents = {
                        aadhaar: null,
                        pan: null,
                        certification: []
                    };
                    break;

                case AuthenticationService.ROLES.OTHER:
                    newUser.canUpgradeToProvider = true;
                    newUser.quickJobs = [];
                    newUser.temporaryRating = 0;
                    break;
            }

            // Save user
            const savedUser = Storage.addToCollection('users', newUser);

            // Add to role-specific collection
            if (newUser.role === AuthenticationService.ROLES.PROVIDER) {
                Storage.addToCollection('providers', {
                    userId: savedUser.id,
                    ...savedUser
                });
            } else if (newUser.role === AuthenticationService.ROLES.CUSTOMER) {
                Storage.addToCollection('customers', {
                    userId: savedUser.id,
                    ...savedUser
                });
            } else if (newUser.role === AuthenticationService.ROLES.OTHER) {
                Storage.addToCollection('otherWorkers', {
                    userId: savedUser.id,
                    ...savedUser
                });
            }

            return { 
                success: true, 
                user: savedUser,
                message: 'Registration successful' 
            };

        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                message: 'Registration failed. Please try again.' 
            };
        }
    }

    /**
     * Login user
     */
    async loginUser(phoneNumber, otp) {
        // Verify OTP first
        const otpVerification = this.verifyOTP(otp);
        if (!otpVerification.success) {
            return otpVerification;
        }

        // Find user by phone number
        const user = Storage.findInCollection('users', 
            u => u.phoneNumber === phoneNumber
        );

        if (!user) {
            return { 
                success: false, 
                message: 'User not found. Please register first.' 
            };
        }

        // Set current user
        Storage.setCurrentUser(user.id);

        // Update last login
        Storage.updateInCollection('users', user.id, {
            lastLogin: new Date().toISOString()
        });

        // Add login notification
        Storage.addNotification({
            type: 'login',
            title: 'Login Successful',
            message: `Welcome back, ${user.fullName || 'User'}!`,
            userId: user.id
        });

        return { 
            success: true, 
            user: user,
            message: 'Login successful' 
        };
    }

    /**
     * Logout user
     */
    logoutUser() {
        const currentUser = Storage.getCurrentUser();
        
        if (currentUser) {
            // Add logout notification
            Storage.addNotification({
                type: 'logout',
                title: 'Logged Out',
                message: 'You have been logged out successfully',
                userId: currentUser.id
            });
        }

        // Clear session
        Storage.clearSession();
        
        return { 
            success: true, 
            message: 'Logged out successfully' 
        };
    }

    /**
     * Verify Aadhaar (Mock e-KYC)
     */
    async verifyAadhaar(aadhaarNumber, consent) {
        if (!consent) {
            return { 
                success: false, 
                message: 'Consent is required for Aadhaar verification' 
            };
        }

        // Validate Aadhaar format (12 digits)
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            return { 
                success: false, 
                message: 'Invalid Aadhaar number format' 
            };
        }

        // Mock verification delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock successful verification
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            // Update verification status
            const updatedUser = Storage.updateInCollection('users', currentUser.id, {
                verificationStatus: AuthenticationService.VERIFICATION_STATUS.AADHAAR_VERIFIED,
                aadhaarVerified: true,
                aadhaarLast4: aadhaarNumber.slice(-4),
                aadhaarVerifiedAt: new Date().toISOString()
            });

            // Also update in provider collection if applicable
            if (currentUser.role === AuthenticationService.ROLES.PROVIDER) {
                Storage.updateInCollection('providers', currentUser.id, {
                    verificationStatus: AuthenticationService.VERIFICATION_STATUS.AADHAAR_VERIFIED,
                    aadhaarVerified: true
                });
            }

            return { 
                success: true, 
                message: 'Aadhaar verification successful',
                user: updatedUser
            };
        }

        return { 
            success: false, 
            message: 'User session not found' 
        };
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return Storage.getCurrentUser() !== null;
    }

    /**
     * Get current user role
     */
    getCurrentUserRole() {
        const user = Storage.getCurrentUser();
        return user?.role || null;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        const user = Storage.getCurrentUser();
        return user?.role === role;
    }

    /**
     * Check if user is verified
     */
    isVerified() {
        const user = Storage.getCurrentUser();
        return user?.verificationStatus === AuthenticationService.VERIFICATION_STATUS.FULLY_VERIFIED ||
               user?.verificationStatus === AuthenticationService.VERIFICATION_STATUS.AADHAAR_VERIFIED;
    }

    /**
     * Upgrade "Other" role to Provider
     */
    async upgradeToProvider(userId, aadhaarNumber) {
        const user = Storage.findInCollection('users', u => u.id === userId);
        
        if (!user || user.role !== AuthenticationService.ROLES.OTHER) {
            return { 
                success: false, 
                message: 'User not eligible for upgrade' 
            };
        }

        // Verify Aadhaar first
        const aadhaarVerification = await this.verifyAadhaar(aadhaarNumber, true);
        
        if (!aadhaarVerification.success) {
            return aadhaarVerification;
        }

        // Upgrade user role
        const updatedUser = Storage.updateInCollection('users', userId, {
            role: AuthenticationService.ROLES.PROVIDER,
            verificationStatus: AuthenticationService.VERIFICATION_STATUS.AADHAAR_VERIFIED,
            upgradedAt: new Date().toISOString()
        });

        // Move from otherWorkers to providers collection
        Storage.removeFromCollection('otherWorkers', userId);
        Storage.addToCollection('providers', {
            userId: updatedUser.id,
            ...updatedUser
        });

        // Add notification
        Storage.addNotification({
            type: 'upgrade',
            title: 'Upgrade Successful',
            message: 'Congratulations! You are now a verified service provider.',
            userId: userId
        });

        return { 
            success: true, 
            message: 'Successfully upgraded to Provider',
            user: updatedUser
        };
    }

    /**
     * Generate booking OTP for service verification
     */
    generateBookingOTP(bookingId) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Store OTP with booking
        Storage.updateInCollection('bookings', bookingId, {
            startOTP: otp,
            otpGeneratedAt: new Date().toISOString()
        });

        return otp;
    }

    /**
     * Verify booking OTP (dual verification)
     */
    verifyBookingOTP(bookingId, otp, type = 'start') {
        const booking = Storage.findInCollection('bookings', b => b.id === bookingId);
        
        if (!booking) {
            return { success: false, message: 'Booking not found' };
        }

        const otpField = type === 'start' ? 'startOTP' : 'endOTP';
        
        if (booking[otpField] === otp) {
            // Update booking status
            const status = type === 'start' ? 'in_progress' : 'completed';
            Storage.updateInCollection('bookings', bookingId, {
                status: status,
                [`${type}VerifiedAt`]: new Date().toISOString()
            });

            return { 
                success: true, 
                message: `Service ${type} verified successfully` 
            };
        }

        return { 
            success: false, 
            message: 'Invalid OTP' 
        };
    }

    /**
     * Reset password (via OTP)
     */
    async resetPassword(phoneNumber, newPassword) {
        const user = Storage.findInCollection('users', 
            u => u.phoneNumber === phoneNumber
        );

        if (!user) {
            return { 
                success: false, 
                message: 'User not found' 
            };
        }

        // In real implementation, password would be hashed
        Storage.updateInCollection('users', user.id, {
            password: newPassword, // Should be hashed
            passwordUpdatedAt: new Date().toISOString()
        });

        return { 
            success: true, 
            message: 'Password reset successful' 
        };
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        // Indian phone number validation
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phoneNumber);
    }

    /**
     * Validate Aadhaar number format
     */
    validateAadhaarNumber(aadhaarNumber) {
        // Basic Aadhaar validation (12 digits, doesn't start with 0 or 1)
        const aadhaarRegex = /^[2-9]{1}\d{11}$/;
        return aadhaarRegex.test(aadhaarNumber);
    }

    /**
     * Get verification badge details
     */
    getVerificationBadge(user) {
        if (!user) return null;

        const badges = [];
        
        if (user.phoneVerified || user.verificationStatus === AuthenticationService.VERIFICATION_STATUS.PHONE_VERIFIED) {
            badges.push({
                type: 'phone',
                icon: 'fa-phone-check',
                label: 'Phone Verified',
                color: 'blue'
            });
        }

        if (user.aadhaarVerified || user.verificationStatus === AuthenticationService.VERIFICATION_STATUS.AADHAAR_VERIFIED) {
            badges.push({
                type: 'aadhaar',
                icon: 'fa-id-card-check',
                label: 'Aadhaar Verified',
                color: 'green'
            });
        }

        if (user.rating >= 4.5 && user.totalReviews >= 10) {
            badges.push({
                type: 'top-rated',
                icon: 'fa-star',
                label: 'Top Rated',
                color: 'gold'
            });
        }

        if (user.completedJobs >= 50) {
            badges.push({
                type: 'experienced',
                icon: 'fa-award',
                label: 'Experienced',
                color: 'purple'
            });
        }

        return badges;
    }
}

// Create singleton instance
const Auth = new AuthenticationService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
