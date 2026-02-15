import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hydro Time API',
      version: '1.0.0',
      description: 'API para gerenciamento de hidratação com autenticação JWT',
      contact: {
        name: 'Hydro Time Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:8080',
        description: 'Deployment server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clh1a2b3c4d5e6f7g8h9i0j1',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'João Silva',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UserSettings: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            dailyGoalMl: {
              type: 'number',
              example: 2500,
            },
            reminderIntervalMinutes: {
              type: 'number',
              example: 60,
            },
            notificationsEnabled: {
              type: 'boolean',
              example: true,
            },
            language: {
              type: 'string',
              example: 'pt-BR',
            },
            theme: {
              type: 'string',
              example: 'light',
            },
          },
        },
        IntakeLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            amountMl: {
              type: 'number',
              example: 250,
            },
            timestamp: {
              type: 'number',
              example: 1707931200000,
            },
            durationSeconds: {
              type: 'number',
              example: 30,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Email já registrado',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
