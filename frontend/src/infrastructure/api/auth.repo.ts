import { IAuthRepository, RegisterPayload } from '../../core/repositories/IAuthRepository';
import { LoginResponse } from '../../core/types/user.types';
import { Role } from '../../core/enums/Role.enum';
import { axiosClient } from '../http/axiosClient';

export const authRepository: IAuthRepository = {
    async login(role: Role, credentials: { email: string; password: string }): Promise<LoginResponse> {
        const { data } = await axiosClient.post<LoginResponse>('/auth/login', { ...credentials, role });
        return data;
    },

    async register(role: Role, data: RegisterPayload | FormData): Promise<{ message: string; email: string; role: Role }> {
        const endpoint = role === Role.VENDOR ? '/auth/register/vendor' : '/auth/register/user';
        let payload: any = data;
        
        if (data instanceof FormData) {
            data.append('role', role);
            payload = data;
        } else {
            payload = { ...data, role };
        }

        const response = await axiosClient.post(endpoint, payload);
        return response.data;
    },

    async verifyOtp(otpData: { email: string; otp: string }): Promise<LoginResponse> {
        const { data: responseData } = await axiosClient.post<LoginResponse>('/auth/verify-otp', otpData);
        return responseData;
    },

    async resendOtp(email: string): Promise<{ message: string }> {
        const { data: responseData } = await axiosClient.post('/auth/resend-otp', { email });
        return responseData;
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        const { data: responseData } = await axiosClient.post('/auth/forgot-password', { email });
        return responseData;
    },

    async resetPassword(data: { email: string; password: string }): Promise<{ message: string }> {
        const { data: responseData } = await axiosClient.post('/auth/reset-password', data);
        return responseData;
    },

    async googleLogin(token: string, role: Role): Promise<LoginResponse> {
        const { data: responseData } = await axiosClient.post<LoginResponse>('/auth/google', { token, role });
        return responseData;
    },

    async refreshToken(refreshToken: string): Promise<{ token: string }> {
        const { data: responseData } = await axiosClient.post('/auth/refresh', { refreshToken });
        return responseData;
    }
};
