import { ICategory } from './category.types';

export interface IEvent {
    _id: string;
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
    date: string;
    category: string | ICategory;
    vendorId: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
    locationName?: string;
}
