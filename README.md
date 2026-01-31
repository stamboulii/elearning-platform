# E-Learning Platform

A comprehensive, full-stack e-learning platform built with modern technologies. This platform enables students to learn from various courses, instructors to create and manage content, and administrators to oversee the entire ecosystem with gamification elements and detailed analytics.

## 🚀 Overview

This project is a robust Learning Management System (LMS) designed for scalability and user engagement. It features a complete course management lifecycle, from creation and approval to enrollment and certification.

## ✨ Key Features

### 🎓 Student Features
- **Course Discovery:** Browse and search courses by category, level, or keywords.
- **Interactive Learning:** Progress tracking through lessons, sections, and quizzes.
- **Gamification:** Earn XP, level up, and unlock badges based on learning milestones.
- **Certificates:** Automatically generate and download PDF certificates upon course completion.
- **Personalized Dashboard:** Track enrollments, progress, and achievements.

### 👨‍🏫 Instructor Features
- **Course Builder:** Comprehensive tools to create sections, lessons, and quizzes.
- **Analytics:** Individual course performance metrics and student engagement data.
- **Dashboard:** Manage content and monitor earnings.

### 🛠️ Admin Features
- **Global Management:** Oversee all users, courses, and platform categories.
- **Financial Tracking:** Monitor transactions and handle refunds.
- **Advanced Analytics:** Real-time revenue trends, user growth, and platform health.
- **Course Moderation:** Review and approve/reject instructor content.

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router 7
- **Icons:** Lucide-React
- **Charts:** Recharts
- **State Management:** React Hooks (useState, useEffect, useMemo, useCallback)

### Backend
- **Runtime:** Node.js (Express 5)
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JSON Web Token (JWT) with secure password hashing (bcryptjs)
- **Media:** Cloudinary (Storage for thumbnails and profiles)
- **Containerization:** Docker & Docker Compose
- **Documentation:** Swagger (OpenAPI 3.0)
- **Payments:** Stripe integration

## 🛠️ Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd elearning-platform
   ```

2. **Backend Setup:**
   ```bash
   cd server
   # Create a .env file based on .env.example (if available)
   docker-compose up -d
   ```

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🏗️ Project Structure

```text
elearning-platform/
├── client/             # React frontend applications
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page-level components (Admin, Student, Instructor)
│   │   ├── services/   # API communication logic
│   │   └── utils/      # Helper functions
├── server/             # Express backend application
│   ├── prisma/         # Database schema and migrations
│   ├── src/
│   │   ├── controllers/# Request handlers
│   │   ├── services/   # Business logic
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Authentication and security
│   └── docker-compose.yml
└── README.md           # Project documentation
```

## 📚 API Documentation

Once the backend is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

---
*Built with ❤️ for Modern Education.*
