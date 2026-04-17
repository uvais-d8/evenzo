import { IVendorRepository, UpdateVendorPayload } from '../../core/repositories/IVendorRepository';
import { IVendor, VendorStats } from '../../core/types/vendor.types';
import { axiosClient } from '../http/axiosClient';

export const vendorRepository: IVendorRepository = {
    async getProfile(): Promise<IVendor> {
        const { data } = await axiosClient.get<IVendor>('/vendor/profile');
        return data;
    },

    async updateProfile(data: UpdateVendorPayload | FormData): Promise<{ message: string; vendor: IVendor }> {
        const response = await axiosClient.put<{ message: string; vendor: IVendor }>('/vendor/profile', data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    },

    async getStats(): Promise<VendorStats> {
        const { data } = await axiosClient.get<VendorStats>('/vendor/stats');
        return data;
    }
};
