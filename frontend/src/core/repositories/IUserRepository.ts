import { IUser } from '../types/user.types';

export interface UpdateUserPayload {
    name?: string;
    phone?: string;
    address?: string;
}

export interface IUserRepository {
    getProfile(): Promise<IUser>;
    updateProfile(data: UpdateUserPayload): Promise<{ message: string; user: IUser }>;
}
