export interface IEvent {
    _id?: string;
    title: string;
    description?: string;
    image?: string;
    price: number;
    address: string;
    date: Date;
    category: string; // ID of the category
    vendorId: string; // ID of the vendor
    location?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
