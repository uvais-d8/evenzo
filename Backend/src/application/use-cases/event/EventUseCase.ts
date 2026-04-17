
import { IEventService, CreateEventData } from '../../interfaces/IEventService';
import { IEvent } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { NotFoundError } from '../../../domain/errors/AppError';
import { PaginatedResult, PaginationOptions } from '../../../domain/repositories/IBaseRepository';



export class EventUseCase implements IEventService {
    constructor(private readonly eventRepo: IEventRepository) { }

    async createEvent(data: CreateEventData): Promise<IEvent> {
        return this.eventRepo.create({ ...data, isDeleted: false });
    }

    async getEvents(options: PaginationOptions, filter: Record<string, any> = {}): Promise<PaginatedResult<IEvent>> {
        return this.eventRepo.findAll(options, filter);
    }

    async getVendorEvents(vendorId: string, options: PaginationOptions): Promise<PaginatedResult<IEvent>> {
        return this.eventRepo.findByVendorId(vendorId, options);
    }

    async getNearbyEvents(lng: number, lat: number, radius: number): Promise<IEvent[]> {
        return this.eventRepo.findNearby(lng, lat, radius);
    }

    async getEventById(id: string): Promise<IEvent> {
        const event = await this.eventRepo.findById(id);
        if (!event || event.isDeleted) throw new NotFoundError('Event not found');
        return event;
    }

    async updateEvent(id: string, data: Partial<CreateEventData>): Promise<IEvent> {
        const event = await this.eventRepo.findById(id);
        if (!event || event.isDeleted) throw new NotFoundError('Event not found');
        
        const updated = await this.eventRepo.update(id, data);
        if (!updated) throw new NotFoundError('Event not found');
        return updated;
    }

    async deleteEvent(id: string): Promise<void> {
        const event = await this.eventRepo.findById(id);
        if (!event || event.isDeleted) throw new NotFoundError('Event not found');
        await this.eventRepo.softDelete(id);
    }
}
