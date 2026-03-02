import { IVendor } from '../../domain/entities/Vendor';

export interface UpdateVendorData {
    name?: string;
    phone?: string;
    address?: string;
    profession?: string;
    description?: string;
    eventHistory?: string;
    idProof?: string;
}

export interface VendorStats {
    profileCompleteness: number;
    memberSince: string;
    vendorStatus: string;
    totalBookings: number;
    totalRevenue: number;
}

export interface IVendorService {
    getProfile(vendorId: string): Promise<IVendor>;
    updateProfile(vendorId: string, data: UpdateVendorData): Promise<IVendor>;
    getStats(vendorId: string): Promise<VendorStats>;
}
