import { injectable, inject } from 'tsyringe';
import { IService } from '../../../domain/entities/Service';
import { IServiceRepository } from '../../../domain/repositories/IServiceRepository';
import { IServiceService, CreateServiceData, UpdateServiceData } from '../../interfaces/IServiceService';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { PaginatedResult, PaginationOptions } from '../../../domain/repositories/IBaseRepository';
import { NotFoundError } from '../../../domain/errors/AppError';

@injectable()
export class ServiceUseCase implements IServiceService {
    constructor(
        @inject(TOKENS.ServiceRepository) private readonly _serviceRepo: IServiceRepository
    ) {}

    async createService(data: CreateServiceData): Promise<IService> {
        return this._serviceRepo.create(data);
    }

    async getServices(options: PaginationOptions, filter: Record<string, unknown> = {}): Promise<PaginatedResult<IService>> {
        return this._serviceRepo.findAll(options, { ...filter, isDeleted: false });
    }

    async getVendorServices(vendorId: string, onlyAvailable: boolean = false): Promise<IService[]> {
        return this._serviceRepo.findByVendorId(vendorId, onlyAvailable);
    }

    async getServiceById(id: string): Promise<IService> {
        const service = await this._serviceRepo.findById(id);
        if (!service || service.isDeleted) throw new NotFoundError('Service not found');
        return service;
    }

    async updateService(id: string, data: UpdateServiceData): Promise<IService> {
        const updated = await this._serviceRepo.update(id, data);
        if (!updated) throw new NotFoundError('Service not found');
        return updated;
    }

    async deleteService(id: string): Promise<void> {
        const success = await this._serviceRepo.delete(id);
        if (!success) throw new NotFoundError('Service not found');
    }
}

