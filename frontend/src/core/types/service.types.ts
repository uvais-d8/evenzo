

export interface IService {
    _id: string;
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    category?: any;
    events?: any[];
    image?: string;
    images?: string[];
    vendorId: string;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateServicePayload {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    events?: string[];
    image?: File;
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> {
    isAvailable?: boolean;
}
