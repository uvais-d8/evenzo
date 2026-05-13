

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

