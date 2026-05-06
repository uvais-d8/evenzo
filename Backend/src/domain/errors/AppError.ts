import { HttpStatus } from '../enums/HttpStatus';

/**
 * Typed application error with HTTP status code.
 * Operational errors are expected (bad input, not-found, etc.).
 * Non-operational errors are programming bugs.
 */
export class AppError extends Error {
    public readonly statusCode: HttpStatus;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, HttpStatus.NOT_FOUND);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden: Access denied') {
        super(message, HttpStatus.FORBIDDEN);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, HttpStatus.CONFLICT);
    }
}

