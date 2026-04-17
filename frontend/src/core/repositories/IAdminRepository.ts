import { IVendor } from '../types/vendor.types';
import { IUser } from '../types/user.types';
import { ICategory, AdminStats, PaginatedResponse } from '../types/category.types';
import { VendorStatus } from '../enums/Status.enum';

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface IAdminRepository {
    getStats(): Promise<AdminStats>;
    getVendors(status?: VendorStatus, params?: PaginationParams): Promise<PaginatedResponse<IVendor>>;
    getUsers(params?: PaginationParams): Promise<PaginatedResponse<IUser>>;
    verifyVendor(vendorId: string, status: VendorStatus, rejectionReason?: string): Promise<{ message: string; vendor: IVendor }>;
    toggleBlockVendor(vendorId: string): Promise<{ message: string; isBlocked: boolean }>;
    toggleBlockUser(id: string): Promise<{ message: string; isBlocked: boolean }>;
}
