import bcrypt from 'bcryptjs';
import { ILogger } from '../../interfaces/ILogger';

import jwt from 'jsonwebtoken';
import { IAuthService, AuthResult, RegisterData } from '../../interfaces/IAuthService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVendorRepository } from '../../../domain/repositories/IVendorRepository';
import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { IUser } from '../../../domain/entities/User';
import { IVendor } from '../../../domain/entities/Vendor';
import { IAdmin } from '../../../domain/entities/Admin';
import { Role } from '../../../domain/enums/enums';
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from '../../../domain/errors/AppError';
import { IEmailService } from '../../interfaces/IEmailService';
import { Messages } from '../../constants/Messages';

type AnyUser = (IUser | IVendor | IAdmin) & { _id: string; otp?: string; otpExpires?: Date; isVerified?: boolean; isBlocked?: boolean; refreshToken?: string; role: Role };


export class AuthUseCase implements IAuthService {
    constructor(
        private readonly userRepo: IUserRepository,
        private readonly vendorRepo: IVendorRepository,
        private readonly adminRepo: IAdminRepository,
        private readonly emailService: IEmailService,
        private readonly logger: ILogger
    ) { }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    private getRepoByRole(role: Role): IUserRepository | IVendorRepository | IAdminRepository {
        switch (role) {
            case Role.ADMIN: return this.adminRepo;
            case Role.VENDOR: return this.vendorRepo;
            default: return this.userRepo;
        }
    }

    private async findAnyUserByEmail(email: string): Promise<{ user: AnyUser; role: Role } | null> {
        const user = await this.userRepo.findByEmail(email);
        if (user) return { user: { ...user, role: Role.USER } as AnyUser, role: Role.USER };

        const vendor = await this.vendorRepo.findByEmail(email);
        if (vendor) return { user: { ...vendor, role: Role.VENDOR } as AnyUser, role: Role.VENDOR };

        const admin = await this.adminRepo.findByEmail(email);
        if (admin) return { user: { ...admin, role: Role.ADMIN } as AnyUser, role: Role.ADMIN };

        return null;
    }

    private async findAnyUserByRefreshToken(token: string): Promise<{ user: AnyUser; role: Role } | null> {
        const user = await this.userRepo.findByRefreshToken(token);
        if (user) return { user: { ...user, role: Role.USER } as AnyUser, role: Role.USER };

        const vendor = await this.vendorRepo.findByRefreshToken(token);
        if (vendor) return { user: { ...vendor, role: Role.VENDOR } as AnyUser, role: Role.VENDOR };

        const admin = await this.adminRepo.findByRefreshToken(token);
        if (admin) return { user: { ...admin, role: Role.ADMIN } as AnyUser, role: Role.ADMIN };

        return null;
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private generateToken(payload: { id: string; role: Role }, expiresIn: string): string {
        return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn } as jwt.SignOptions);
    }

    private generateTokenPair(id: string, role: Role): { accessToken: string; refreshToken: string } {
        return {
            accessToken: this.generateToken({ id, role }, '15m'),
            refreshToken: this.generateToken({ id, role }, '7d'),
        };
    }

    private async saveOtpToUser(user: AnyUser, otp: string, role: Role): Promise<void> {
        const repo = this.getRepoByRole(role);
        await repo.update((user._id as string), {
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        } as never);
    }

    // ─── Use Case Methods ─────────────────────────────────────────────────────

    async registerUser(data: RegisterData): Promise<IUser | IVendor> {
        const { email, password, role = Role.USER } = data;

        const existing = await this.findAnyUserByEmail(email);
        if (existing) throw new ConflictError(Messages.USER_ALREADY_EXISTS);

        const repo = this.getRepoByRole(role) as IUserRepository | IVendorRepository;
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = this.generateOtp();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword: _cp, ...saveData } = data as RegisterData & { confirmPassword?: string };

        this.logger.info(`[AuthUseCase] Creating ${role} in database:`, { email, name: saveData.name });
        const created = await repo.create({
            ...saveData,
            password: hashedPassword,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false,
            role,
        } as never);

        this.logger.info(`[AuthUseCase] ${role} created successfully: ${created._id}`);
        
        try {
            await this.emailService.sendOtp(email, otp);
            this.logger.info(`[AuthUseCase] OTP sent to ${email}`);
        } catch (emailError) {
            this.logger.error(`[AuthUseCase] OTP sending failed for ${email}:`, { error: emailError });
            // We still proceed because the user is created, but they might need to resend OTP
        }
        return created;
    }

    async loginUser(email: string, password: string, role: Role): Promise<AuthResult> {
        if (!role) throw new BadRequestError(Messages.ROLE_REQUIRED);

        const repo = this.getRepoByRole(role);
        const user = await repo.findByEmail(email) as AnyUser | null;
        if (!user) throw new BadRequestError(Messages.INVALID_CREDENTIALS);

        if ('isBlocked' in user && user.isBlocked) {
            throw new ForbiddenError(Messages.ACCESS_DENIED_BLOCKED);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestError(Messages.INVALID_CREDENTIALS);

        const { accessToken, refreshToken } = this.generateTokenPair((user._id as string), role);
        await repo.update((user._id as string), { refreshToken } as never);

        const returnUser = { ...user, role } as unknown as IUser | IVendor | IAdmin;
        return { user: returnUser, accessToken, refreshToken };
    }

    async verifyOtp(email: string, otp: string): Promise<AuthResult> {
        const result = await this.findAnyUserByEmail(email);
        if (!result) throw new NotFoundError('User');

        const { user, role } = result;

        if ('isBlocked' in user && user.isBlocked) {
            throw new ForbiddenError(Messages.ACCESS_DENIED_BLOCKED);
        }

        if (user.otp !== otp) throw new BadRequestError(Messages.OTP_INVALID);
        if (user.otpExpires && user.otpExpires < new Date()) throw new BadRequestError(Messages.OTP_EXPIRED);

        const { accessToken, refreshToken } = this.generateTokenPair((user._id as string), role);

        const repo = this.getRepoByRole(role);
        await repo.update((user._id as string), {
            otp: undefined,
            otpExpires: undefined,
            isVerified: true,
            refreshToken,
        } as never);

        const updatedUser = { ...user, otp: undefined, otpExpires: undefined, isVerified: true, refreshToken, role } as unknown as IUser | IVendor | IAdmin;
        return { user: updatedUser, accessToken, refreshToken };
    }

    async resendOtp(email: string): Promise<void> {
        const result = await this.findAnyUserByEmail(email);
        if (!result) throw new NotFoundError('User');
        const { user, role } = result;
        const otp = this.generateOtp();
        await this.saveOtpToUser(user, otp, role);
        await this.emailService.sendOtp(email, otp);
    }

    async forgotPassword(email: string): Promise<void> {
        const result = await this.findAnyUserByEmail(email);
        if (!result) throw new NotFoundError('User');
        const { user, role } = result;
        const otp = this.generateOtp();
        await this.saveOtpToUser(user, otp, role);
        await this.emailService.sendOtp(email, otp);
    }

    async resetPassword(email: string, password: string): Promise<void> {
        const result = await this.findAnyUserByEmail(email);
        if (!result) throw new NotFoundError('User');
        const { user, role } = result;
        if (!user.isVerified) throw new BadRequestError(Messages.FORGOT_PASSWORD_EMAIL_NOT_VERIFIED);
        const hashedPassword = await bcrypt.hash(password, 10);
        const repo = this.getRepoByRole(role);
        await repo.update((user._id as string), { password: hashedPassword } as never);
    }

    async googleAuth(email: string, name: string, role: Role): Promise<AuthResult> {
        let result = await this.findAnyUserByEmail(email);
        let user: AnyUser;
        let finalRole = role;

        if (result) {
            user = result.user;
            finalRole = result.role;
            if (role && finalRole !== role) {
                throw new ForbiddenError(Messages.EMAIL_ROLE_CONFLICT(finalRole));
            }
        } else {
            const repo = this.getRepoByRole(role) as IUserRepository | IVendorRepository;
            const randomPassword = Math.random().toString(36).slice(-8);
            const created = await repo.create({
                name: name || email.split('@')[0],
                email,
                role,
                isVerified: true,
                password: await bcrypt.hash(randomPassword, 10),
            } as never);
            user = { ...created, role } as AnyUser;
        }

        if ('isBlocked' in user && user.isBlocked) {
            throw new ForbiddenError(Messages.ACCESS_DENIED_BLOCKED);
        }

        const { accessToken, refreshToken } = this.generateTokenPair((user._id as string), finalRole);
        const repo = this.getRepoByRole(finalRole);
        await repo.update((user._id as string), { refreshToken } as never);

        const returnUser = { ...user, role: finalRole } as unknown as IUser | IVendor | IAdmin;
        return { user: returnUser, accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken: string): Promise<string> {
        const result = await this.findAnyUserByRefreshToken(refreshToken);
        if (!result) throw new UnauthorizedError(Messages.REFRESH_TOKEN_INVALID);

        const { user, role } = result;

        if ('isBlocked' in user && user.isBlocked) {
            throw new ForbiddenError(Messages.ACCESS_DENIED_BLOCKED);
        }

        try {
            jwt.verify(refreshToken, process.env.JWT_SECRET as string);
        } catch {
            throw new UnauthorizedError(Messages.REFRESH_TOKEN_EXPIRED);
        }

        return this.generateToken({ id: (user._id as string), role }, '15m');
    }
}
