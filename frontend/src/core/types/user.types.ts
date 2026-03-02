import { Role } from '../enums/Role.enum';

export interface IUser {
    _id: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: Role.USER;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt?: string;
}

export interface IAuthUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    vendorStatus?: string;
    rejectionReason?: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    role: Role;
    user: IAuthUser;
    message: string;
}
