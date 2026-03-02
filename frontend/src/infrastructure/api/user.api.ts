import { axiosClient } from '../http/axiosClient';
import { IUser } from '../../core/types/user.types';

const USER = '/user';

export interface UpdateUserPayload {
    name?: string;
    phone?: string;
    address?: string;
}

export const userApi = {
    getProfile: () => axiosClient.get<IUser>(`${USER}/profile`),
    updateProfile: (data: UpdateUserPayload) =>
        axiosClient.put<{ message: string; user: IUser }>(`${USER}/profile`, data),
};
