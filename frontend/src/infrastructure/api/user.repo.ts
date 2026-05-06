import { IUserRepository, UpdateUserPayload } from '../../core/repositories/IUserRepository';
import { IUser } from '../../core/types/user.types';
import { axiosClient } from '../http/axiosClient';

export const userRepository: IUserRepository = {
    async getProfile(): Promise<IUser> {
        const { data } = await axiosClient.get<any>('/user/profile');
        return data.data;
    },

    async updateProfile(data: UpdateUserPayload): Promise<{ message: string; user: IUser }> {
        const response = await axiosClient.put<{ message: string; user: IUser }>('/user/profile', data);
        return response.data;
    }
};
