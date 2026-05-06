import { UserResponseDTO, UpdateUserRequestDTO } from '../dtos/UserDTO';

export interface IUserService {
    getProfile(userId: string): Promise<UserResponseDTO>;
    updateProfile(userId: string, data: UpdateUserRequestDTO): Promise<UserResponseDTO>;
}

