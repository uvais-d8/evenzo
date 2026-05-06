

export interface ServiceResponseDTO {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    category?: any;
    events?: any[];
    image?: string;
    isDeleted: boolean;
}

export interface CreateServiceRequestDTO {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    events?: string[];
    image?: string;
}

export class ServiceMapper {
    static toResponseDTO(service: any): ServiceResponseDTO {
        return {
            id: service._id as string,
            vendorId: service.vendorId as string,
            name: service.name,
            description: service.description,
            price: service.price,
            categoryId: service.categoryId as string,
            category: service.categoryId, // When populated, this might hold the object. Actually, let's keep categoryId for the ID, and map category if it exists.
            events: service.events,
            image: service.image,
            isDeleted: !!service.isDeleted
        };
    }
}
