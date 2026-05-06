export interface IBooking {
    _id?: string;
    eventId: string;
    userId: string;
    vendorId: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed';
    ticketCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
