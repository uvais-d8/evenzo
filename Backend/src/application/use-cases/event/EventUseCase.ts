import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IEventService, CreateEventData } from '../../interfaces/IEventService';
import { IEvent } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { NotFoundError } from '../../../domain/errors/AppError';
import { PaginatedResult, PaginationOptions } from '../../../domain/repositories/IBaseRepository';


import { eventSchema } from '../../utils/validation';

@injectable()
export class EventUseCase implements IEventService {
    constructor(
        @inject(TOKENS.EventRepository) private readonly _eventRepo: IEventRepository
    ) { }

    async createEvent(data: CreateEventData): Promise<IEvent> {
        // Validate incoming data
        const validated = eventSchema.parse({
            ...data,
            date: data.date instanceof Date ? data.date : new Date(data.date as any)
        });
        
        return this._eventRepo.create({ ...validated, vendorId: data.vendorId, isDeleted: false });
    }

    async getEvents(options: PaginationOptions, filter: Record<string, unknown> = {}): Promise<PaginatedResult<IEvent>> {
        return this._eventRepo.findAll(options, filter);
    }

    async getVendorEvents(vendorId: string, options: PaginationOptions): Promise<PaginatedResult<IEvent>> {
        return this._eventRepo.findByVendorId(vendorId, options);
    }

    async getNearbyEvents(lng: number, lat: number, radius: number): Promise<IEvent[]> {
        return this._eventRepo.findNearby(lng, lat, radius);
    }

    async getEventById(id: string): Promise<IEvent> {
        const event = await this._eventRepo.findById(id);
        if (!event || event.isDeleted) throw new NotFoundError('Event not found');
        return event;
    }

    async updateEvent(id: string, data: Partial<CreateEventData>): Promise<IEvent> {
        const event = await this._eventRepo.findById(id);
        if (!event || event.isDeleted) throw new NotFoundError('Event not found');
        
        const updated = await this._eventRepo.update(id, data);
        if (!updated) throw new NotFoundError('Event not found');
        return updated;
    }

    async deleteEvent(id: string): Promise<void> {
        const event = await this._eventRepo.findById(id);
        if (!event || event.isDeleted) throw new NotFoundError('Event not found');
        await this._eventRepo.softDelete(id);
    }
}

