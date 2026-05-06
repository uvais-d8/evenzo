import { IService } from "../types/service.types";
import { PaginatedResponse } from "../types/category.types";

export interface IServiceRepository {
    getServices(params?: any): Promise<PaginatedResponse<IService>>;
    getVendorServices(): Promise<IService[]>;
    getPublicVendorServices(vendorId: string): Promise<IService[]>;
    getServiceById(id: string): Promise<IService>;
    createService(data: FormData): Promise<IService>;
    updateService(id: string, data: FormData): Promise<IService>;
    deleteService(id: string): Promise<void>;
}
