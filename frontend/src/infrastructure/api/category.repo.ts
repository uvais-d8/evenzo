import { ICategoryRepository, CreateCategoryPayload, UpdateCategoryPayload, PaginationParams } from '../../core/repositories/ICategoryRepository';
import { ICategory, PaginatedResponse } from '../../core/types/category.types';
import { axiosClient } from '../http/axiosClient';

export const categoryRepository: ICategoryRepository = {
    async getCategories(params?: PaginationParams): Promise<PaginatedResponse<ICategory>> {
        const { data } = await axiosClient.get<any>('/categories', { params });
        return {
            data: data.data,
            total: data.pagination?.total || 0,
            page: data.pagination?.page || 1,
            limit: data.pagination?.limit || 10,
            totalPages: data.pagination?.totalPages || 1
        };
    },

    async createCategory(data: CreateCategoryPayload | FormData): Promise<ICategory> {
        const response = await axiosClient.post<{ category: ICategory }>('/categories', data);
        return response.data.category;
    },

    async updateCategory(id: string, data: UpdateCategoryPayload | FormData): Promise<ICategory> {
        const response = await axiosClient.put<{ category: ICategory }>(`/categories/${id}`, data);
        return response.data.category;
    },

    async deleteCategory(id: string): Promise<void> {
        await axiosClient.delete(`/categories/${id}`);
    }
};
