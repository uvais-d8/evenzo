export interface IEvent {
    _id: string;
    title: string;
    description?: string;
    image?: string;
    price: number;
    address: string;
    date: string;
    category: string;
    vendorId: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
}
