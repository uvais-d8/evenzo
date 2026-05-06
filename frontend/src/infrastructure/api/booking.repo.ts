import { IBooking, AuthBookingResponse } from '../../core/types/booking.types';
import { PaginatedResponse } from '../../core/types/category.types';
import { axiosClient } from '../http/axiosClient';

export interface IBookingRepository {
    createBooking(data: { eventId: string; ticketCount: number }): Promise<AuthBookingResponse>;
    getUserBookings(params: { page: number; limit: number }): Promise<PaginatedResponse<IBooking>>;
    cancelBooking(bookingId: string): Promise<void>;
}

export const bookingRepository: IBookingRepository = {
    async createBooking(data) {
        const response = await axiosClient.post<AuthBookingResponse>('/bookings', data);
        return response.data;
    },
    async getUserBookings(params) {
        const { data } = await axiosClient.get<any>('/bookings/my-bookings', { params });
        return {
            data: data.data,
            total: data.pagination?.total || 0,
            page: data.pagination?.page || 1,
            limit: data.pagination?.limit || 10,
            totalPages: data.pagination?.totalPages || 1
        };
    },
    async cancelBooking(bookingId) {
        await axiosClient.put(`/bookings/${bookingId}/cancel`);
    }
};
