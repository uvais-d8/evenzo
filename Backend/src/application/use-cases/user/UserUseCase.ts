import { IUserService, UpdateUserData } from '../../interfaces/IUserService';
import { IUser } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../domain/errors/AppError';
import { Messages } from '../../constants/Messages';

export class UserUseCase implements IUserService {
    constructor(private readonly userRepo: IUserRepository) { }

    async getProfile(userId: string): Promise<IUser> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new NotFoundError(Messages.USER_NOT_FOUND);
        return user;
    }

    async updateProfile(userId: string, data: UpdateUserData): Promise<IUser> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new NotFoundError(Messages.USER_NOT_FOUND);

        const allowedKeys: (keyof UpdateUserData)[] = ['name', 'phone', 'address'];
        const updateData: Partial<IUser> = {};
        allowedKeys.forEach((key) => {
            if (data[key] !== undefined) {
                (updateData as Record<string, unknown>)[key] = data[key];
            }
        });

        const updated = await this.userRepo.update(userId, updateData);
        if (!updated) throw new NotFoundError(Messages.USER_NOT_FOUND);
        return updated;
    }
}
