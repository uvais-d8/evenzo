import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { logger } from '../../shared/logger';

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

    // Unknown errors
    logger.error('[UnhandledError]', { message: err.message, stack: err.stack });
    res.status(500).json({ message: 'Internal Server Error' });
};
