import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { Request, Response, NextFunction } from 'express';

import { IEventService, CreateEventData } from '../../application/interfaces/IEventService';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
    return { page, limit };
}


/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Event]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               date: { type: string, format: date-time }
 *               address: { type: string }
 *               price: { type: number }
 *               isTicketed: { type: boolean }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Event created successfully
 */
@injectable()
export class EventController {
    constructor(@inject(TOKENS.EventUseCase) private readonly _eventService: IEventService) {
        this.createEvent = this.createEvent.bind(this);
        this.getEvents = this.getEvents.bind(this);
        this.getVendorEvents = this.getVendorEvents.bind(this);
        this.getNearbyEvents = this.getNearbyEvents.bind(this);
        this.getEventById = this.getEventById.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
    }

    async createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user!.id;
            const { lat, lng, ...rest } = req.body;
            const data: CreateEventData = { ...rest, vendorId };
            
            if (lat && lng) {
                let parsedLat = parseFloat(lat);
                let parsedLng = parseFloat(lng);
                if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                    parsedLat = Math.max(-90, Math.min(90, parsedLat));
                    parsedLng = Math.max(-180, Math.min(180, parsedLng));
                    data.location = {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    };
                }
            }

            const files = req.files as Express.Multer.File[];
            if (files && files.length > 0) {
                data.images = files.map(file => `/uploads/${file.filename}`);
                data.image = data.images[0];
            } else if (req.file) {
                data.image = `/uploads/${(req.file as any).filename}`;
            }

            if (req.body.isTicketed !== undefined) {
                data.isTicketed = req.body.isTicketed === 'true';
            } else {
                data.isTicketed = true;
            }

            data.price = data.isTicketed ? parseFloat(String(req.body.price || 0)) : 0;
            if (req.body.date) data.date = new Date(req.body.date);

            const event = await this._eventService.createEvent(data);
            ApiResponse.success(res, 'Event created successfully', event, HttpStatus.CREATED);
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/events:
     *   get:
     *     summary: Get all events with filtering and pagination
     *     tags: [Event]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema: { type: integer, default: 1 }
     *       - in: query
     *         name: limit
     *         schema: { type: integer, default: 10 }
     *       - in: query
     *         name: search
     *         schema: { type: string }
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: List of events
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
     */
    async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, search, category, startDate, endDate, minPrice, maxPrice, ...rest } = req.query;
            const filter: Record<string, unknown> = { ...rest };
            
            if (search) filter.title = { $regex: search, $options: 'i' };
            if (category) filter.category = category;
            if (req.query.locationName) filter.locationName = { $regex: req.query.locationName, $options: 'i' };
            
            if (startDate || endDate) {
                filter.date = {};
                const dateFilter = filter.date as Record<string, unknown>;
                if (startDate) dateFilter.$gte = new Date(startDate as string);
                if (endDate) dateFilter.$lte = new Date(endDate as string);
            }

            if (minPrice || maxPrice) {
                filter.price = {};
                const priceFilter = filter.price as Record<string, unknown>;
                if (minPrice) priceFilter.$gte = parseFloat(minPrice as string);
                if (maxPrice) priceFilter.$lte = parseFloat(maxPrice as string);
            }

            const result = await this._eventService.getEvents(parsePagination(req.query), filter);
            ApiResponse.success(res, 'Events fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    async getVendorEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = (req.params['vendorId'] as string) || req.user!.id;
            const result = await this._eventService.getVendorEvents(vendorId, parsePagination(req.query));
            ApiResponse.success(res, 'Vendor events fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }


    async getNearbyEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lat, lng, radius = 10 } = req.query as Record<string, string | undefined>;
            if (!lat || !lng) {
                ApiResponse.error(res, HttpStatus.BAD_REQUEST, 'Latitude and Longitude are required');
                return;
            }
            const events = await this._eventService.getNearbyEvents(parseFloat(lng), parseFloat(lat), parseFloat(radius as string));
            ApiResponse.success(res, 'Nearby events fetched successfully', events);
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/events/{id}:
     *   get:
     *     summary: Get event details by ID
     *     tags: [Event]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Event details
     */
    async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const event = await this._eventService.getEventById(req.params['id'] as string);
            ApiResponse.success(res, 'Event details fetched successfully', event);
        } catch (err) { next(err); }
    }

    async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lat, lng, ...rest } = req.body;
            const data = { ...rest };
            if (lat && lng) {
                let parsedLat = parseFloat(lat);
                let parsedLng = parseFloat(lng);
                if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                    parsedLat = Math.max(-90, Math.min(90, parsedLat));
                    parsedLng = Math.max(-180, Math.min(180, parsedLng));
                    data.location = {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    };
                }
            }
            const files = req.files as Express.Multer.File[];
            if (files && files.length > 0) {
                data.images = files.map(file => `/uploads/${file.filename}`);
                data.image = data.images[0];
            } else if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }

            if (req.body.isTicketed !== undefined) {
                data.isTicketed = req.body.isTicketed === 'true';
                if (!data.isTicketed) data.price = 0;
            }

            if (req.body.price !== undefined && data.isTicketed !== false) {
                data.price = parseFloat(String(req.body.price));
            }
            if (req.body.date) data.date = new Date(req.body.date);

            const event = await this._eventService.updateEvent(req.params['id'] as string, data);
            ApiResponse.success(res, 'Event updated successfully', event);
        } catch (err) { next(err); }
    }

    async deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._eventService.deleteEvent(req.params['id'] as string);
            ApiResponse.success(res, 'Event deleted successfully');
        } catch (err) { next(err); }
    }
}

