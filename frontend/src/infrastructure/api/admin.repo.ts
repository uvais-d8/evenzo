import { axiosClient } from '../http/axiosClient';
import { IAdminRepository, PaginationParams } from '../../core/repositories/IAdminRepository';
import { IVendor } from '../../core/types/vendor.types';
import { IUser } from '../../core/types/user.types';
import { AdminStats, PaginatedResponse } from '../../core/types/category.types';
import { VendorStatus } from '../../core/enums/Status.enum';
import { logger } from '../services/LoggerService';

export class AdminRepository implements IAdminRepository {
    private readonly endpoint = '/admin';

    async getStats(): Promise<AdminStats> {
        try {
            const res = await axiosClient.get<AdminStats>(`${this.endpoint}/stats`);
            return res.data;
        } catch (error) {
            logger.error('Failed to fetch admin stats', error);
            throw error;
        }
    }

    async getVendors(status?: VendorStatus, params?: PaginationParams): Promise<PaginatedResponse<IVendor>> {
        try {
            const url = status
                ? `${this.endpoint}/vendors/${status}`
                : `${this.endpoint}/vendors`;
            const res = await axiosClient.get<PaginatedResponse<IVendor>>(url, { params });
            return res.data;
        } catch (error) {
            logger.error(`Failed to fetch ${status || 'all'} vendors`, error);
            throw error;
        }
    }

    async getUsers(params?: PaginationParams): Promise<PaginatedResponse<IUser>> {
        try {
            const res = await axiosClient.get<PaginatedResponse<IUser>>(`${this.endpoint}/users`, { params });
            return res.data;
        } catch (error) {
            logger.error('Failed to fetch users', error);
            throw error;
        }
    }

    async verifyVendor(vendorId: string, status: VendorStatus, rejectionReason?: string): Promise<{ message: string; vendor: IVendor }> {
        try {
            const res = await axiosClient.put<{ message: string; vendor: IVendor }>(
                `${this.endpoint}/vendors/${vendorId}/verify`,
                { status, rejectionReason }
            );
            return res.data;
        } catch (error) {
            logger.error(`Failed to verify vendor ${vendorId}`, error);
            throw error;
        }
    }

    async toggleBlockVendor(vendorId: string): Promise<{ message: string; isBlocked: boolean }> {
        try {
            const res = await axiosClient.patch<{ message: string; isBlocked: boolean }>(
                `${this.endpoint}/vendors/${vendorId}/toggle-block`
            );
            return res.data;
        } catch (error) {
            logger.error(`Failed to toggle block for vendor ${vendorId}`, error);
            throw error;
        }
    }

    async toggleBlockUser(id: string): Promise<{ message: string; isBlocked: boolean }> {
        try {
            const res = await axiosClient.patch<{ message: string; isBlocked: boolean }>(
                `${this.endpoint}/users/${id}/toggle-block`
            );
            return res.data;
        } catch (error) {
            logger.error(`Failed to toggle block for user ${id}`, error);
            throw error;
        }
    }
}

export const adminRepository = new AdminRepository();
