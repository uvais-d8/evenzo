import { IVendor, VendorStats } from '../types/vendor.types';

export interface UpdateVendorPayload {
    name?: string;
    phone?: string;
    address?: string;
    profession?: string;
    description?: string;
    eventHistory?: string;
    idProof?: string | File;
}

export interface IVendorRepository {
    getProfile(): Promise<IVendor>;
    updateProfile(data: UpdateVendorPayload | FormData): Promise<{ message: string; vendor: IVendor }>;
    getStats(): Promise<VendorStats>;
}
