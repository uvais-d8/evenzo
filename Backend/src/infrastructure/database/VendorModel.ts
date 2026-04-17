import mongoose, { Document, Schema } from 'mongoose';
import { IVendor } from '../../domain/entities/Vendor';
import { Role } from '../../domain/enums/enums';
import { VendorStatus } from '../../domain/enums/enums';

export interface IVendorDocument extends Omit<IVendor, '_id'>, Document { }

const vendorSchema: Schema = new Schema<IVendorDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        role: { type: String, default: Role.VENDOR },
        vendorStatus: {
            type: String,
            enum: Object.values(VendorStatus),
            default: VendorStatus.PENDING,
        },
        rejectionReason: { type: String },
        otp: { type: String },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        profession: { type: String },
        description: { type: String },
        eventHistory: { type: String },
        idProof: { type: String },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

const VendorModel = mongoose.model<IVendorDocument>('Vendor', vendorSchema);
export default VendorModel;
