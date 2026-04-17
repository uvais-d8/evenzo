import { Request, Response, NextFunction } from 'express';

import { IEventService, CreateEventData } from '../../application/interfaces/IEventService';
import { AuthRequest } from '../middleware/auth.middleware';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
    return { page, limit };
}


export class EventController {
    constructor(private readonly eventService: IEventService) {
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
            const data: CreateEventData = { ...req.body, vendorId };
            
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }

            const event = await this.eventService.createEvent(data);
            res.status(201).json({ message: 'Event created successfully', event });
        } catch (err) { next(err); }
    }

    async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, ...filter } = req.query;
            const result = await this.eventService.getEvents(parsePagination(req.query), filter);
            res.json(result);
        } catch (err) { next(err); }
    }

    async getVendorEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = (req.params['vendorId'] as string) || req.user!.id;
            const result = await this.eventService.getVendorEvents(vendorId, parsePagination(req.query));
            res.json(result);
        } catch (err) { next(err); }
    }

    async getNearbyEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lat, lng, radius = 10 } = req.query as any;
            if (!lat || !lng) {
                res.status(400).json({ message: 'Latitude and Longitude are required' });
                return;
            }
            const events = await this.eventService.getNearbyEvents(parseFloat(lng), parseFloat(lat), parseFloat(radius));
            res.json(events);
        } catch (err) { next(err); }
    }

    async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const event = await this.eventService.getEventById(req.params['id'] as string);
            res.json(event);
        } catch (err) { next(err); }
    }

    async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }
            const event = await this.eventService.updateEvent(req.params['id'] as string, data);
            res.json({ message: 'Event updated successfully', event });
        } catch (err) { next(err); }
    }

    async deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.eventService.deleteEvent(req.params['id'] as string);
            res.json({ message: 'Event deleted successfully' });
        } catch (err) { next(err); }
    }
}
