import { IAdmin } from '../../domain/entities/Admin';
import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import AdminModel from '../database/models/AdminModel';

function toIAdmin(doc: unknown): IAdmin {
    return JSON.parse(JSON.stringify(doc)) as IAdmin;
}

export class AdminRepository implements IAdminRepository {
    async findById(id: string): Promise<IAdmin | null> {
        const doc = await AdminModel.findById(id).lean();
        return doc ? toIAdmin(doc) : null;
    }

    async findByEmail(email: string): Promise<IAdmin | null> {
        const doc = await AdminModel.findOne({ email }).lean();
        return doc ? toIAdmin(doc) : null;
    }

    async findByRefreshToken(token: string): Promise<IAdmin | null> {
        const doc = await AdminModel.findOne({ refreshToken: token }).lean();
        return doc ? toIAdmin(doc) : null;
    }

    async create(data: Partial<IAdmin>): Promise<IAdmin> {
        const admin = await AdminModel.create(data);
        return toIAdmin(admin.toObject());
    }

    async update(id: string, data: Partial<IAdmin>): Promise<IAdmin | null> {
        const doc = await AdminModel.findByIdAndUpdate(id, data, { new: true }).lean();
        return doc ? toIAdmin(doc) : null;
    }

    async save(admin: IAdmin): Promise<IAdmin> {
        const doc = await AdminModel.findById((admin as IAdmin & { _id: string })._id);
        if (!doc) throw new Error('Admin not found');
        Object.assign(doc, admin);
        const saved = await doc.save();
        return toIAdmin(saved.toObject());
    }

    async upsertByEmail(email: string, data: Partial<IAdmin>): Promise<IAdmin> {
        const doc = await AdminModel.findOneAndUpdate(
            { email },
            { $set: data },
            { upsert: true, new: true }
        );
        return toIAdmin(doc.toObject());
    }

    async delete(id: string): Promise<boolean> {
        const result = await AdminModel.findByIdAndDelete(id);
        return !!result;
    }
}
