import { IAdmin } from '../entities/Admin';
import { IBaseRepository } from './IBaseRepository';

export interface IAdminRepository extends IBaseRepository<IAdmin> {
    findByRefreshToken(token: string): Promise<IAdmin | null>;
    save(admin: IAdmin): Promise<IAdmin>;
    upsertByEmail(email: string, data: Partial<IAdmin>): Promise<IAdmin>;
}
