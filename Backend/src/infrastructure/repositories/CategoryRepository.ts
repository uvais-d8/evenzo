import { injectable } from 'tsyringe';
import { ICategory } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';
import CategoryModel from '../database/CategoryModel';

function toICategory(doc: unknown): ICategory {
    return JSON.parse(JSON.stringify(doc)) as ICategory;
}


@injectable()
export class CategoryRepository implements ICategoryRepository {
    async findById(id: string): Promise<ICategory | null> {
        const doc = await CategoryModel.findById(id).lean();
        return doc ? toICategory(doc) : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findByEmail(_email: string): Promise<ICategory | null> {
        return null; // Categories don't have email
    }

    async findByName(name: string): Promise<ICategory | null> {
        const doc = await CategoryModel.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isDeleted: false,
        }).lean();
        return doc ? toICategory(doc) : null;
    }

    async findAll(
        options?: PaginationOptions & { includeDeleted?: boolean },
        filterParams: Record<string, any> = {}
    ): Promise<PaginatedResult<ICategory>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const includeDeleted = options?.includeDeleted || false;
        
        const skip = (page - 1) * limit;
        const filter = includeDeleted ? filterParams : { ...filterParams, isDeleted: false };
        const [docs, total] = await Promise.all([
            CategoryModel.find(filter).skip(skip).limit(limit).lean(),
            CategoryModel.countDocuments(filter),
        ]);
        const data = docs.map(toICategory);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async count(filter: Record<string, any> = {}): Promise<number> {
        return await CategoryModel.countDocuments(filter);
    }

    async create(data: Partial<ICategory>): Promise<ICategory> {
        const category = await CategoryModel.create(data);
        return toICategory(category.toObject());
    }

    async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        const doc = await CategoryModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return doc ? toICategory(doc) : null;
    }

    async save(category: ICategory): Promise<ICategory> {
        const doc = await CategoryModel.findById((category as ICategory & { _id: string })._id);
        if (!doc) throw new Error('Category not found');
        Object.assign(doc, category);
        const saved = await doc.save();
        return toICategory(saved.toObject());
    }

    async softDelete(id: string): Promise<ICategory | null> {
        const doc = await CategoryModel.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' }).lean();
        return doc ? toICategory(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return !!result;
    }
}
