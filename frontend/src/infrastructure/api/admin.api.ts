import { axiosClient } from '../http/axiosClient';
import { IVendor } from '../../core/types/vendor.types';
import { IUser } from '../../core/types/user.types';
import { AdminStats, PaginatedResponse } from '../../core/types/category.types';
import { VendorStatus } from '../../core/enums/VendorStatus.enum';

const ADMIN = '/admin';

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export const adminApi = {
    // Dashboard
    getStats: () => axiosClient.get<AdminStats>(`${ADMIN}/stats`),

    // Vendor management (all paginated)
    getPendingVendors: (params?: PaginationParams) =>
        axiosClient.get<PaginatedResponse<IVendor>>(`${ADMIN}/vendors/pending`, { params }),

    getApprovedVendors: (params?: PaginationParams) =>
        axiosClient.get<PaginatedResponse<IVendor>>(`${ADMIN}/vendors/approved`, { params }),

    getAllVendors: (params?: PaginationParams) =>
        axiosClient.get<PaginatedResponse<IVendor>>(`${ADMIN}/vendors`, { params }),

    verifyVendor: (vendorId: string, status: VendorStatus, rejectionReason?: string) =>
        axiosClient.put<{ message: string; vendor: IVendor }>(
            `${ADMIN}/vendors/${vendorId}/verify`,
            { status, rejectionReason }
        ),

    toggleBlockVendor: (vendorId: string) =>
        axiosClient.patch<{ message: string; isBlocked: boolean }>(
            `${ADMIN}/vendors/${vendorId}/toggle-block`
        ),

    // User management (paginated)
    getUsers: (params?: PaginationParams) =>
        axiosClient.get<PaginatedResponse<IUser>>(`${ADMIN}/users`, { params }),

    toggleBlockUser: (id: string) =>
        axiosClient.patch<{ message: string; isBlocked: boolean }>(
            `${ADMIN}/users/${id}/toggle-block`
        ),
};
