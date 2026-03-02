import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { IAuthService } from '../../application/interfaces/IAuthService';
import { Role } from '../../domain/enums/Role.enum';
import { BadRequestError, ForbiddenError } from '../../domain/errors/AppError';
import { Messages } from '../../application/constants/Messages';

const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {

    constructor(private readonly authService: IAuthService) {
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
            const { role = Role.USER } = req.body as { role?: Role };
            if (role === Role.ADMIN) {
                throw new ForbiddenError(Messages.ADMIN_REGISTRATION_NOT_ALLOWED);
            }

            if (req.file) {
                req.body.idProof = `/uploads/${req.file.filename}`;
            } else if (req.body.idProof && typeof req.body.idProof !== 'string') {
                // Remove if it's an object (likely a File object that reached body instead of file)
                delete req.body.idProof;
            }

            const user = await this.authService.registerUser(req.body);
            res.status(201).json({
                message: Messages.REGISTRATION_SUCCESSFUL,
                email: user.email,
                role: user.role,
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, role } = req.body as { email: string; password: string; role: Role };
            const { user, accessToken, refreshToken } = await this.authService.loginUser(email, password, role);
            res.json({
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
                message: Messages.LOGIN_SUCCESSFUL,
            });
        } catch (err) {
            next(err);
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, otp } = req.body as { email: string; otp: string };
            const { user, accessToken, refreshToken } = await this.authService.verifyOtp(email, otp);
            res.json({
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
                message: Messages.VERIFICATION_SUCCESSFUL,
            });
        } catch (err) {
            next(err);
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body as { email: string };
            await this.authService.resendOtp(email);
            res.json({ message: Messages.OTP_RESENT });
        } catch (err) {
            next(err);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body as { email: string };
            await this.authService.forgotPassword(email);
            res.json({ message: Messages.OTP_SENT });
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body as { email: string; password: string };
            await this.authService.resetPassword(email, password);
            res.json({ message: Messages.PASSWORD_RESET_SUCCESSFUL });
        } catch (err) {
            next(err);
        }
    }

    async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, role = Role.USER } = req.body as { token: string; role?: Role };
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

            const { user, accessToken, refreshToken } = await this.authService.googleAuth(email, name, role);
            res.json({
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
                message: Messages.GOOGLE_LOGIN_SUCCESSFUL,
            });
        } catch (err) {
            next(err);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body as { refreshToken?: string };
            if (!refreshToken) throw new BadRequestError(Messages.REFRESH_TOKEN_REQUIRED);
            const accessToken = await this.authService.refreshAccessToken(refreshToken);
            res.json({ token: accessToken });
        } catch (err) {
            next(err);
        }
    }
}
