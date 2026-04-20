import { IEventRepository, PaginationParams } from '../../core/repositories/IEventRepository';
import { IEvent } from '../../core/types/event.types';
import { PaginatedResponse } from '../../core/types/category.types';
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

    async getEvents(params?: PaginationParams): Promise<PaginatedResponse<IEvent>> {
        const { data } = await axiosClient.get<PaginatedResponse<IEvent>>('/events', { params });
        return data;
    },

    async deleteEvent(id: string): Promise<void> {
        await axiosClient.delete(`/events/${id}`);
    },

    async getEventById(id: string): Promise<IEvent> {
        const { data } = await axiosClient.get<IEvent>(`/events/${id}`);
        return data;
    }
};

