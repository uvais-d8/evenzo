export class ApiResponse<T> {
    public success: boolean;
    public message: string;
    public data: T | null;
    public pagination?: {
        total: number;
        page: number;
        limit: number;
    };

    constructor(success: boolean, message: string, data: T | null = null, pagination?: { total: number, page: number, limit: number }) {
        this.success = success;
        this.message = message;
        this.data = data;
        if (pagination) {
            this.pagination = pagination;
        }
    }

    static success<T>(message: string, data: T | null = null, pagination?: { total: number, page: number, limit: number }): ApiResponse<T> {
        return new ApiResponse<T>(true, message, data, pagination);
    }

    static error<T = unknown>(message: string, details?: T): ApiResponse<T> {
        return new ApiResponse<T>(false, message, details);
    }
}
