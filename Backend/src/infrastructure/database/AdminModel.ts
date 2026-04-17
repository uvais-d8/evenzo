import mongoose, { Document, Schema } from 'mongoose';
import { IAdmin } from '../../domain/entities/Admin';
import { Role } from '../../domain/enums/enums';

export interface IAdminDocument extends Omit<IAdmin, '_id'>, Document { }

const adminSchema: Schema = new Schema<IAdminDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: Role.ADMIN },
        otp: { type: String },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: true },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

const AdminModel = mongoose.model<IAdminDocument>('Admin', adminSchema);
export default AdminModel;
