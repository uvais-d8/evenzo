import { axiosClient } from '../http/axiosClient';
import { ICategory, PaginatedResponse } from '../../core/types/category.types';

const CATEGORIES = '/categories';

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    image?: string;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    image?: string;
}

export interface CategoryPaginationParams {
    page?: number;
    limit?: number;
}

export const categoryApi = {
    getCategories: (params?: CategoryPaginationParams) =>
        axiosClient.get<PaginatedResponse<ICategory>>(`${CATEGORIES}/`, { params }),

    createCategory: (data: CreateCategoryPayload) =>
        axiosClient.post<{ message: string; category: ICategory }>(`${CATEGORIES}/`, data),

    updateCategory: (id: string, data: UpdateCategoryPayload) =>
        axiosClient.put<{ message: string; category: ICategory }>(`${CATEGORIES}/${id}`, data),

    deleteCategory: (id: string) =>
        axiosClient.delete<{ message: string }>(`${CATEGORIES}/${id}`),
};
