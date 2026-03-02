import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from '../../../domain/entities/Category';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document { }

const categorySchema: Schema = new Schema<ICategoryDocument>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String },
        image: { type: String },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const CategoryModel = mongoose.model<ICategoryDocument>('Category', categorySchema);
export default CategoryModel;
