import { IAdminRepository, PaginationParams } from '../../core/repositories/IAdminRepository';
import { IVendor } from '../../core/types/vendor.types';
import { IUser } from '../../core/types/user.types';
import { AdminStats, PaginatedResponse } from '../../core/types/category.types';
import { VendorStatus } from '../../core/enums/enum';
import { axiosClient } from '../http/axiosClient';

export const adminRepository: IAdminRepository = {
    async getStats(): Promise<AdminStats> {
        const { data } = await axiosClient.get<AdminStats>('/admin/stats');
        return data;
    },

    async getVendors(status?: VendorStatus, params?: PaginationParams): Promise<PaginatedResponse<IVendor>> {
        let url = '/admin/vendors';
        if (status === VendorStatus.PENDING) url = '/admin/vendors/pending';
        if (status === VendorStatus.APPROVED) url = '/admin/vendors/approved';
        
        const { data } = await axiosClient.get<PaginatedResponse<IVendor>>(url, { params });
        return data;
    },

    async getUsers(params?: PaginationParams): Promise<PaginatedResponse<IUser>> {
        const { data } = await axiosClient.get<PaginatedResponse<IUser>>('/admin/users', { params });
        return data;
    },

    async verifyVendor(vendorId: string, status: VendorStatus, rejectionReason?: string): Promise<{ message: string; vendor: IVendor }> {
        const { data } = await axiosClient.put<{ message: string; vendor: IVendor }>(`/admin/vendors/${vendorId}/verify`, {
            status,
            rejectionReason,
        });
        return data;
    },

    async toggleBlockVendor(vendorId: string): Promise<{ message: string; isBlocked: boolean }> {
        const { data } = await axiosClient.patch<{ message: string; isBlocked: boolean }>(`/admin/vendors/${vendorId}/toggle-block`);
        return data;
    },

    async toggleBlockUser(id: string): Promise<{ message: string; isBlocked: boolean }> {
        const { data } = await axiosClient.patch<{ message: string; isBlocked: boolean }>(`/admin/users/${id}/toggle-block`);
        return data;
    }
};
