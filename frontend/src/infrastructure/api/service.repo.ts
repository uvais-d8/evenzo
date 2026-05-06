import { IServiceRepository } from '../../core/repositories/IServiceRepository';
import { IService } from '../../core/types/service.types';
import { PaginatedResponse } from '../../core/types/category.types';
import { axiosClient } from '../http/axiosClient';

export const serviceRepository: IServiceRepository = {
    async getServices(params?: any): Promise<PaginatedResponse<IService>> {
        const { data } = await axiosClient.get<any>('/services', { params });
        return {
            data: data.data,
            total: data.pagination?.total || 0,
            page: data.pagination?.page || 1,
            limit: data.pagination?.limit || 10,
            totalPages: data.pagination?.totalPages || 1
        };
    },

    async getVendorServices(): Promise<IService[]> {
        const { data } = await axiosClient.get<{ data: IService[] }>('/services/vendor/me');
        return data.data || [];
    },

    async getPublicVendorServices(vendorId: string): Promise<IService[]> {
        const { data } = await axiosClient.get<{ data: IService[] }>(`/services/vendor/${vendorId}`);
        return data.data || [];
    },

    async getServiceById(id: string): Promise<IService> {
        const { data } = await axiosClient.get<any>(`/services/${id}`);
        return data.data;
    },
 
    async createService(formData: FormData): Promise<IService> {
        const { data } = await axiosClient.post<any>('/services', formData);
        return data.data;
    },
 
    async updateService(id: string, formData: FormData): Promise<IService> {
        const { data } = await axiosClient.put<any>(`/services/${id}`, formData);
        return data.data;
    },

    async deleteService(id: string): Promise<void> {
        await axiosClient.delete(`/services/${id}`);
    }
};
