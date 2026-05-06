import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../domain/errors/AppError';
import { logger } from '../../infrastructure/services/LoggerService';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

/**
 * Global error-handling middleware.
 * Converts AppError instances to proper HTTP responses.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof ZodError) {
        const message = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        ApiResponse.error(res, HttpStatus.BAD_REQUEST, message);
        return;
    }

    if (err instanceof AppError) {
        if (!err.isOperational) {
            logger.error('[CRITICAL]', { message: err.message, stack: err.stack });
        } else {
            logger.warn('[AppError]', { message: err.message, statusCode: err.statusCode });
        }
        ApiResponse.error(res, err.statusCode, err.message);
        return;
    }

    // Mongoose Duplicate Key Error
    if ((err as any).code === 11000) {
        const field = Object.keys((err as any).keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        ApiResponse.error(res, HttpStatus.CONFLICT, message);
        return;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values((err as any).errors).map((e: any) => e.message);
        ApiResponse.error(res, HttpStatus.BAD_REQUEST, messages.join(', '));
        return;
    }

    // Mongoose Cast Error
    if (err.name === 'CastError') {
        const message = `Invalid ${(err as any).path}: ${(err as any).value}`;
        ApiResponse.error(res, HttpStatus.BAD_REQUEST, message);
        return;
    }

    // Multer Error
    if (err.name === 'MulterError') {
        ApiResponse.error(res, HttpStatus.BAD_REQUEST, `File upload error: ${err.message}`);
        return;
    }

    // Unknown errors
    logger.error('[UnhandledError]', { message: err.message, stack: err.stack });
    ApiResponse.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
};


