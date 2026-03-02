import { IUser } from '../../domain/entities/User';

export interface UpdateUserData {
    name?: string;
    phone?: string;
    address?: string;
}

export interface IUserService {
    getProfile(userId: string): Promise<IUser>;
    updateProfile(userId: string, data: UpdateUserData): Promise<IUser>;
}
