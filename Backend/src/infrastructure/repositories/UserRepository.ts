import { injectable } from 'tsyringe';
import { IUser } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IBaseRepository';
import UserModel from '../database/UserModel';
import { BaseRepository } from './BaseRepository';


// Safely cast Mongoose lean result to domain type (ObjectId → string via JSON serialisation)
function toIUser(doc: unknown): IUser {
    return JSON.parse(JSON.stringify(doc)) as IUser;
}

@injectable()
export class UserRepository extends BaseRepository<any> implements IUserRepository {
    
    constructor() {
        super(UserModel);
    }
    
    // Override findById to return full IUser cast cleanly
    async findById(id: string): Promise<IUser | null> {
        const doc = await this._model.findById(id).select('-password').lean();
        return doc ? toIUser(doc) : null;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        const doc = await this._model.findOne({ email }).lean();
        return doc ? toIUser(doc) : null;
    }

    async findByRefreshToken(token: string): Promise<IUser | null> {
        const doc = await this._model.findOne({ refreshToken: token }).lean();
        return doc ? toIUser(doc) : null;
    }

    // Override findAll to use specific IUser type and Mongoose mapping
    async findAll(options?: PaginationOptions, filter: Record<string, any> = {}): Promise<PaginatedResult<IUser>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;
        const [docs, total] = await Promise.all([
            this._model.find(filter).select('-password').skip(skip).limit(limit).lean(),
            this._model.countDocuments(filter),
        ]);
        const data = docs.map(toIUser);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // `create`, `update`, `delete` are already covered by BaseRepository if parameters match, 
    // but we can override them to maintain the exact logic needed (lean/toIUser).
    async create(data: Partial<IUser>): Promise<IUser> {
        const user = await this._model.create(data);
        return toIUser(user.toObject());
    }

    async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const doc = await this._model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).select('-password').lean();
        return doc ? toIUser(doc) : null;
    }

    async save(user: IUser): Promise<IUser> {
        const doc = await this._model.findById((user as IUser & { _id: string })._id);
        if (!doc) throw new Error('User not found');
        Object.assign(doc, user);
        const saved = await doc.save();
        return toIUser(saved.toObject());
    }
}
