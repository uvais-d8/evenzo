import { IVendorService, UpdateVendorData, VendorStats } from '../../interfaces/IVendorService';
import { IVendor } from '../../../domain/entities/Vendor';
import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import { VendorStatus } from '../../../domain/enums/VendorStatus.enum';
import { NotFoundError } from '../../../domain/errors/AppError';
import { Messages } from '../../constants/Messages';

export class VendorUseCase implements IVendorService {
    constructor(private readonly vendorRepo: IVendorRepository) { }

    async getProfile(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);
        return vendor;
    }

    async updateProfile(vendorId: string, data: UpdateVendorData): Promise<IVendor> {
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);

        const allowedKeys: (keyof UpdateVendorData)[] = [
            'name', 'phone', 'address', 'profession', 'description', 'eventHistory', 'idProof',
        ];
        const updateData: Partial<IVendor> = {};
        allowedKeys.forEach((key) => {
            if (data[key] !== undefined) {
                (updateData as Record<string, unknown>)[key] = data[key];
            }
        });

        // Reset to pending when profile is re-submitted (except if already pending)
        if (vendor.vendorStatus !== VendorStatus.PENDING) {
            updateData.vendorStatus = VendorStatus.PENDING;
            updateData.rejectionReason = undefined;
        }

        const updated = await this.vendorRepo.update(vendorId, updateData);
        if (!updated) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);
        return updated;
    }

    async getStats(vendorId: string): Promise<VendorStats> {
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);

        const profileFields: (keyof IVendor)[] = [
            'name', 'email', 'phone', 'address', 'profession', 'description', 'eventHistory', 'idProof',
        ];
        const filled = profileFields.filter((f) => !!vendor[f]).length;
        const profileCompleteness = Math.round((filled / profileFields.length) * 100);

        const memberSince = vendor.createdAt
            ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
            : 'N/A';

        return {
            profileCompleteness,
            memberSince,
            vendorStatus: vendor.vendorStatus,
            totalBookings: 0,
            totalRevenue: 0,
        };
    }
}
