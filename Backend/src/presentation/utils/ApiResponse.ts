import { Response } from 'express';
import { HttpStatus } from '../../domain/enums/HttpStatus';

export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class ApiResponse {
    static success<T>(
        res: Response,
        message: string,
        data?: T,
        status: HttpStatus = HttpStatus.OK,
        pagination?: IApiResponse<T>['pagination']
    ) {
        const response: IApiResponse<T> = {
            success: true,
            message,
            data,
            pagination,
        };
        return res.status(status).json(response);
    }


    static error(
        res: Response,
        status: HttpStatus,
        message: string,
        error?: any
    ) {
        const response: IApiResponse<null> = {
            success: false,
            message,
            error,
        };
        return res.status(status).json(response);
    }
}
