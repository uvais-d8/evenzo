import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IBookingService, CreateBookingData } from '../../interfaces/IBookingService';
import { IBookingRepository } from '../../../domain/repositories/IBookingRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { IBooking } from '../../../domain/entities/Booking';
import { PaginatedResult, PaginationOptions } from '../../../domain/repositories/IBaseRepository';
import { NotFoundError, BadRequestError } from '../../../domain/errors/AppError';

@injectable()
export class BookingUseCase implements IBookingService {
    constructor(
        @inject(TOKENS.BookingRepository) private readonly bookingRepo: IBookingRepository,
        @inject(TOKENS.EventRepository) private readonly eventRepo: IEventRepository
    ) {}

    async createBooking(data: CreateBookingData): Promise<IBooking> {
        const event = await this.eventRepo.findById(data.eventId);
        if (!event) throw new NotFoundError('Event');
        if (event.isDeleted) throw new BadRequestError('Cannot book a deleted event');

        const amount = event.price * data.ticketCount;

        const newBooking = await this.bookingRepo.create({
            eventId: data.eventId,
            userId: data.userId,
            vendorId: event.vendorId, // Fetch vendorId from event automatically
            ticketCount: data.ticketCount,
            amount: amount,
            status: 'confirmed',
            paymentStatus: 'completed' // Mock payment for now
        });

        return newBooking;
    }

    async getUserBookings(userId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>> {
        return this.bookingRepo.findByUserId(userId, options);
    }

    async getVendorBookings(vendorId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>> {
        return this.bookingRepo.findByVendorId(vendorId, options);
    }

    async cancelBooking(bookingId: string, userId: string): Promise<void> {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) throw new NotFoundError('Booking');
        if (booking.userId.toString() !== userId) throw new BadRequestError('Unauthorized to cancel this booking');
        if (booking.status === 'cancelled') throw new BadRequestError('Booking is already cancelled');

        await this.bookingRepo.update(bookingId, { status: 'cancelled' });
    }
}
