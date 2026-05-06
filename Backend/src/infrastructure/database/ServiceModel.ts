import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '../../domain/entities/Service';

export interface ServiceDocument extends IService, Document {
    _id: any;
}

const ServiceSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    images: { type: [String] },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    isAvailable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

export const ServiceModel = mongoose.model<ServiceDocument>('Service', ServiceSchema);
