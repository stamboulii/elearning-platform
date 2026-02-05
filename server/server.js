import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.js';
import dotenv from 'dotenv';

dotenv.config();

// Import cloudinary config AFTER env vars are loaded
import './src/config/cloudinary.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import enrollmentRoutes from './src/routes/enrollmentRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';
import wishlistRoutes from './src/routes/wishlistRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import checkoutRoutes from './src/routes/checkoutRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Learning Platform API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/transactions', transactionRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Learning Platform API',
    version: '1.0.0',
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`); 
});
