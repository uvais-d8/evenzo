import { IEventRepository } from '../../core/repositories/IEventRepository';
import { IEvent } from '../../core/types/event.types';
import { axiosClient } from '../http/axiosClient';

export const eventRepository: IEventRepository = {
    async getNearbyEvents(lat: string, lng: string, radius: number): Promise<IEvent[]> {
        const { data } = await axiosClient.get<IEvent[]>('/events/nearby', {
            params: { lat, lng, radius }
        });
        return data;
    },

    async createEvent(event: FormData): Promise<IEvent> {
        const { data } = await axiosClient.post<IEvent>('/events', event, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    },

    async getEvents(params?: any): Promise<{ data: IEvent[]; total: number }> {
        const { data } = await axiosClient.get<{ data: IEvent[]; total: number }>('/events', { params });
        return data;
    },

    async getEventById(id: string): Promise<IEvent> {
        const { data } = await axiosClient.get<IEvent>(`/events/${id}`);
        return data;
    }
};
