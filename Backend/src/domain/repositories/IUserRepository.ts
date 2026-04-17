import { IUser } from '../entities/User';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<IUser> {
    findByRefreshToken(token: string): Promise<IUser | null>;
    findAll(options?: PaginationOptions, filter?: Record<string, any>): Promise<PaginatedResult<IUser>>;
    save(user: IUser): Promise<IUser>;
}
