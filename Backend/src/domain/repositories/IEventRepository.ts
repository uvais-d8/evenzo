import { IEvent } from '../entities/Event';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './IBaseRepository';

export interface IEventRepository extends IBaseRepository<IEvent> {
    findByVendorId(vendorId: string, options?: PaginationOptions): Promise<PaginatedResult<IEvent>>;
    findNearby(lng: number, lat: number, radiusInKm: number): Promise<IEvent[]>;
    softDelete(id: string): Promise<IEvent | null>;
    findAll(options?: PaginationOptions & { includeDeleted?: boolean }, filter?: Record<string, any>): Promise<PaginatedResult<IEvent>>;
}
