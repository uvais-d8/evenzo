import { Response, NextFunction } from 'express';
import { IUserService } from '../../application/interfaces/IUserService';
import { AuthRequest } from '../middleware/auth.middleware';
import { Messages } from '../../application/constants/Messages';

import { ApiResponse } from '../utils/ApiResponse';


export class UserController {
    private readonly _userService: IUserService;

    constructor(userService: IUserService) {
        this._userService = userService;
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await this._userService.getProfile(req.user!.id);
            res.json(ApiResponse.success('User fetched successfully', user));
        } catch (err) {
            next(err);
        }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, phone, address } = req.body as { name?: string; phone?: string; address?: string };
            const user = await this._userService.updateProfile(req.user!.id, { name, phone, address });
            res.json(ApiResponse.success(Messages.PROFILE_UPDATED || 'Profile updated', user));
        } catch (err) {
            next(err);
        }
    }
}
