import { Role } from '../../domain/enums/enums';

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    address?: string;
    isBlocked: boolean;
    createdAt?: Date;
}

export interface UpdateUserRequestDTO {
    name?: string;
    phone?: string;
    address?: string;
}
