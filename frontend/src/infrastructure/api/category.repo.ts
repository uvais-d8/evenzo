import { ICategoryRepository, CreateCategoryPayload, UpdateCategoryPayload, PaginationParams } from '../../core/repositories/ICategoryRepository';
import { ICategory, PaginatedResponse } from '../../core/types/category.types';
import { axiosClient } from '../http/axiosClient';

export const categoryRepository: ICategoryRepository = {
    async getCategories(params?: PaginationParams): Promise<PaginatedResponse<ICategory>> {
        const { data } = await axiosClient.get<PaginatedResponse<ICategory>>('/categories', { params });
        return data;
    },

    async createCategory(data: CreateCategoryPayload | FormData): Promise<ICategory> {
        const response = await axiosClient.post<{ category: ICategory }>('/categories', data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data.category;
    },

    async updateCategory(id: string, data: UpdateCategoryPayload | FormData): Promise<ICategory> {
        const response = await axiosClient.put<{ category: ICategory }>(`/categories/${id}`, data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data.category;
    },

    async deleteCategory(id: string): Promise<void> {
        await axiosClient.delete(`/categories/${id}`);
    }
};
