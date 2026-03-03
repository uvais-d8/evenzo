export const SUCCESS_MESSAGES = {
    PROFILE_UPDATED: "Profile updated successfully!",
    status_updated: (status: string) => `Account status updated to ${status}.`,
    VENDOR_BLOCKED: "Vendor blocked successfully.",
    VENDOR_UNBLOCKED: "Vendor unblocked successfully.",
    USER_BLOCKED: "User blocked successfully.",
    USER_UNBLOCKED: "User unblocked successfully.",
    CATEGORY_CREATED: "Category created successfully.",
    CATEGORY_UPDATED: "Category updated successfully.",
    CATEGORY_DELETED: "Category deleted successfully.",
};

export const ERROR_MESSAGES = {
    DEFAULT: "Something went wrong. Please try again.",
    LOAD_FAILED: "Failed to load data.",
    FETCH_VENDORS_FAILED: "Failed to fetch vendors.",
    FETCH_USERS_FAILED: "Failed to fetch users.",
    FETCH_CATEGORIES_FAILED: "Failed to fetch categories.",
    UNAUTHORIZED: "Unauthorized access. Please login again.",
};
