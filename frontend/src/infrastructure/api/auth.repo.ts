import { IAuthRepository, RegisterPayload } from '../../core/repositories/IAuthRepository';
import { LoginResponse } from '../../core/types/user.types';
import { Role } from '../../core/enums/enum';
import { axiosClient } from '../http/axiosClient';

export const authRepository: IAuthRepository = {
    async login(role: Role, credentials: { email: string; password: string }): Promise<LoginResponse> {
        const { data } = await axiosClient.post<any>('/auth/login', { ...credentials, role });
        return data.data;
    },

    async register(role: Role, data: RegisterPayload | FormData): Promise<{ message: string; email: string; role: Role }> {
        const endpoint = role === Role.VENDOR ? '/auth/register/vendor' : '/auth/register/user';
        let payload: any = data;
        
        if (data instanceof FormData) {
            data.delete('role'); // Ensure no duplicate role
            data.append('role', role);
            payload = data;
        } else {
            payload = { ...data, role };
        }

        const { data: responseData } = await axiosClient.post<any>(endpoint, payload);
        return responseData.data;
    },

    async verifyOtp(otpData: { email: string; otp: string }): Promise<LoginResponse> {
        const { data: responseData } = await axiosClient.post<any>('/auth/verify-otp', otpData);
        return responseData.data;
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
        const { data: responseData } = await axiosClient.post<any>('/auth/google', { token, role });
        return responseData.data;
    },

    async refreshToken(refreshToken: string): Promise<{ token: string }> {
        const { data: responseData } = await axiosClient.post<any>('/auth/refresh', { refreshToken });
        return responseData.data;
    }
};
