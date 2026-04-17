import { IVendor } from '../entities/Vendor';
import { VendorStatus } from '../enums/enums';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './IBaseRepository';

export interface IVendorRepository extends IBaseRepository<IVendor> {
    findByRefreshToken(token: string): Promise<IVendor | null>;
    findByStatus(status: VendorStatus, options?: PaginationOptions, filter?: Record<string, any>): Promise<PaginatedResult<IVendor>>;
    findAll(options?: PaginationOptions, filter?: Record<string, any>): Promise<PaginatedResult<IVendor>>;
    save(vendor: IVendor): Promise<IVendor>;
    countByStatus(status: VendorStatus): Promise<number>;
}
