import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Evenzo API',
            version: '1.0.0',
            description: 'Evenzo Event Management Platform API Documentation',
            contact: { name: 'Evenzo Dev Team' },
        },
        servers: [
            { url: process.env.API_BASE_URL || 'http://localhost:7000', description: 'Development server' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        data: { type: 'array', items: {} },
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        address: { type: 'string' },
                        role: { type: 'string', enum: ['user'] },
                        isVerified: { type: 'boolean' },
                        isBlocked: { type: 'boolean' },
                    },
                },
                Vendor: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['vendor'] },
                        vendorStatus: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        rejectionReason: { type: 'string' },
                        profession: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        isBlocked: { type: 'boolean' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        image: { type: 'string' },
                        isDeleted: { type: 'boolean' },
                    },
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ['./src/presentation/routes/*.ts', './src/presentation/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
