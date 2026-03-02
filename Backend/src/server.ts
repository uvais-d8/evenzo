import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './infrastructure/database/connection';
import { seedAdmin } from './infrastructure/config/adminSeed';
import { logger } from './shared/logger';

const PORT = parseInt(process.env.PORT ?? '7000', 10);

connectDB()
  .then(async () => {
    await seedAdmin();
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  });
