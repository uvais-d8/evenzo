import { IEvent } from '../types/event.types';

export interface IEventRepository {
    getNearbyEvents(lat: string, lng: string, radius: number): Promise<IEvent[]>;
    createEvent(event: FormData): Promise<IEvent>;
    getEvents(params?: any): Promise<{ data: IEvent[]; total: number }>;
    getEventById(id: string): Promise<IEvent>;
}
