import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserService } from '../../interfaces/IUserService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../domain/errors/AppError';
import { Messages } from '../../constants/Messages';
import { UserResponseDTO, UpdateUserRequestDTO } from '../../dtos/UserDTO';
import { UserMapper } from '../../mappers/UserMapper';

@injectable()
export class UserUseCase implements IUserService {
    constructor(
        @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository
    ) { }

    async getProfile(userId: string): Promise<UserResponseDTO> {
        const user = await this._userRepo.findById(userId);
        if (!user) throw new NotFoundError(Messages.USER_NOT_FOUND);
        return UserMapper.toResponseDTO(user);
    }

    async updateProfile(userId: string, data: UpdateUserRequestDTO): Promise<UserResponseDTO> {
        const user = await this._userRepo.findById(userId);
        if (!user) throw new NotFoundError(Messages.USER_NOT_FOUND);

        const allowedKeys: (keyof UpdateUserRequestDTO)[] = ['name', 'phone', 'address'];
        const updateData: any = {};
        allowedKeys.forEach((key) => {
            if (data[key] !== undefined) {
                updateData[key] = data[key];
            }
        });

        const updated = await this._userRepo.update(userId, updateData);
        if (!updated) throw new NotFoundError(Messages.USER_NOT_FOUND);
        return UserMapper.toResponseDTO(updated);
    }
}

