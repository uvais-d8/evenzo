import { Response, NextFunction } from 'express';
import { IUserService } from '../../application/interfaces/IUserService';
import { AuthRequest } from '../middleware/auth.middleware';
import { Messages } from '../../application/constants/Messages';

export class UserController {
    constructor(private readonly userService: IUserService) {
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await this.userService.getProfile(req.user!.id);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, phone, address } = req.body as { name?: string; phone?: string; address?: string };
            const user = await this.userService.updateProfile(req.user!.id, { name, phone, address });
            res.json({ message: Messages.PROFILE_UPDATED, user });
        } catch (err) {
            next(err);
        }
    }
}
