export interface IEvent {
    _id?: string;
    title: string;
    description?: string;
    image?: string;
    images?: string[];
    mainGuests?: string;
    time?: string;
    venue?: string;
    contact?: string;
    ticketDetails?: string;
    isTicketed: boolean;
    price: number;
    address: string;
    date: Date;
    category: string; // ID of the category
    vendorId: string; // ID of the vendor
    location?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    locationName?: string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
