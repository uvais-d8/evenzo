import { ICategory } from '../../domain/entities/Category';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

export interface CreateCategoryData {
    name: string;
    description?: string;
    image?: string;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string;
    image?: string;
}

export interface ICategoryService {
    createCategory(data: CreateCategoryData): Promise<ICategory>;
    getCategories(options: PaginationOptions): Promise<PaginatedResult<ICategory>>;
    updateCategory(id: string, data: UpdateCategoryData): Promise<ICategory>;
    deleteCategory(id: string): Promise<void>;
}
