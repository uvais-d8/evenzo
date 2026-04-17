import { Model, Document } from 'mongoose';
import { IBaseRepository } from '../../domain/repositories/IBaseRepository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    
    // Using protected visibility to enforce encapsulation but allow derived access
    protected readonly _model: Model<T>;

    constructor(model: Model<T>) {
        this._model = model;
    }

    async create(item: Partial<T>): Promise<T> {
        return await this._model.create(item);
    }

    async findById(id: string): Promise<T | null> {
        return await this._model.findById(id).exec();
    }

    async findByEmail(email: string): Promise<T | null> {
        return await this._model.findOne({ email } as any).exec();
    }

    async findAll(options?: import('../../domain/repositories/IBaseRepository').PaginationOptions, filter: Record<string, any> = {}): Promise<import('../../domain/repositories/IBaseRepository').PaginatedResult<T>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this._model.find(filter).skip(skip).limit(limit).exec(),
            this._model.countDocuments(filter).exec()
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async update(id: string, item: Partial<T>): Promise<T | null> {
        return await this._model.findByIdAndUpdate(id, item as any, { returnDocument: 'after' }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this._model.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async count(filter: Record<string, any> = {}): Promise<number> {
        return await this._model.countDocuments(filter).exec();
    }
}
