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
        const { data } = await axiosClient.post<any>('/events', event);
        return data.data;
    },
    async updateEvent(id: string, event: FormData): Promise<IEvent> {
        const { data } = await axiosClient.put<any>(`/events/${id}`, event);
        return data.data;
    },
 
    async getEvents(params?: PaginationParams): Promise<PaginatedResponse<IEvent>> {
        const { data } = await axiosClient.get<any>('/events', { params });
        return {
            data: data.data,
            total: data.pagination?.total || 0,
            page: data.pagination?.page || 1,
            limit: data.pagination?.limit || 10,
            totalPages: data.pagination?.totalPages || 1
        };
    },

    async deleteEvent(id: string): Promise<void> {
        await axiosClient.delete(`/events/${id}`);
    },

    async getEventById(id: string): Promise<IEvent> {
        const { data } = await axiosClient.get<any>(`/events/${id}`);
        return data.data;
    }
};

