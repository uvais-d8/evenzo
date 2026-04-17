import { ICategory } from '../entities/Category';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './IBaseRepository';

export interface ICategoryRepository extends IBaseRepository<ICategory> {
    findByName(name: string): Promise<ICategory | null>;
    findAll(options?: PaginationOptions & { includeDeleted?: boolean }, filter?: Record<string, any>): Promise<PaginatedResult<ICategory>>;
    softDelete(id: string): Promise<ICategory | null>;
    save(category: ICategory): Promise<ICategory>;
}
