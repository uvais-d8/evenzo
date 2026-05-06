import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { Request, Response, NextFunction } from 'express';

import { IAdminService } from '../../application/interfaces/IAdminService';
import { VendorStatus } from '../../domain/enums/enums';
import { BadRequestError } from '../../domain/errors/AppError';
import { Messages } from '../../application/constants/Messages';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
    return { page, limit };
}


@injectable()
export class AdminController {
    constructor(@inject(TOKENS.AdminUseCase) private readonly _adminService: IAdminService) {
        this.getPendingVendors = this.getPendingVendors.bind(this);
        this.verifyVendor = this.verifyVendor.bind(this);
        this.getApprovedVendors = this.getApprovedVendors.bind(this);
        this.getAllVendors = this.getAllVendors.bind(this);
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.toggleBlockVendor = this.toggleBlockVendor.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.toggleBlockUser = this.toggleBlockUser.bind(this);
    }

    async getPendingVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._adminService.getPendingVendors(parsePagination(req.query));
            ApiResponse.success(res, 'Pending vendors fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async verifyVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = String(req.params['vendorId']);
            const { status, rejectionReason } = req.body as { status: VendorStatus; rejectionReason?: string };

            if (![VendorStatus.APPROVED, VendorStatus.REJECTED].includes(status)) {
                throw new BadRequestError(Messages.VENDOR_INVALID_STATUS);
            }

            const vendor = await this._adminService.verifyVendor(vendorId, status, rejectionReason);
            ApiResponse.success(res, Messages.VENDOR_STATUS_UPDATED(status), vendor);
        } catch (err) { next(err); }
    }

    async getApprovedVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._adminService.getApprovedVendors(parsePagination(req.query));
            ApiResponse.success(res, 'Approved vendors fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async getAllVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._adminService.getAllVendors(parsePagination(req.query));
            ApiResponse.success(res, 'All vendors fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this._adminService.getStats();
            ApiResponse.success(res, 'Dashboard stats fetched successfully', stats);
        } catch (err) { next(err); }
    }

    async toggleBlockVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = String(req.params['vendorId']);
            const vendor = await this._adminService.toggleBlockVendor(vendorId);
            ApiResponse.success(res, Messages.VENDOR_BLOCK_TOGGLED(vendor.isBlocked), { isBlocked: vendor.isBlocked });
        } catch (err) { next(err); }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._adminService.getUsers(parsePagination(req.query));
            ApiResponse.success(res, 'Users fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async toggleBlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params['id']);
            const user = await this._adminService.toggleBlockUser(id);
            ApiResponse.success(res, Messages.USER_BLOCK_TOGGLED(user.isBlocked), { isBlocked: user.isBlocked });
        } catch (err) { next(err); }
    }
}
