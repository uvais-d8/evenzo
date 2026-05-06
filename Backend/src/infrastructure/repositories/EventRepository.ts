import { injectable } from 'tsyringe';
import { IEvent } from '../../domain/entities/Event';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { EventModel } from '../database/EventModel';
import { BaseRepository } from './BaseRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

@injectable()
export class EventRepository extends BaseRepository<any> implements IEventRepository {
    constructor() {
        super(EventModel);
    }

    async findByVendorId(vendorId: string, options: PaginationOptions = { page: 1, limit: 10 }): Promise<PaginatedResult<IEvent>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        
        const [data, total] = await Promise.all([
            EventModel.find({ vendorId, isDeleted: false }).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            EventModel.countDocuments({ vendorId, isDeleted: false }),
        ]);

        return {
            data: data as unknown as IEvent[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findNearby(lng: number, lat: number, radiusInKm: number): Promise<IEvent[]> {
        const radiusInMeters = radiusInKm * 1000;
        const events = await EventModel.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radiusInMeters,
                },
            },
            isDeleted: false,
        }).lean();
        return events as unknown as IEvent[];
    }

    async softDelete(id: string): Promise<IEvent | null> {
        const updated = await EventModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
        return updated as unknown as IEvent;
    }

    override async findAll(options: PaginationOptions & { includeDeleted?: boolean } = { page: 1, limit: 10 }, filter: Record<string, any> = {}): Promise<PaginatedResult<IEvent>> {
        const { page = 1, limit = 10, includeDeleted = false } = options;
        const skip = (page - 1) * limit;
        
        const finalFilter = { ...filter };
        if (!includeDeleted) finalFilter['isDeleted'] = false;

        const [data, total] = await Promise.all([
            EventModel.find(finalFilter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            EventModel.countDocuments(finalFilter),
        ]);

        return {
            data: data as unknown as IEvent[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
