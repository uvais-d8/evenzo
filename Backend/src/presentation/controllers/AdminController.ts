import { Request, Response, NextFunction } from 'express';

import { IAdminService } from '../../application/interfaces/IAdminService';
import { VendorStatus } from '../../domain/enums/enums';
import { BadRequestError } from '../../domain/errors/AppError';
import { Messages } from '../../application/constants/Messages';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
    return { page, limit };
}


export class AdminController {
    constructor(private readonly adminService: IAdminService) {
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
            const result = await this.adminService.getPendingVendors(parsePagination(req.query));
            res.json(result);
        } catch (err) { next(err); }
    }

    async verifyVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = String(req.params['vendorId']);
            const { status, rejectionReason } = req.body as { status: VendorStatus; rejectionReason?: string };

            if (![VendorStatus.APPROVED, VendorStatus.REJECTED].includes(status)) {
                throw new BadRequestError(Messages.VENDOR_INVALID_STATUS);
            }

            const vendor = await this.adminService.verifyVendor(vendorId, status, rejectionReason);
            res.json({ message: Messages.VENDOR_STATUS_UPDATED(status), vendor });
        } catch (err) { next(err); }
    }

    async getApprovedVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.adminService.getApprovedVendors(parsePagination(req.query));
            res.json(result);
        } catch (err) { next(err); }
    }

    async getAllVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.adminService.getAllVendors(parsePagination(req.query));
            res.json(result);
        } catch (err) { next(err); }
    }

    async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this.adminService.getStats();
            res.json(stats);
        } catch (err) { next(err); }
    }

    async toggleBlockVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = String(req.params['vendorId']);
            const vendor = await this.adminService.toggleBlockVendor(vendorId);
            res.json({ message: Messages.VENDOR_BLOCK_TOGGLED(vendor.isBlocked), isBlocked: vendor.isBlocked });
        } catch (err) { next(err); }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.adminService.getUsers(parsePagination(req.query));
            res.json(result);
        } catch (err) { next(err); }
    }

    async toggleBlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params['id']);
            const user = await this.adminService.toggleBlockUser(id);
            res.json({ message: Messages.USER_BLOCK_TOGGLED(user.isBlocked), isBlocked: user.isBlocked });
        } catch (err) { next(err); }
    }
}
