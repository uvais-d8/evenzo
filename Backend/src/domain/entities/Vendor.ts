import { Role } from '../enums/Role.enum';
import { VendorStatus } from '../enums/VendorStatus.enum';

export interface IVendor {
    _id?: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role: Role.VENDOR;
    vendorStatus: VendorStatus;
    rejectionReason?: string;
    otp?: string;
    otpExpires?: Date;
    isVerified: boolean;
    isBlocked: boolean;
    profession?: string;
    description?: string;
    eventHistory?: string;
    idProof?: string;
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
