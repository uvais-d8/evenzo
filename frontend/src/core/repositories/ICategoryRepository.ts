import { ICategory, PaginatedResponse } from '../types/category.types';

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface CreateCategoryPayload {
    name: string;
    description: string;
    image?: File | string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

export interface ICategoryRepository {
    getCategories(params?: PaginationParams): Promise<PaginatedResponse<ICategory>>;
    createCategory(data: CreateCategoryPayload | FormData): Promise<ICategory>;
    updateCategory(id: string, data: UpdateCategoryPayload | FormData): Promise<ICategory>;
    deleteCategory(id: string): Promise<void>;
}
