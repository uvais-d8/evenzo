import { Response, NextFunction } from 'express';
import { IVendorService, UpdateVendorData } from '../../application/interfaces/IVendorService';
import { AuthRequest } from '../middleware/auth.middleware';
import { Messages } from '../../application/constants/Messages';

export class VendorController {
    constructor(private readonly vendorService: IVendorService) {
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.getStats = this.getStats.bind(this);
    }

    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendor = await this.vendorService.getProfile(req.user!.id);
            res.json(vendor);
        } catch (err) {
            next(err);
        }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (req.file) {
                req.body.idProof = `/uploads/${req.file.filename}`;
            } else if (req.body.idProof && typeof req.body.idProof !== 'string') {
                delete req.body.idProof;
            }

            const vendor = await this.vendorService.updateProfile(req.user!.id, req.body as UpdateVendorData);
            res.json({ message: Messages.VENDOR_PROFILE_UPDATED, vendor });
        } catch (err) {
            next(err);
        }
    }

    async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this.vendorService.getStats(req.user!.id);
            res.json(stats);
        } catch (err) {
            next(err);
        }
    }
}
