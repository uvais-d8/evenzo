export interface ICategory {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    isDeleted: boolean;
    createdAt?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminStats {
    totalUsers: number;
    totalVendors: number;
    pendingVendors: number;
    totalBookings: number;
    totalRevenue: number;
}
