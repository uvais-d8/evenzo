import { Role } from '../enums/enums';

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    eventHistory?: string;
    role: Role.USER;
    otp?: string;
    otpExpires?: Date;
    isVerified: boolean;
    isBlocked: boolean;
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
