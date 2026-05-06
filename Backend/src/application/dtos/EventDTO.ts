

export interface EventResponseDTO {
    id: string;
    title: string;
    description: string;
    image?: string;
    images?: string[];
    date: Date;
    price: number;
    isTicketed: boolean;
    location?: {
        type: string;
        coordinates: number[];
    };
    category: string;
    vendorId: string;
    isDeleted: boolean;
}

export interface CreateEventRequestDTO {
    title: string;
    description: string;
    date: string | Date;
    price: number;
    isTicketed: boolean;
    category: string;
    image?: string;
    images?: string[];
}
