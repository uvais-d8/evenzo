export interface IBooking {
    _id: string;
    eventId: any; 
    userId: any;
    vendorId: any;
    amount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed';
    ticketCount: number;
    createdAt: string;
}

export interface AuthBookingResponse {
    message: string;
    booking: IBooking;
}
