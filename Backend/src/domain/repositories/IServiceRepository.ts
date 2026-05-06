import { IService } from '../entities/Service';
import { IBaseRepository } from './IBaseRepository';

export interface IServiceRepository extends IBaseRepository<IService> {
    findByVendorId(vendorId: string, onlyAvailable?: boolean): Promise<IService[]>;
}
