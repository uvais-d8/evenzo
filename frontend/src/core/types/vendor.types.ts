import { Role } from '../enums/Role.enum';
import { VendorStatus } from '../enums/VendorStatus.enum';

export interface IVendor {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: Role.VENDOR;
    vendorStatus: VendorStatus;
    rejectionReason?: string;
    profession?: string;
    description?: string;
    eventHistory?: string;
    idProof?: string;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt?: string;
}

export interface VendorStats {
    profileCompleteness: number;
    memberSince: string;
    vendorStatus: VendorStatus;
    totalBookings: number;
    totalRevenue: number;
}
