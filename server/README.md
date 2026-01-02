# E-Learning Platform Backend

A robust Node.js backend API for an e-learning platform built with Express.js, Prisma ORM, and PostgreSQL.

## 📋 Table of Contents

- [E-Learning Platform Backend](#e-learning-platform-backend)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [📦 Prerequisites](#-prerequisites)
  - [🚀 Installation](#-installation)
  - [⚙️ Configuration](#️-configuration)
  - [🏃 Running the Project](#-running-the-project)
    - [Local Development](#local-development)
    - [Docker](#docker)
    - [Docker Compose](#docker-compose)
  - [🗄️ Database Setup](#️-database-setup)
    - [Using Prisma Migrations](#using-prisma-migrations)
    - [Database Schema](#database-schema)
  - [📚 API Documentation](#-api-documentation)
    - [API Endpoints](#api-endpoints)
  - [🔐 Environment Variables](#-environment-variables)
  - [📁 Project Structure](#-project-structure)
  - [📜 Scripts](#-scripts)
  - [🐛 Troubleshooting](#-troubleshooting)
    - [Database Connection Issues](#database-connection-issues)
    - [Port Already in Use](#port-already-in-use)
    - [Prisma Client Not Generated](#prisma-client-not-generated)
    - [Docker Issues](#docker-issues)
  - [📝 License](#-license)
  - [👥 Contributing](#-contributing)
  - [📞 Support](#-support)

## ✨ Features

- 🔐 JWT-based authentication and authorization
- 📚 Course management system
- 👥 User enrollment and progress tracking
- 💳 Payment integration with Stripe
- 📝 Quiz and assessment system
- 💬 Discussion forums
- ⭐ Review and rating system
- 📊 Swagger API documentation
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- ☁️ Cloudinary integration for file uploads
- 🐳 Docker support

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)

## 🚀 Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd elearning-platform/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env  # If you have an .env.example file
   # Or create a .env file manually (see Configuration section)
   ```

## ⚙️ Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/elearning

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# Client Configuration
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe Configuration (optional, for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email Configuration (optional, for nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## 🏃 Running the Project

### Local Development

1. **Start PostgreSQL database**
   - Make sure PostgreSQL is running on your machine
   - Create a database named `elearning` (or update `DATABASE_URL` in `.env`)

2. **Run database migrations**
   ```bash
   npm run generate-db
   ```
   This will:
   - Generate Prisma Client
   - Run database migrations
   - Seed the database (if seed file exists)

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000` (or the port specified in `.env`)

### Docker

1. **Build the Docker image**
   ```bash
   docker build -t elearning-backend .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name elearning-backend \
     -p 5000:5000 \
     -e DATABASE_URL="postgresql://user:password@host:5432/elearning" \
     -e JWT_SECRET="your-jwt-secret" \
     -e CLOUDINARY_CLOUD_NAME="your-cloud-name" \
     -e CLOUDINARY_API_KEY="your-api-key" \
     -e CLOUDINARY_API_SECRET="your-api-secret" \
     -e CLIENT_URL="http://localhost:5173" \
     elearning-backend
   ```

### Docker Compose

The easiest way to run the entire stack (backend + PostgreSQL):

1. **Create/Update `.env` file** with your configuration (see Configuration section)

2. **Start all services**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Start PostgreSQL database
   - Build and start the backend server
   - Run database migrations automatically

3. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop all services**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes** (⚠️ This will delete database data)
   ```bash
   docker-compose down -v
   ```

## 🗄️ Database Setup

### Using Prisma Migrations

1. **Create a new migration**
   ```bash
   npx prisma migrate dev --name migration_name
   ```

2. **Apply migrations in production**
   ```bash
   npm run deploy-db
   # or
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client** (after schema changes)
   ```bash
   npx prisma generate
   ```

4. **Open Prisma Studio** (database GUI)
   ```bash
   npx prisma studio
   ```

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:

- **User** - User accounts and authentication
- **Course** - Course information and metadata
- **Enrollment** - Student course enrollments
- **Lesson** - Course lessons and content
- **Progress** - Learning progress tracking
- **Review** - Course reviews and ratings
- **Transaction** - Payment transactions
- **Quiz** - Quiz and assessment system

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:5000/api-docs`
- **API Base URL**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

### API Endpoints

- `/api/auth` - Authentication routes (login, register, etc.)
- `/api/categories` - Course categories
- `/api/courses` - Course management
- `/api/enrollments` - Enrollment management
- `/api/progress` - Progress tracking
- `/api/upload` - File upload endpoints

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | No | `development` |
| `PORT` | Server port | No | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | - |
| `JWT_SECRET` | Secret key for JWT tokens | **Yes** | - |
| `JWT_EXPIRE` | JWT token expiration | No | `7d` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | **Yes** | - |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | No | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | No | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | **Yes** | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | **Yes** | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | **Yes** | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | No | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No | - |

## 📁 Project Structure

```
server/
├── prisma/
│   ├── migrations/       # Database migrations
│   └── schema.prisma     # Prisma schema definition
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Prisma client setup
│   │   ├── cloudinary.js # Cloudinary configuration
│   │   └── swagger.js   # Swagger documentation config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication middleware
│   │   └── upload.js    # File upload middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   │   └── jwt.js       # JWT helper functions
│   └── validators/      # Input validation
├── .dockerignore        # Docker ignore file
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # Docker Compose configuration
├── package.json        # Dependencies and scripts
└── server.js          # Application entry point
```

## 📜 Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with nodemon |
| `npm run generate-db` | Generate Prisma Client and run migrations |
| `npm run deploy-db` | Deploy migrations (production) |

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Check database credentials and permissions

### Port Already in Use

- Change the `PORT` in `.env` file
- Or stop the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill
  ```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Docker Issues

- Ensure Docker is running
- Check Docker logs: `docker-compose logs`
- Rebuild images: `docker-compose build --no-cache`

## 📝 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Happy Coding! 🚀**




    command: sh -c "npx prisma migrate deploy && node server.js"
