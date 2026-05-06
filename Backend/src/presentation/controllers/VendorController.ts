import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { IVendorService, UpdateVendorData } from '../../application/interfaces/IVendorService';
import { AuthRequest } from '../middleware/auth.middleware';
import { Messages } from '../../application/constants/Messages';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

/**
 * @openapi
 * /api/vendor/profile:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendor]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 */
@injectable()
export class VendorController {
    constructor(@inject(TOKENS.VendorUseCase) private readonly _vendorService: IVendorService) {
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getPublicVendors = this.getPublicVendors.bind(this);
        this.getPublicVendorById = this.getPublicVendorById.bind(this);
    }

    /**
     * @openapi
     * /api/vendor/profile:
     *   put:
     *     summary: Update vendor profile
     *     tags: [Vendor]
     *     security: [{ BearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name: { type: string }
     *               phone: { type: string }
     *               address: { type: string }
     *               idProof: { type: string, format: binary }
     *     responses:
     *       200:
     *         description: Profile updated successfully
     */

    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendor = await this._vendorService.getProfile(req.user!.id);
            ApiResponse.success(res, 'Vendor profile fetched successfully', vendor, HttpStatus.OK);
        } catch (err) { next(err); }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (req.file) {
                req.body.idProof = `/uploads/${req.file.filename}`;
            } else if (req.body.idProof && typeof req.body.idProof !== 'string') {
                delete req.body.idProof;
            }

            const vendor = await this._vendorService.updateProfile(req.user!.id, req.body as UpdateVendorData);
            ApiResponse.success(res, Messages.VENDOR_PROFILE_UPDATED, vendor, HttpStatus.OK);
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/vendor/stats:
     *   get:
     *     summary: Get vendor statistics
     *     tags: [Vendor]
     *     security: [{ BearerAuth: [] }]
     *     responses:
     *       200:
     *         description: Stats fetched successfully
     */
    async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this._vendorService.getStats(req.user!.id);
            ApiResponse.success(res, 'Vendor stats fetched successfully', stats, HttpStatus.OK);
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/vendor/public:
     *   get:
     *     summary: Get list of approved vendors
     *     tags: [Vendor]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema: { type: integer, default: 1 }
     *       - in: query
     *         name: limit
     *         schema: { type: integer, default: 10 }
     *     responses:
     *       200:
     *         description: List of public vendors
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
     */
    async getPublicVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
            const result = await this._vendorService.getPublicVendors({ page, limit });
            ApiResponse.success(res, 'Public vendors fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/vendor/public/{id}:
     *   get:
     *     summary: Get public vendor by ID
     *     tags: [Vendor]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Vendor profile
     */
    async getPublicVendorById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendor = await this._vendorService.getPublicVendorById(req.params['id'] as string);
            ApiResponse.success(res, 'Vendor fetched successfully', vendor, HttpStatus.OK);
        } catch (err) { next(err); }
    }
}
