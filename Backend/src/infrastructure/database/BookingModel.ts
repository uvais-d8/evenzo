import mongoose, { Schema, Document } from 'mongoose';
import { IBooking } from '../../domain/entities/Booking';

export interface IBookingDocument extends Omit<IBooking, '_id'>, Document { }

const BookingSchema: Schema = new Schema(
    {
        eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
        paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
        ticketCount: { type: Number, required: true, default: 1 },
    },
    { timestamps: true }
);

export const BookingModel = mongoose.model<IBookingDocument>('Booking', BookingSchema);
