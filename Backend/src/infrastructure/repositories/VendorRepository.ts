
import { IVendor } from '../../domain/entities/Vendor';
import { VendorStatus } from '../../domain/enums/enums';
import { IVendorRepository } from '../../domain/repositories/IVendorRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';
import VendorModel from '../database/VendorModel';

function toIVendor(doc: unknown): IVendor {
    return JSON.parse(JSON.stringify(doc)) as IVendor;
}

export class VendorRepository implements IVendorRepository {
    async count(filter: Record<string, any> = {}): Promise<number> {
        return await VendorModel.countDocuments(filter);
    }

    async findById(id: string): Promise<IVendor | null> {
        const doc = await VendorModel.findById(id).select('-password').lean();
        return doc ? toIVendor(doc) : null;
    }

    async findByEmail(email: string): Promise<IVendor | null> {
        const doc = await VendorModel.findOne({ email }).lean();
        return doc ? toIVendor(doc) : null;
    }

    async findByRefreshToken(token: string): Promise<IVendor | null> {
        const doc = await VendorModel.findOne({ refreshToken: token }).lean();
        return doc ? toIVendor(doc) : null;
    }

    async findByStatus(status: VendorStatus, options?: PaginationOptions, filterParams: Record<string, any> = {}): Promise<PaginatedResult<IVendor>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;
        const filter = { ...filterParams, vendorStatus: status };
        const [docs, total] = await Promise.all([
            VendorModel.find(filter).select('-password').skip(skip).limit(limit).lean(),
            VendorModel.countDocuments(filter),
        ]);
        const data = docs.map(toIVendor);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findAll(options?: PaginationOptions, filter: Record<string, any> = {}): Promise<PaginatedResult<IVendor>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;
        const [docs, total] = await Promise.all([
            VendorModel.find(filter).select('-password').skip(skip).limit(limit).lean(),
            VendorModel.countDocuments(filter),
        ]);
        const data = docs.map(toIVendor);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async countByStatus(status: VendorStatus): Promise<number> {
        return VendorModel.countDocuments({ vendorStatus: status });
    }

    async create(data: Partial<IVendor>): Promise<IVendor> {
        const vendor = await VendorModel.create(data);
        return toIVendor(vendor.toObject());
    }

    async update(id: string, data: Partial<IVendor>): Promise<IVendor | null> {
        const doc = await VendorModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).select('-password').lean();
        return doc ? toIVendor(doc) : null;
    }

    async save(vendor: IVendor): Promise<IVendor> {
        const doc = await VendorModel.findById((vendor as IVendor & { _id: string })._id);
        if (!doc) throw new Error('Vendor not found');
        Object.assign(doc, vendor);
        const saved = await doc.save();
        return toIVendor(saved.toObject());
    }

    async delete(id: string): Promise<boolean> {
        const result = await VendorModel.findByIdAndDelete(id);
        return !!result;
    }
}
