import { IEvent } from '../../domain/entities/Event';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

export interface CreateEventData {
    title: string;
    description?: string;
    image?: string;
    images?: string[];
    mainGuests?: string;
    time?: string;
    venue?: string;
    contact?: string;
    ticketDetails?: string;
    isTicketed: boolean;
    price: number;
    address: string;
    date: Date;
    category: string;
    vendorId: string;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    locationName?: string;
}

export interface IEventService {
    createEvent(data: CreateEventData): Promise<IEvent>;
    getEvents(options: PaginationOptions, filter?: Record<string, any>): Promise<PaginatedResult<IEvent>>;
    getVendorEvents(vendorId: string, options: PaginationOptions): Promise<PaginatedResult<IEvent>>;
    getNearbyEvents(lng: number, lat: number, radius: number): Promise<IEvent[]>;
    getEventById(id: string): Promise<IEvent>;
    updateEvent(id: string, data: Partial<CreateEventData>): Promise<IEvent>;
    deleteEvent(id: string): Promise<void>;
}
