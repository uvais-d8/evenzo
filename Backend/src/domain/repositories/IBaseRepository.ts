export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Generic base repository interface.
 * All concrete repositories must implement this contract.
 */
export interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}
