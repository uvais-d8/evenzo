import { UpdateUserRequestDTO } from '../dtos/UserDTO';
import { IUser } from '../../domain/entities/User';

export interface IUserService {
    getProfile(userId: string): Promise<IUser>;
    updateProfile(userId: string, data: UpdateUserRequestDTO): Promise<IUser>;
}


