import { ICategory } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';
import CategoryModel from '../database/models/CategoryModel';

function toICategory(doc: unknown): ICategory {
    return JSON.parse(JSON.stringify(doc)) as ICategory;
}

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
        options: PaginationOptions & { includeDeleted?: boolean }
    ): Promise<PaginatedResult<ICategory>> {
        const { page, limit, includeDeleted = false } = options;
        const skip = (page - 1) * limit;
        const filter = includeDeleted ? {} : { isDeleted: false };
        const [docs, total] = await Promise.all([
            CategoryModel.find(filter).skip(skip).limit(limit).lean(),
            CategoryModel.countDocuments(filter),
        ]);
        const data = docs.map(toICategory);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async create(data: Partial<ICategory>): Promise<ICategory> {
        const category = await CategoryModel.create(data);
        return toICategory(category.toObject());
    }

    async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        const doc = await CategoryModel.findByIdAndUpdate(id, data, { new: true }).lean();
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
        const doc = await CategoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
        return doc ? toICategory(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return !!result;
    }
}
