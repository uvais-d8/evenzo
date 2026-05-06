import { IBooking } from '../../domain/entities/Booking';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

export interface CreateBookingData {
    eventId: string;
    userId: string;
    ticketCount: number;
}

export interface IBookingService {
    createBooking(data: CreateBookingData): Promise<IBooking>;
    getUserBookings(userId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>>;
    getVendorBookings(vendorId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>>;
    cancelBooking(bookingId: string, userId: string): Promise<void>;
}
