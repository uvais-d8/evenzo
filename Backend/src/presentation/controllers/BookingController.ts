import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { Request, Response, NextFunction } from 'express';
import { IBookingService } from '../../application/interfaces/IBookingService';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
    return { page, limit };
}

@injectable()
export class BookingController {
    constructor(@inject(TOKENS.BookingUseCase) private readonly bookingService: IBookingService) {
        this.createBooking = this.createBooking.bind(this);
        this.getUserBookings = this.getUserBookings.bind(this);
        this.getVendorBookings = this.getVendorBookings.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
    }

    async createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { eventId, ticketCount } = req.body;
            
            const booking = await this.bookingService.createBooking({
                userId,
                eventId,
                ticketCount: ticketCount || 1
            });
            
            ApiResponse.success(res, 'Ticket booked successfully', booking, HttpStatus.CREATED);
        } catch (err) { next(err); }
    }

    async getUserBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const result = await this.bookingService.getUserBookings(userId, parsePagination(req.query));
            ApiResponse.success(res, 'User bookings fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async getVendorBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user!.id;
            const result = await this.bookingService.getVendorBookings(vendorId, parsePagination(req.query));
            ApiResponse.success(res, 'Vendor bookings fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const bookingId = req.params['id'] as string;
            await this.bookingService.cancelBooking(bookingId, userId);
            ApiResponse.success(res, 'Booking cancelled successfully');
        } catch (err) { next(err); }
    }
}

