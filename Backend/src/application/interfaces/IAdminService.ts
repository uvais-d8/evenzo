import { IUser } from '../../domain/entities/User';
import { IVendor } from '../../domain/entities/Vendor';
import { VendorStatus } from '../../domain/enums/VendorStatus.enum';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

export interface AdminStats {
    totalUsers: number;
    totalVendors: number;
    pendingVendors: number;
    totalBookings: number;
    totalRevenue: number;
}

export interface IAdminService {
    getPendingVendors(options: PaginationOptions): Promise<PaginatedResult<IVendor>>;
    verifyVendor(vendorId: string, status: VendorStatus, rejectionReason?: string): Promise<IVendor>;
    getApprovedVendors(options: PaginationOptions): Promise<PaginatedResult<IVendor>>;
    getAllVendors(options: PaginationOptions): Promise<PaginatedResult<IVendor>>;
    toggleBlockUser(userId: string): Promise<IUser>;
    toggleBlockVendor(vendorId: string): Promise<IVendor>;
    getUsers(options: PaginationOptions): Promise<PaginatedResult<IUser>>;
    getStats(): Promise<AdminStats>;
}
