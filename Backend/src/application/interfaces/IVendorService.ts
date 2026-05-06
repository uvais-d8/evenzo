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
    totalEvents: number;
    totalClients: number;
}

export interface IVendorService {
    getProfile(vendorId: string): Promise<IVendor>;
    updateProfile(vendorId: string, data: UpdateVendorData): Promise<IVendor>;
    getStats(vendorId: string): Promise<VendorStats>;
    getPublicVendors(pagination: { page: number; limit: number }): Promise<{ data: IVendor[]; total: number; page: number; limit: number; totalPages: number }>;
    getPublicVendorById(vendorId: string): Promise<IVendor>;
}
