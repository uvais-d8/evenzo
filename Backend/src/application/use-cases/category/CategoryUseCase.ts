
import { ICategoryService, CreateCategoryData, UpdateCategoryData } from '../../interfaces/ICategoryService';
import { ICategory } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { BadRequestError, NotFoundError } from '../../../domain/errors/AppError';
import { PaginatedResult, PaginationOptions } from '../../../domain/repositories/IBaseRepository';
import { Messages } from '../../constants/Messages';


export class CategoryUseCase implements ICategoryService {
    constructor(private readonly categoryRepo: ICategoryRepository) { }

    async createCategory(data: CreateCategoryData): Promise<ICategory> {
        const existing = await this.categoryRepo.findByName(data.name);
        if (existing) throw new BadRequestError(Messages.CATEGORY_ALREADY_EXISTS);
        return this.categoryRepo.create(data);
    }

    async getCategories(options: PaginationOptions): Promise<PaginatedResult<ICategory>> {
        return this.categoryRepo.findAll(options);
    }

    async updateCategory(id: string, data: UpdateCategoryData): Promise<ICategory> {
        const category = await this.categoryRepo.findById(id);
        if (!category) throw new NotFoundError(Messages.CATEGORY_NOT_FOUND);

        if (data.name && data.name !== category.name) {
            const existing = await this.categoryRepo.findByName(data.name);
            if (existing) throw new BadRequestError(Messages.CATEGORY_ALREADY_EXISTS);
        }

        const updated = await this.categoryRepo.update(id, data);
        if (!updated) throw new NotFoundError(Messages.CATEGORY_NOT_FOUND);
        return updated;
    }

    async deleteCategory(id: string): Promise<void> {
        const category = await this.categoryRepo.findById(id);
        if (!category) throw new NotFoundError(Messages.CATEGORY_NOT_FOUND);
        await this.categoryRepo.softDelete(id);
    }
}
