import mongoose from 'mongoose';
import { logger } from '../../infrastructure/services/LoggerService';

export const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Connection states: 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const state = mongoose.connection.readyState;
    if (state === 1) {
        logger.info('🔗 MongoDB is already connected');
        return;
    }

    if (state === 2) {
        logger.info('⏳ MongoDB is currently connecting...');
        return;
    }

    // Configure Mongoose
    mongoose.set('strictQuery', false);

    try {
        logger.info('🔌 Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(mongoUri, {
            dbName: 'evenzo',
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info(`✅ MongoDB Connected Success: ${conn.connection.host}`);
        if (conn.connection.db) {
            logger.info(`💾 Database Name: ${conn.connection.db.databaseName}`);
        }

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error(`❌ MongoDB connection error:`, { error: err });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('✅ MongoDB reconnected');
        });

    } catch (error) {
        logger.error(`❌ Error connecting to MongoDB:`, { 
            message: (error as Error).message,
            stack: (error as Error).stack 
        });
        // For a backend server startup failure, exiting is safest to avoid running in a broken state
        process.exit(1);
    }
};

