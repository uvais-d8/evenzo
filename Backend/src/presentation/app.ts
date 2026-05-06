import express from 'express';
import path from 'path';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { errorHandler } from './middleware/error.middleware';
import { logger } from '../infrastructure/services/LoggerService';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vendorRoutes from './routes/vendor.routes';
import adminRoutes from './routes/admin.routes';
import categoryRoutes from './routes/category.routes';
import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import serviceRoutes from './routes/service.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request & Response Logger
app.use((req, res, next) => {
    const start = Date.now();
    logger.info(`📡 ${req.method} ${req.url}`, { body: req.body, query: req.query });
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`🏁 ${req.method} ${req.url} - ${res.statusCode} [${duration}ms]`);
    });
    next();
});

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);

// Health check
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'Evenzo API is running', docs: '/api-docs' });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

export default app;

