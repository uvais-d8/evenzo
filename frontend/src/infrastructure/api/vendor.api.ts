import { axiosClient } from '../http/axiosClient';
import { IVendor, VendorStats } from '../../core/types/vendor.types';

const VENDOR = '/vendor';

export interface UpdateVendorPayload {
    name?: string;
    phone?: string;
    address?: string;
    profession?: string;
    description?: string;
    eventHistory?: string;
    idProof?: string | File;
}

export const vendorApi = {
    getProfile: () => axiosClient.get<IVendor>(`${VENDOR}/profile`),
    updateProfile: (data: UpdateVendorPayload) =>
        axiosClient.put<{ message: string; vendor: IVendor }>(`${VENDOR}/profile`, data),
    getStats: () => axiosClient.get<VendorStats>(`${VENDOR}/stats`),
};
