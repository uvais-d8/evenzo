import express from 'express';
import path from 'path';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './presentation/docs/swagger';
import { errorHandler } from './presentation/middleware/error.middleware';

import authRoutes from './presentation/routes/auth.routes';
import userRoutes from './presentation/routes/user.routes';
import vendorRoutes from './presentation/routes/vendor.routes';
import adminRoutes from './presentation/routes/admin.routes';
import categoryRoutes from './presentation/routes/category.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// Health check
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'Evenzo API is running', docs: '/api-docs' });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

export default app;
