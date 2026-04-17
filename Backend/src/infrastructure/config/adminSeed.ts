import bcrypt from 'bcryptjs';
import AdminModel from '../database/AdminModel';
import { Role } from '../../domain/enums/enums';
import { logger } from '../../infrastructure/services/LoggerService';

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
            { upsert: true, returnDocument: 'after' }
        );

        logger.info(`✅ Admin account ready: ${adminEmail}`);
    } catch (error) {
        logger.error('❌ Error seeding admin:', { error });
    }
};

