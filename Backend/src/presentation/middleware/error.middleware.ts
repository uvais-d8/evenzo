import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { logger } from '../../infrastructure/services/LoggerService';

/**
 * Global error-handling middleware.
 * Converts AppError instances to proper HTTP responses.
 * Unknown errors are treated as 500 Internal Server Error.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
        if (!err.isOperational) {
            logger.error('[CRITICAL]', { message: err.message, stack: err.stack });
        } else {
            logger.warn('[AppError]', { message: err.message, statusCode: err.statusCode });
        }
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    // Mongoose Duplicate Key Error (e.g. email already exists)
    if ((err as any).code === 11000) {
        const field = Object.keys((err as any).keyValue)[0];
        res.status(409).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
        return;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values((err as any).errors).map((e: any) => e.message);
        res.status(400).json({ message: messages.join(', ') });
        return;
    }

    // Unknown errors
    logger.error('[UnhandledError]', { message: err.message, stack: err.stack });
    res.status(500).json({ message: 'Internal Server Error' });
};

