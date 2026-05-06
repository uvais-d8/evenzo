export interface IService {
    _id?: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    images?: string[];
    vendorId: string;
    categoryId: string;
    events?: string[];
    isAvailable: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
