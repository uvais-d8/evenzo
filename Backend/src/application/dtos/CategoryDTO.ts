import { ICategory } from '../../domain/entities/Category';

export interface CategoryResponseDTO {
    id: string;
    name: string;
    image?: string;
    isDeleted: boolean;
}

export interface CreateCategoryRequestDTO {
    name: string;
    image?: string;
}

export class CategoryMapper {
    static toResponseDTO(category: ICategory): CategoryResponseDTO {
        return {
            id: category._id as string,
            name: category.name,
            image: category.image,
            isDeleted: !!category.isDeleted
        };
    }
}
