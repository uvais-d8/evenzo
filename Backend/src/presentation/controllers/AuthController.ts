import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { Request, Response, NextFunction } from 'express';

import { OAuth2Client } from 'google-auth-library';
import { IAuthService } from '../../application/interfaces/IAuthService';
import { Role } from '../../domain/enums/enums';
import { BadRequestError, ForbiddenError } from '../../domain/errors/AppError';
import { Messages } from '../../application/constants/Messages';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


@injectable()
export class AuthController {

    constructor(@inject(TOKENS.AuthUseCase) private readonly _authService: IAuthService) {
        // Bind all methods so they work as Express route handlers
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.googleAuth = this.googleAuth.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new BadRequestError('Registration data is missing');
            }
            let { role } = req.body as { role?: any };
            if (Array.isArray(role)) role = role[0];
            if (!role) role = Role.USER;
            if (role === Role.ADMIN) {
                throw new ForbiddenError(Messages.ADMIN_REGISTRATION_NOT_ALLOWED);
            }

            if (req.file) {
                req.body.idProof = `/uploads/${req.file.filename}`;
            } else if (req.body.idProof && typeof req.body.idProof !== 'string') {
                delete req.body.idProof;
            }

            const user = await this._authService.registerUser(req.body);
            ApiResponse.success(res, Messages.REGISTRATION_SUCCESSFUL, {
                email: user.email,
                role: user.role,
            }, HttpStatus.CREATED);
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let { email, password, role } = req.body as { email: string; password: string; role: any };
            if (Array.isArray(role)) role = role[0];
            if (!role) role = Role.USER;
            const { user, accessToken, refreshToken } = await this._authService.loginUser(email, password, role);
            ApiResponse.success(res, Messages.LOGIN_SUCCESSFUL, {
                token: accessToken,
                refreshToken,
                role: user.role,
                user: {
                    id: (user as { _id: string })._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    vendorStatus: (user as { vendorStatus?: string }).vendorStatus,
                    rejectionReason: (user as { rejectionReason?: string }).rejectionReason,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, otp } = req.body as { email: string; otp: string };
            const { user, accessToken, refreshToken } = await this._authService.verifyOtp(email, otp);
            ApiResponse.success(res, Messages.VERIFICATION_SUCCESSFUL, {
                token: accessToken,
                refreshToken,
                role: user.role,
                user: {
                    id: (user as { _id: string })._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    vendorStatus: (user as { vendorStatus?: string }).vendorStatus,
                    rejectionReason: (user as { rejectionReason?: string }).rejectionReason,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body as { email: string };
            await this._authService.resendOtp(email);
            ApiResponse.success(res, Messages.OTP_RESENT);
        } catch (err) {
            next(err);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body as { email: string };
            await this._authService.forgotPassword(email);
            ApiResponse.success(res, Messages.OTP_SENT);
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body as { email: string; password: string };
            await this._authService.resetPassword(email, password);
            ApiResponse.success(res, Messages.PASSWORD_RESET_SUCCESSFUL);
        } catch (err) {
            next(err);
        }
    }

    async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let { token, role } = req.body as { token: string; role?: any };
            if (Array.isArray(role)) role = role[0];
            if (!role) role = Role.USER;
            if (role === Role.ADMIN) {
                throw new ForbiddenError(Messages.ADMIN_GOOGLE_NOT_ALLOWED);
            }

            let email: string;
            let name: string;

            if (token.split('.').length === 3) {
                const ticket = await oauthClient.verifyIdToken({
                    idToken: token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (!payload?.email) throw new BadRequestError(Messages.GOOGLE_INVALID_TOKEN);
                email = payload.email;
                name = payload.name ?? '';
            } else {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!userInfoResponse.ok) throw new BadRequestError(Messages.GOOGLE_INVALID_ACCESS_TOKEN);
                const userInfo = await userInfoResponse.json() as { email?: string; name?: string };
                if (!userInfo.email) throw new BadRequestError(Messages.GOOGLE_EMAIL_MISSING);
                email = userInfo.email;
                name = userInfo.name ?? '';
            }

            const { user, accessToken, refreshToken } = await this._authService.googleAuth(email, name, role);
            ApiResponse.success(res, Messages.GOOGLE_LOGIN_SUCCESSFUL, {
                token: accessToken,
                refreshToken,
                role: user.role,
                user: {
                    id: (user as { _id: string })._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    vendorStatus: (user as { vendorStatus?: string }).vendorStatus,
                    rejectionReason: (user as { rejectionReason?: string }).rejectionReason,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body as { refreshToken?: string };
            if (!refreshToken) throw new BadRequestError(Messages.REFRESH_TOKEN_REQUIRED);
            const accessToken = await this._authService.refreshAccessToken(refreshToken);
            ApiResponse.success(res, 'Token refreshed successfully', { token: accessToken });
        } catch (err) {
            next(err);
        }
    }
}

