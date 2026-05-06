import mongoose, { Schema, Document } from 'mongoose';
import { IEvent } from '../../domain/entities/Event';

export interface IEventDocument extends Omit<IEvent, '_id'>, Document { }

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        images: [{ type: String }],
        mainGuests: { type: String },
        time: { type: String },
        venue: { type: String },
        contact: { type: String },
        ticketDetails: { type: String },
        isTicketed: { type: Boolean, default: true },
        price: { type: Number, required: true },
        address: { type: String, required: true },
        date: { type: Date, required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number] }, // [lng, lat]
        },
        locationName: { type: String },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

EventSchema.index({ location: '2dsphere' });

export const EventModel = mongoose.model<IEventDocument>('Event', EventSchema);
