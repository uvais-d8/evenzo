import { IBooking } from '../entities/Booking';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './IBaseRepository';

export interface IBookingRepository extends IBaseRepository<IBooking> {
    findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>>;
    findByVendorId(vendorId: string, options?: PaginationOptions): Promise<PaginatedResult<IBooking>>;
}
