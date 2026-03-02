export const AppMessages = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SESSION_EXPIRED: 'Session expired. Please log in again.',
    ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
} as const;

export const AppRoutes = {
    // User
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_OTP: '/verify-otp',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    HOME: '/',

    // Vendor
    VENDOR_LOGIN: '/vendor/login',
    VENDOR_SIGNUP: '/vendor/signup',
    VENDOR_DASHBOARD: '/vendor/dashboard',

    // Admin
    ADMIN_LOGIN: '/admin/login',
    ADMIN_DASHBOARD: '/admin/dashboard',
} as const;
