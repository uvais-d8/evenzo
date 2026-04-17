
import { IAdminService, AdminStats } from '../../interfaces/IAdminService';
import { IUser } from '../../../domain/entities/User';
import { IVendor } from '../../../domain/entities/Vendor';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import { VendorStatus } from '../../../domain/enums/enums';
import {
    BadRequestError,
    NotFoundError,
} from '../../../domain/errors/AppError';
import { PaginatedResult, PaginationOptions } from '../../../domain/repositories/IBaseRepository';
import { Messages } from '../../constants/Messages';


export class AdminUseCase implements IAdminService {
    constructor(
        private readonly userRepo: IUserRepository,
        private readonly vendorRepo: IVendorRepository
    ) { }

    async getPendingVendors(options: PaginationOptions): Promise<PaginatedResult<IVendor>> {
        return this.vendorRepo.findByStatus(VendorStatus.PENDING, options);
    }

    async verifyVendor(
        vendorId: string,
        status: VendorStatus,
        rejectionReason?: string
    ): Promise<IVendor> {
        if (!Object.values(VendorStatus).includes(status) || status === VendorStatus.PENDING) {
            throw new BadRequestError(Messages.VENDOR_INVALID_STATUS);
        }

        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);

        const updateData: Partial<IVendor> = { vendorStatus: status };
        if (status === VendorStatus.REJECTED) {
            updateData.rejectionReason = rejectionReason ?? 'No reason provided';
        } else {
            updateData.rejectionReason = undefined;
        }

        const updated = await this.vendorRepo.update(vendorId, updateData);
        if (!updated) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);
        return updated;
    }

    async getApprovedVendors(options: PaginationOptions): Promise<PaginatedResult<IVendor>> {
        return this.vendorRepo.findByStatus(VendorStatus.APPROVED, options);
    }

    async getAllVendors(options: PaginationOptions): Promise<PaginatedResult<IVendor>> {
        return this.vendorRepo.findAll(options);
    }

    async toggleBlockUser(userId: string): Promise<IUser> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new NotFoundError(Messages.USER_NOT_FOUND);

        const updateData: Partial<IUser> = { isBlocked: !user.isBlocked };
        if (!user.isBlocked) updateData.refreshToken = undefined;

        const updated = await this.userRepo.update(userId, updateData);
        if (!updated) throw new NotFoundError(Messages.USER_NOT_FOUND);
        return updated;
    }

    async toggleBlockVendor(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);

        const updateData: Partial<IVendor> = { isBlocked: !vendor.isBlocked };
        if (!vendor.isBlocked) updateData.refreshToken = undefined;

        const updated = await this.vendorRepo.update(vendorId, updateData);
        if (!updated) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);
        return updated;
    }

    async getUsers(options: PaginationOptions): Promise<PaginatedResult<IUser>> {
        return this.userRepo.findAll(options);
    }

    async getStats(): Promise<AdminStats> {
        const [totalUsers, totalVendors, pendingVendors] = await Promise.all([
            this.userRepo.findAll({ page: 1, limit: 1 }).then((r) => r.total),
            this.vendorRepo.countByStatus(VendorStatus.APPROVED),
            this.vendorRepo.countByStatus(VendorStatus.PENDING),
        ]);

        return { totalUsers, totalVendors, pendingVendors, totalBookings: 0, totalRevenue: 0 };
    }
}
