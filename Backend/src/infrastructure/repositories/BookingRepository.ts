import { injectable } from 'tsyringe';
import { IBooking } from '../../domain/entities/Booking';
import { IBookingRepository } from '../../domain/repositories/IBookingRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';
import { BookingModel } from '../database/BookingModel';
import { BaseRepository } from './BaseRepository';

function toIBooking(doc: unknown): IBooking {
    return JSON.parse(JSON.stringify(doc)) as IBooking;
}

@injectable()
export class BookingRepository extends BaseRepository<any> implements IBookingRepository {
    constructor() {
        super(BookingModel);
    }

    async findById(id: string): Promise<IBooking | null> {
        const doc = await this._model.findById(id).populate('eventId vendorId userId').lean();
        return doc ? toIBooking(doc) : null;
    }

    async create(data: Partial<IBooking>): Promise<IBooking> {
        const booking = await this._model.create(data);
        return toIBooking(booking.toObject());
    }

    async update(id: string, data: Partial<IBooking>): Promise<IBooking | null> {
        const doc = await this._model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return doc ? toIBooking(doc) : null;
    }

    async findAll(options?: PaginationOptions, filter: Record<string, any> = {}): Promise<PaginatedResult<IBooking>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [docs, total] = await Promise.all([
            this._model.find(filter).populate('eventId vendorId userId').skip(skip).limit(limit).lean(),
            this._model.countDocuments(filter),
        ]);

        return {
            data: docs.map(toIBooking),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [docs, total] = await Promise.all([
            this._model.find({ userId }).populate('eventId vendorId').skip(skip).limit(limit).lean(),
            this._model.countDocuments({ userId }),
        ]);

        return {
            data: docs.map(toIBooking),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByVendorId(vendorId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [docs, total] = await Promise.all([
            this._model.find({ vendorId }).populate('eventId userId').skip(skip).limit(limit).lean(),
            this._model.countDocuments({ vendorId }),
        ]);

        return {
            data: docs.map(toIBooking),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
