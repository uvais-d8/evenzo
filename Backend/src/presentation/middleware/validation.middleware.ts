import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../../domain/errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedData = await schema.parseAsync(req.body);
            req.body = parsedData;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
                next(new BadRequestError(errorMessage));
            } else {
                next(error);
            }
        }
    };
};

