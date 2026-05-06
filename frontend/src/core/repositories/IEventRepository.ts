import { IEvent } from '../types/event.types';
import { PaginatedResponse } from '../types/category.types';

export interface PaginationParams {
    page?: number;
    limit?: number;
    [key: string]: any;
}

export interface IEventRepository {
    getNearbyEvents(lat: string, lng: string, radius: number): Promise<IEvent[]>;
    createEvent(event: FormData): Promise<IEvent>;
    updateEvent(id: string, event: FormData): Promise<IEvent>;
    getEvents(params?: PaginationParams): Promise<PaginatedResponse<IEvent>>;
    deleteEvent(id: string): Promise<void>;
    getEventById(id: string): Promise<IEvent>;
}
