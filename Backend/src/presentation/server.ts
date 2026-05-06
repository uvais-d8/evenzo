
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from '../infrastructure/database/connection';
import { seedAdmin } from '../infrastructure/config/adminSeed';
import { logger } from '../infrastructure/services/LoggerService';

const PORT = parseInt(process.env.PORT ?? '7000', 10);

connectDB()
  .then(async () => {
    await seedAdmin();
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on http://0.0.0.0:${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  });

