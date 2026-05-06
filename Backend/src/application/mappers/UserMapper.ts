import { IUser } from '../../domain/entities/User';
import { UserResponseDTO } from '../dtos/UserDTO';

export class UserMapper {
    static toResponseDTO(user: IUser): UserResponseDTO {
        return {
            id: user._id || '',
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            address: user.address,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
        };
    }

    static toResponseDTOList(users: IUser[]): UserResponseDTO[] {
        return users.map(user => this.toResponseDTO(user));
    }
}
