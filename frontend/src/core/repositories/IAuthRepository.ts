import { LoginResponse } from '../types/user.types';
import { Role } from '../enums/enum';

export interface RegisterPayload {
    name?: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
}

export interface IAuthRepository {
    login(role: Role, credentials: { email: string; password: string }): Promise<LoginResponse>;
    register(role: Role, data: RegisterPayload | FormData): Promise<{ message: string; email: string; role: Role }>;
    verifyOtp(otpData: { email: string; otp: string }): Promise<LoginResponse>;
    resendOtp(email: string): Promise<{ message: string }>;
    forgotPassword(email: string): Promise<{ message: string }>;
    resetPassword(data: { email: string; password: string }): Promise<{ message: string }>;
    googleLogin(token: string, role: Role): Promise<LoginResponse>;
    refreshToken(refreshToken: string): Promise<{ token: string }>;
}
