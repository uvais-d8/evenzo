/**
 * Centralised response / error message constants.
 * Never hard-code strings in controllers or use-cases.
 */
export const Messages = {
    // Auth
    ADMIN_REGISTRATION_NOT_ALLOWED: 'Admin registration is not allowed through this route',
    ADMIN_GOOGLE_NOT_ALLOWED: 'Admin registration via Google is not allowed',
    REGISTRATION_SUCCESSFUL: 'Registration successful. Please verify your email.',
    OTP_SENT: 'OTP sent to your email',
    OTP_RESENT: 'OTP resent successfully',
    OTP_INVALID: 'Invalid OTP',
    OTP_EXPIRED: 'OTP expired',
    VERIFICATION_SUCCESSFUL: 'Verification successful',
    VERIFICATION_FAILED: 'Verification failed',
    REGISTRATION_FAILED: 'Registration failed',
    INVALID_CREDENTIALS: 'Invalid credentials',
    GOOGLE_INVALID_TOKEN: 'Invalid Google token',
    GOOGLE_INVALID_ACCESS_TOKEN: 'Invalid Google access token',
    GOOGLE_EMAIL_MISSING: 'Could not retrieve email from Google',
    GOOGLE_AUTH_FAILED: 'Google authentication failed',
    GOOGLE_LOGIN_SUCCESSFUL: 'Google login successful',
    REFRESH_TOKEN_REQUIRED: 'Refresh token required',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
    REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
    PASSWORD_RESET_SUCCESSFUL: 'Password reset successful',
    FORGOT_PASSWORD_EMAIL_NOT_VERIFIED: 'Email not verified',
    ROLE_REQUIRED: 'Role is required for login',
    LOGIN_SUCCESSFUL: 'Login successful',

    // Access
    ACCESS_DENIED_BLOCKED: 'Access denied. Your account has been blocked by admin.',
    ACCESS_DENIED_INACTIVE: 'Access denied. Your account is inactive or blocked.',
    NO_TOKEN: 'No token provided, access denied',
    INVALID_TOKEN: 'Invalid token',
    FORBIDDEN: 'Forbidden: Access denied',

    // User
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    PROFILE_UPDATED: 'Profile updated successfully',

    // Vendor
    VENDOR_NOT_FOUND: 'Vendor not found',
    VENDOR_PROFILE_UPDATED: 'Profile updated successfully. Your application is under review.',
    EMAIL_ROLE_CONFLICT: (existingRole: string) =>
        `This email is already registered as a ${existingRole}. Please login through the ${existingRole} portal.`,

    // Admin
    VENDOR_STATUS_UPDATED: (status: string) => `Vendor ${status} successfully`,
    VENDOR_INVALID_STATUS: 'Invalid status. Must be approved or rejected',
    VENDOR_BLOCKED: 'Vendor blocked successfully',
    VENDOR_UNBLOCKED: 'Vendor unblocked successfully',
    USER_BLOCKED: 'User blocked successfully',
    USER_UNBLOCKED: 'User unblocked successfully',
    USER_BLOCK_TOGGLED: (blocked: boolean) => `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
    VENDOR_BLOCK_TOGGLED: (blocked: boolean) => `Vendor ${blocked ? 'blocked' : 'unblocked'} successfully`,

    // Category
    CATEGORY_NOT_FOUND: 'Category not found',
    CATEGORY_ALREADY_EXISTS: 'Category name already exists',
    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
} as const;
