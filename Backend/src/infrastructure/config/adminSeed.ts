import bcrypt from 'bcryptjs';
import AdminModel from '../database/models/AdminModel';
import { Role } from '../../domain/enums/Role.enum';
import { logger } from '../../shared/logger';

export const seedAdmin = async (): Promise<void> => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL ?? 'muhammeduvais6060@gmail.com';
        const adminName = 'Evenzo Admin';
        const adminPassword = process.env.ADMIN_PASSWORD ?? 'password123';

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await AdminModel.findOneAndUpdate(
            { email: adminEmail },
            {
                $set: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: Role.ADMIN,
                    isVerified: true,
                },
            },
            { upsert: true, new: true }
        );

        logger.info(`✅ Admin account ready: ${adminEmail}`);
    } catch (error) {
        logger.error('❌ Error seeding admin:', { error });
    }
};
