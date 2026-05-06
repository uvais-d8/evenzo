import { IService } from '../../domain/entities/Service';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';

export interface CreateServiceData {
    name: string;
    description: string;
    price: number;
    image?: string;
    images?: string[];
    vendorId: string;
    categoryId: string;
    events?: string[];
    isAvailable?: boolean;
}

export interface UpdateServiceData {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    images?: string[];
    categoryId?: string;
    events?: string[];
    isAvailable?: boolean;
}

export interface IServiceService {
    createService(data: CreateServiceData): Promise<IService>;
    getServices(options: PaginationOptions, filter?: Record<string, any>): Promise<PaginatedResult<IService>>;
    getVendorServices(vendorId: string, onlyAvailable?: boolean): Promise<IService[]>;
    getServiceById(id: string): Promise<IService>;
    updateService(id: string, data: UpdateServiceData): Promise<IService>;
    deleteService(id: string): Promise<void>;
}
