import { axiosClient } from '../http/axiosClient';
import { LoginResponse } from '../../core/types/user.types';
import { Role } from '../../core/enums/Role.enum';

const AUTH = '/auth';

export interface RegisterPayload {
    name?: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
}

export const authApi = {
    login: (role: Role, credentials: { email: string; password: string }) =>
        axiosClient.post<LoginResponse>(`/${role}/login`, credentials),

    register: (role: Role, data: RegisterPayload | FormData) =>
        axiosClient.post<{ message: string; email: string; role: Role }>(`/${role}/register`, data),

    verifyOtp: (otpData: { email: string; otp: string }) =>
        axiosClient.post<LoginResponse>(`${AUTH}/verify-otp`, otpData),

    resendOtp: (email: string) =>
        axiosClient.post<{ message: string }>(`${AUTH}/resend-otp`, { email }),

    forgotPassword: (email: string) =>
        axiosClient.post<{ message: string }>(`${AUTH}/forgot-password`, { email }),

    resetPassword: (data: { email: string; password: string }) =>
        axiosClient.post<{ message: string }>(`${AUTH}/reset-password`, data),

    googleLogin: (token: string, role: Role) =>
        axiosClient.post<LoginResponse>(`${AUTH}/google`, { token, role }),

    refreshToken: (refreshToken: string) =>
        axiosClient.post<{ token: string }>(`${AUTH}/refresh`, { refreshToken }),
};
