import { IUser } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';
import UserModel from '../database/models/UserModel';

// Safely cast Mongoose lean result to domain type (ObjectId → string via JSON serialisation)
function toIUser(doc: unknown): IUser {
    return JSON.parse(JSON.stringify(doc)) as IUser;
}

export class UserRepository implements IUserRepository {
    async findById(id: string): Promise<IUser | null> {
        const doc = await UserModel.findById(id).select('-password').lean();
        return doc ? toIUser(doc) : null;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        const doc = await UserModel.findOne({ email }).lean();
        return doc ? toIUser(doc) : null;
    }

    async findByRefreshToken(token: string): Promise<IUser | null> {
        const doc = await UserModel.findOne({ refreshToken: token }).lean();
        return doc ? toIUser(doc) : null;
    }

    async findAll(options: PaginationOptions): Promise<PaginatedResult<IUser>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [docs, total] = await Promise.all([
            UserModel.find().select('-password').skip(skip).limit(limit).lean(),
            UserModel.countDocuments(),
        ]);
        const data = docs.map(toIUser);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async create(data: Partial<IUser>): Promise<IUser> {
        const user = await UserModel.create(data);
        return toIUser(user.toObject());
    }

    async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const doc = await UserModel.findByIdAndUpdate(id, data, { new: true }).select('-password').lean();
        return doc ? toIUser(doc) : null;
    }

    async save(user: IUser): Promise<IUser> {
        const doc = await UserModel.findById((user as IUser & { _id: string })._id);
        if (!doc) throw new Error('User not found');
        Object.assign(doc, user);
        const saved = await doc.save();
        return toIUser(saved.toObject());
    }

    async delete(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }
}
