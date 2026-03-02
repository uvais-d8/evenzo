import { IUser } from '../../domain/entities/User';
import { IVendor } from '../../domain/entities/Vendor';
import { IAdmin } from '../../domain/entities/Admin';
import { Role } from '../../domain/enums/Role.enum';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: Role;
    [key: string]: unknown;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult {
    user: IUser | IVendor | IAdmin;
    accessToken: string;
    refreshToken: string;
}

export interface IAuthService {
    registerUser(data: RegisterData): Promise<IUser | IVendor>;
    loginUser(email: string, password: string, role: Role): Promise<AuthResult>;
    verifyOtp(email: string, otp: string): Promise<AuthResult>;
    resendOtp(email: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(email: string, password: string): Promise<void>;
    googleAuth(email: string, name: string, role: Role): Promise<AuthResult>;
    refreshAccessToken(refreshToken: string): Promise<string>;
}
