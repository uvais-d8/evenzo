

export interface CreateServiceRequestDTO {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    events?: string[];
    image?: string;
}

