import mongoose from 'mongoose';
import { logger } from '../../shared/logger';

export const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            dbName: 'evenzo',
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
            logger.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected');
        });
    } catch (error) {
        logger.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
        process.exit(1);
    }
};
