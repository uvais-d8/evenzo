import { injectable } from 'tsyringe';
import { IService } from '../../domain/entities/Service';
import { IServiceRepository } from '../../domain/repositories/IServiceRepository';
import { ServiceModel } from '../database/ServiceModel';
import { BaseRepository } from './BaseRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

@injectable()
export class ServiceRepository extends BaseRepository<any> implements IServiceRepository {
    constructor() {
        super(ServiceModel);
    }

    async findAll(options: PaginationOptions, filter: Record<string, unknown> = {}): Promise<PaginatedResult<IService>> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this._model.find(filter)
                .populate('categoryId')
                .populate('events')
                .skip(skip)
                .limit(limit)
                .lean(),
            this._model.countDocuments(filter)
        ]);

        return {
            data: data.map(doc => JSON.parse(JSON.stringify(doc))) as IService[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findByVendorId(vendorId: string, onlyAvailable: boolean = false): Promise<IService[]> {
        const query: any = { vendorId, isDeleted: false };
        if (onlyAvailable) query.isAvailable = true;
        console.log('🔍 ServiceRepository.findByVendorId query:', JSON.stringify(query));
        const docs = await this._model.find(query).populate('categoryId').populate('events').lean();
        console.log(`✅ ServiceRepository.findByVendorId found ${docs.length} docs`);
        return docs.map(doc => JSON.parse(JSON.stringify(doc)));
    }

    // You can override other methods if needed for population, etc.
    async findById(id: string): Promise<IService | null> {
        const doc = await this._model.findById(id).populate('categoryId').populate('events').lean();
        return doc ? JSON.parse(JSON.stringify(doc)) : null;
    }
}

