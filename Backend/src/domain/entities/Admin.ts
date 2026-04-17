import { Role } from '../enums/enums';

export interface IAdmin {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: Role.ADMIN;
    otp?: string;
    otpExpires?: Date;
    isVerified: boolean;
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
