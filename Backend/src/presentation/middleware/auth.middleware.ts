import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../../infrastructure/database/models/UserModel';
import VendorModel from '../../infrastructure/database/models/VendorModel';
import AdminModel from '../../infrastructure/database/models/AdminModel';
import { Role } from '../../domain/enums/Role.enum';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/AppError';
import { Messages } from '../../application/constants/Messages';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: Role;
    };
}

interface DecodedToken {
    id: string;
    role: Role;
}

export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(new UnauthorizedError(Messages.NO_TOKEN));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

        let isBlocked = false;

        if (decoded.role === Role.ADMIN) {
            const admin = await AdminModel.findById(decoded.id).select('isBlocked').lean();
            if (!admin) return next(new ForbiddenError(Messages.ACCESS_DENIED_INACTIVE));
            isBlocked = false; // Admins cannot be blocked in this system
        } else if (decoded.role === Role.VENDOR) {
            const vendor = await VendorModel.findById(decoded.id).select('isBlocked').lean();
            if (!vendor) return next(new ForbiddenError(Messages.ACCESS_DENIED_INACTIVE));
            isBlocked = (vendor as { isBlocked?: boolean }).isBlocked ?? false;
        } else {
            const user = await UserModel.findById(decoded.id).select('isBlocked').lean();
            if (!user) return next(new ForbiddenError(Messages.ACCESS_DENIED_INACTIVE));
            isBlocked = (user as { isBlocked?: boolean }).isBlocked ?? false;
        }

        if (isBlocked) return next(new ForbiddenError(Messages.ACCESS_DENIED_BLOCKED));

        req.user = decoded;
        next();
    } catch {
        next(new UnauthorizedError(Messages.INVALID_TOKEN));
    }
};

export const authorize = (roles: Role[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ForbiddenError(Messages.FORBIDDEN));
        }
        next();
    };
};
