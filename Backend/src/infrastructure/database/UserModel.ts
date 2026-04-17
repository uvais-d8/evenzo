import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../../domain/entities/User';
import { Role } from '../../domain/enums/enums';

export interface IUserDocument extends Omit<IUser, '_id'>, Document { }

const userSchema: Schema = new Schema<IUserDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        eventHistory: { type: String },
        role: { type: String, default: Role.USER },
        otp: { type: String },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

const UserModel = mongoose.model<IUserDocument>('User', userSchema);
export default UserModel;
