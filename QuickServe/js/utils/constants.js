/**
 * QuickServe Constants and Configuration
 */

const CONSTANTS = {
    // Application Info
    APP_NAME: 'QuickServe',
    APP_VERSION: '1.0.0',
    APP_TAGLINE: 'Local Services at Your Doorstep',
    
    // API Endpoints (for future implementation)
    API: {
        BASE_URL: 'https://api.quickserve.in/v1',
        SMS_GATEWAY: 'https://sms.quickserve.in/send',
        PAYMENT_GATEWAY: 'https://payment.quickserve.in/process',
        AADHAAR_VERIFY: 'https://aadhaar.quickserve.in/verify'
    },
    
    // Service Categories
    SERVICES: {
        PLUMBER: { id: 'plumber', name: 'Plumber', icon: 'fa-wrench', basePrice: 500 },
        ELECTRICIAN: { id: 'electrician', name: 'Electrician', icon: 'fa-bolt', basePrice: 450 },
        CARPENTER: { id: 'carpenter', name: 'Carpenter', icon: 'fa-hammer', basePrice: 600 },
        PAINTER: { id: 'painter', name: 'Painter', icon: 'fa-paint-roller', basePrice: 400 },
        CLEANER: { id: 'cleaner', name: 'Cleaner', icon: 'fa-broom', basePrice: 350 },
        AC_REPAIR: { id: 'ac-repair', name: 'AC Repair', icon: 'fa-snowflake', basePrice: 800 },
        APPLIANCE: { id: 'appliance', name: 'Appliance Repair', icon: 'fa-tv', basePrice: 700 },
        PEST_CONTROL: { id: 'pest-control', name: 'Pest Control', icon: 'fa-bug', basePrice: 1200 },
        SALON: { id: 'salon', name: 'Salon', icon: 'fa-cut', basePrice: 300 },
        MASSAGE: { id: 'massage', name: 'Massage', icon: 'fa-spa', basePrice: 800 }
    },
    
    // Booking Status
    BOOKING_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded'
    },
    
    // Payment Methods
    PAYMENT_METHODS: {
        UPI: { id: 'upi', name: 'UPI', icon: 'fa-mobile-alt' },
        CARD: { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
        NETBANKING: { id: 'netbanking', name: 'Net Banking', icon: 'fa-university' },
        WALLET: { id: 'wallet', name: 'Wallet', icon: 'fa-wallet' },
        COD: { id: 'cod', name: 'Cash on Delivery', icon: 'fa-money-bill' }
    },
    
    // Time Slots
    TIME_SLOTS: [
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00',
        '17:00 - 18:00',
        '18:00 - 19:00',
        '19:00 - 20:00'
    ],
    
    // Rating Thresholds
    RATING: {
        TOP_RATED: 4.5,
        GOOD: 4.0,
        AVERAGE: 3.5,
        MIN_REVIEWS_FOR_BADGE: 10
    },
    
    // Provider Experience Levels
    EXPERIENCE_LEVELS: {
        BEGINNER: { min: 0, max: 1, label: 'Beginner' },
        INTERMEDIATE: { min: 1, max: 3, label: 'Intermediate' },
        EXPERIENCED: { min: 3, max: 5, label: 'Experienced' },
        EXPERT: { min: 5, max: null, label: 'Expert' }
    },
    
    // Commission Rates (percentage)
    COMMISSION: {
        PROVIDER: 15,
        OTHER: 20,
        REFERRAL: 5
    },
    
    // Cancellation Policy
    CANCELLATION: {
        FREE_CANCELLATION_HOURS: 2,
        CANCELLATION_FEE_PERCENT: 10
    },
    
    // OTP Configuration
    OTP: {
        LENGTH: 6,
        EXPIRY_MINUTES: 5,
        MAX_ATTEMPTS: 3,
        RESEND_DELAY_SECONDS: 30
    },
    
    // Search Configuration
    SEARCH: {
        MIN_QUERY_LENGTH: 3,
        MAX_RESULTS: 20,
        DEFAULT_RADIUS_KM: 10,
        MAX_RADIUS_KM: 50
    },
    
    // Notification Types
    NOTIFICATIONS: {
        BOOKING_CONFIRMED: 'booking_confirmed',
        BOOKING_CANCELLED: 'booking_cancelled',
        PROVIDER_ASSIGNED: 'provider_assigned',
        SERVICE_STARTED: 'service_started',
        SERVICE_COMPLETED: 'service_completed',
        PAYMENT_RECEIVED: 'payment_received',
        REVIEW_REQUEST: 'review_request',
        PROMO_OFFER: 'promo_offer'
    },
    
    // Languages
    LANGUAGES: {
        EN: { code: 'en', name: 'English', flag: '🇬🇧' },
        HI: { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        TA: { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        TE: { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        BN: { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
        MR: { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        GU: { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' }
    },
    
    // Indian States and UTs
    STATES: [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi',
        'Jammu and Kashmir',
        'Ladakh',
        'Lakshadweep',
        'Puducherry'
    ],
    
    // Major Cities
    CITIES: {
        TIER1: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
        TIER2: ['Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam'],
        TIER3: ['Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut']
    },
    
    // Validation Patterns
    VALIDATION: {
        PHONE: /^[6-9]\d{9}$/,
        AADHAAR: /^[2-9]{1}\d{11}$/,
        PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PINCODE: /^[1-9][0-9]{5}$/,
        GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        AUTH_REQUIRED: 'Please login to continue.',
        INVALID_OTP: 'Invalid OTP. Please try again.',
        EXPIRED_OTP: 'OTP has expired. Please request a new one.',
        INVALID_PHONE: 'Please enter a valid phone number.',
        INVALID_AADHAAR: 'Please enter a valid Aadhaar number.',
        SERVICE_UNAVAILABLE: 'Service is currently unavailable in your area.',
        BOOKING_FAILED: 'Failed to create booking. Please try again.',
        PAYMENT_FAILED: 'Payment failed. Please try again.'
    },
    
    // Success Messages
    SUCCESS: {
        OTP_SENT: 'OTP sent successfully.',
        LOGIN_SUCCESS: 'Login successful.',
        REGISTER_SUCCESS: 'Registration successful.',
        BOOKING_SUCCESS: 'Booking confirmed successfully.',
        PAYMENT_SUCCESS: 'Payment completed successfully.',
        PROFILE_UPDATED: 'Profile updated successfully.',
        REVIEW_SUBMITTED: 'Thank you for your feedback!'
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        USER_DATA: 'quickserve_user',
        AUTH_TOKEN: 'quickserve_token',
        CART: 'quickserve_cart',
        PREFERENCES: 'quickserve_preferences',
        SEARCH_HISTORY: 'quickserve_search_history'
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_CHAT: true,
        ENABLE_VIDEO_CALL: false,
        ENABLE_WALLET: true,
        ENABLE_REFERRAL: true,
        ENABLE_LOYALTY: true,
        ENABLE_SURGE_PRICING: false,
        ENABLE_ADVANCE_BOOKING: true,
        ENABLE_RECURRING_BOOKING: true
    },
    
    // Smart Ranking Weights
    RANKING_WEIGHTS: {
        STATUS: 0.3,
        DISTANCE: 0.25,
        RATING: 0.25,
        VERIFICATION: 0.2
    },
    
    // Default Values
    DEFAULTS: {
        CURRENCY: '₹',
        COUNTRY_CODE: '+91',
        DATE_FORMAT: 'DD/MM/YYYY',
        TIME_FORMAT: '12h',
        DEFAULT_AVATAR: 'https://ui-avatars.com/api/?name=User&background=4169E1&color=fff',
        MAX_FILE_SIZE_MB: 5,
        SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif']
    }
};

// Freeze the constants object to prevent modifications
Object.freeze(CONSTANTS);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}
