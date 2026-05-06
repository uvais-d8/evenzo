import { IVendorRepository, UpdateVendorPayload } from '../../core/repositories/IVendorRepository';
import { IVendor, VendorStats } from '../../core/types/vendor.types';
import { axiosClient } from '../http/axiosClient';

export const vendorRepository: IVendorRepository = {
    async getProfile(): Promise<IVendor> {
        const { data } = await axiosClient.get<any>('/vendor/profile');
        return data.data;
    },

    async updateProfile(data: UpdateVendorPayload | FormData): Promise<{ message: string; vendor: IVendor }> {
        const response = await axiosClient.put<{ message: string; vendor: IVendor }>('/vendor/profile', data);
        return response.data;
    },

    async getStats(): Promise<VendorStats> {
        const { data } = await axiosClient.get<any>('/vendor/stats');
        return data.data;
    },

    async getPublicVendors(params?: any): Promise<{ data: IVendor[], pagination: any }> {
        const { data } = await axiosClient.get<any>('/vendor/public', { params });
        return {
            data: data.data,
            pagination: data.pagination
        };
    },

    async getPublicVendorById(id: string): Promise<IVendor> {
        const { data } = await axiosClient.get<{ data: IVendor }>(`/vendor/public/${id}`);
        // Support both wrapped in data and plain response
        return data.data || (data as unknown as IVendor);
    }
};
