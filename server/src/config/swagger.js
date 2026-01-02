import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Learning Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the E-Learning Platform',
      contact: {
        name: 'API Support',
        email: 'support@elearning.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.elearning.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token (without "Bearer" prefix)'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
            profilePicture: { type: 'string', format: 'uri', nullable: true },
            bio: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            profile: {
              type: 'object',
              nullable: true,
              properties: {
                phoneNumber: { type: 'string', nullable: true },
                country: { type: 'string', nullable: true },
                city: { type: 'string', nullable: true },
                dateOfBirth: { type: 'string', format: 'date-time', nullable: true },
                socialLinks: { type: 'object', nullable: true },
                preferences: { type: 'object', nullable: true }
              }
            }
          }
        },
        UserProfile: {
          type: 'object',
          properties: {
            phoneNumber: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            dateOfBirth: { type: 'string', format: 'date', nullable: true },
            socialLinks: { type: 'object', nullable: true },
            preferences: { type: 'object', nullable: true }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            slug: { type: 'string' },
            shortDescription: { type: 'string' },
            fullDescription: { type: 'string', nullable: true },
            thumbnailImage: { type: 'string', format: 'uri', nullable: true },
            previewVideo: { type: 'string', format: 'uri', nullable: true },
            price: { type: 'number', format: 'decimal' },
            discountPrice: { type: 'number', format: 'decimal', nullable: true },
            currency: { type: 'string', default: 'USD' },
            level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'] },
            language: { type: 'string', default: 'en' },
            status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
            estimatedDuration: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            displayOrder: { type: 'integer' },
            parentCategoryId: { type: 'string', format: 'uuid', nullable: true }
          }
        },
        Section: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            courseId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            orderNumber: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sectionId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            contentType: { type: 'string', enum: ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'DOCUMENT'] },
            contentUrl: { type: 'string', format: 'uri', nullable: true },
            content: { type: 'string', nullable: true },
            duration: { type: 'integer', nullable: true },
            orderNumber: { type: 'integer' },
            isPreview: { type: 'boolean' },
            resources: { type: 'array', items: { type: 'object' }, nullable: true }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            courseId: { type: 'string', format: 'uuid' },
            enrolledAt: { type: 'string', format: 'date-time' },
            lastAccessed: { type: 'string', format: 'date-time', nullable: true },
            progressPercentage: { type: 'integer', minimum: 0, maximum: 100 },
            completionStatus: { type: 'string', enum: ['IN_PROGRESS', 'COMPLETED'] },
            completedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ForbiddenError: {
          description: 'User does not have permission',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Categories', description: 'Course category management' },
      { name: 'Courses', description: 'Course management operations' },
      { name: 'Sections', description: 'Course section management' },
      { name: 'Lessons', description: 'Lesson management' },
      { name: 'Enrollments', description: 'Course enrollment operations' },
      { name: 'Progress', description: 'Learning progress tracking' },
      { name: 'Upload', description: 'File upload operations' }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;