import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IServiceService, CreateServiceData } from '../../application/interfaces/IServiceService';
import { TOKENS } from '../../infrastructure/di/tokens';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

@injectable()
export class ServiceController {
    constructor(
        @inject(TOKENS.ServiceUseCase) private readonly _serviceService: IServiceService
    ) {
        this.createService = this.createService.bind(this);
        this.getServices = this.getServices.bind(this);
        this.getVendorServices = this.getVendorServices.bind(this);
        this.getServiceById = this.getServiceById.bind(this);
        this.updateService = this.updateService.bind(this);
        this.deleteService = this.deleteService.bind(this);
    }

    async createService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user!.id;
            const data: CreateServiceData = { 
                ...req.body, 
                vendorId,
                price: parseFloat(req.body.price),
                isAvailable: req.body.isAvailable === 'true'
            };
            
            if (req.body.events && typeof req.body.events === 'string') {
                try {
                    data.events = JSON.parse(req.body.events);
                } catch (e) {
                    data.events = [req.body.events];
                }
            } else if (Array.isArray(req.body.events)) {
                data.events = req.body.events;
            }

            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }

            console.log('🚀 Creating Service with data:', JSON.stringify(data));
            const service = await this._serviceService.createService(data);
            ApiResponse.success(res, 'Service created successfully', service, HttpStatus.CREATED);
        } catch (err) { next(err); }
    }

    async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit } = req.query as Record<string, string | undefined>;
            const options = { 
                page: Math.max(1, parseInt(page || '1')), 
                limit: Math.min(100, Math.max(1, parseInt(limit || '10'))) 
            };
            
            const filter: Record<string, unknown> = {};
            

            const result = await this._serviceService.getServices(options, filter);
            ApiResponse.success(res, 'Services fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async getVendorServices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const isPublic = !!req.params['vendorId'];
            const vendorId = (req.params['vendorId'] as string) || req.user!.id;
            const services = await this._serviceService.getVendorServices(vendorId, isPublic);
            ApiResponse.success(res, 'Vendor services fetched successfully', services);
        } catch (err) { next(err); }
    }

    async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this._serviceService.getServiceById(req.params['id'] as string);
            ApiResponse.success(res, 'Service fetched successfully', service);
        } catch (err) { next(err); }
    }

    async updateService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params['id'] as string;
            const data = { ...req.body };

            if (req.body.price) data.price = parseFloat(req.body.price);
            if (req.body.isAvailable !== undefined) {
                data.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
            }
            
            if (req.body.events && typeof req.body.events === 'string') {
                try {
                    data.events = JSON.parse(req.body.events);
                } catch (e) {
                    data.events = [req.body.events];
                }
            } else if (Array.isArray(req.body.events)) {
                data.events = req.body.events;
            }

            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }

            const service = await this._serviceService.updateService(id, data);
            ApiResponse.success(res, 'Service updated successfully', service);
        } catch (err) { next(err); }
    }

    async deleteService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._serviceService.deleteService(req.params['id'] as string);
            ApiResponse.success(res, 'Service deleted successfully');
        } catch (err) { next(err); }
    }
}
