import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IVendorService, UpdateVendorData, VendorStats } from '../../interfaces/IVendorService';
import { IVendor } from '../../../domain/entities/Vendor';
import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { IBookingRepository } from '../../../domain/repositories/IBookingRepository';
import { VendorStatus } from '../../../domain/enums/enums';
import { NotFoundError } from '../../../domain/errors/AppError';
import { Messages } from '../../constants/Messages';


import { updateVendorSchema } from '../../utils/validation';

@injectable()
export class VendorUseCase implements IVendorService {
    constructor(
        @inject(TOKENS.VendorRepository) private readonly vendorRepo: IVendorRepository,
        @inject(TOKENS.EventRepository) private readonly eventRepo: IEventRepository,
        @inject(TOKENS.BookingRepository) private readonly bookingRepo: IBookingRepository
    ) { }

    async getProfile(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);
        return vendor;
    }

    async updateProfile(vendorId: string, data: UpdateVendorData): Promise<IVendor> {
        const validated = updateVendorSchema.parse(data);
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);

        const allowedKeys: (keyof UpdateVendorData)[] = [
            'name', 'phone', 'address', 'profession', 'description', 'eventHistory', 'idProof',
        ];
        const updateData: Partial<IVendor> = {};
        allowedKeys.forEach((key) => {
            if ((validated as any)[key] !== undefined) {
                (updateData as Record<string, unknown>)[key] = (validated as any)[key];
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
        const [vendor, events, bookings] = await Promise.all([
            this.vendorRepo.findById(vendorId),
            this.eventRepo.findByVendorId(vendorId, { page: 1, limit: 1000 }),
            this.bookingRepo.findByVendorId(vendorId, { page: 1, limit: 1000 })
        ]);

        if (!vendor) throw new NotFoundError(Messages.VENDOR_NOT_FOUND);

        // Profile completeness
        const profileFields: (keyof IVendor)[] = [
            'name', 'email', 'phone', 'address', 'profession', 'description', 'eventHistory', 'idProof',
        ];
        const filled = profileFields.filter((f) => !!vendor[f]).length;
        const profileCompleteness = Math.round((filled / profileFields.length) * 100);

        // Member since
        const memberSince = vendor.createdAt
            ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
            : 'N/A';

        // Event stats
        const totalEvents = events.total;

        // Booking stats
        const totalBookings = bookings.total;
        const totalRevenue = bookings.data.reduce((sum, b) => sum + (b.amount || 0), 0);
        
        // Unique clients
        const uniqueClients = new Set(bookings.data.map(b => b.userId.toString())).size;

        return {
            profileCompleteness,
            memberSince,
            vendorStatus: vendor.vendorStatus,
            totalBookings,
            totalRevenue,
            totalEvents,
            totalClients: uniqueClients
        };
    }

    async getPublicVendors(pagination: { page: number; limit: number }): Promise<{ data: IVendor[]; total: number; page: number; limit: number; totalPages: number }> {
        const query = { vendorStatus: VendorStatus.APPROVED, isBlocked: false };
        const result = await this.vendorRepo.findAll({ page: pagination.page, limit: pagination.limit }, query);
        return {
            data: result.data as IVendor[],
            total: result.total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(result.total / pagination.limit)
        };
    }

    async getPublicVendorById(vendorId: string): Promise<IVendor> {
        const vendor = await this.vendorRepo.findById(vendorId);
        if (!vendor || vendor.vendorStatus !== VendorStatus.APPROVED || vendor.isBlocked) {
            throw new NotFoundError("Vendor not found or not available");
        }
        return vendor;
    }
}
