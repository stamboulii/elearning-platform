# 🎓 E-Learning Platform

A state-of-the-art, full-stack learning management system built with focus on rich aesthetics, real-time engagement, and detailed analytics. This platform serves students, instructors, and administrators with a seamless, premium experience.

> [!NOTE]
> For a detailed technical overview of recent AI features and system improvements, please refer to the [SYSTEM_OVERVIEW.md](file:///home/hazar/Documents/personal-project/elearning-platform/SYSTEM_OVERVIEW.md).

## 🚀 Overview

This project is a robust e-learning ecosystem designed for high performance and user engagement. It features a complete course management lifecycle, real-time notifications via Socket.IO, and a premium design system with dark mode support and micro-animations.

## ✨ Key Features

### 🔔 Real-time Engagement
- **Instant Notifications:** Real-time alerts for course publication, student enrollments, and system updates powered by Socket.IO.
- **Smart Routing:** Notifications automatically route users to contextually relevant pages (e.g., instructors go to course analytics on enrollment).

### 🎓 Student Features
- **Course Discovery:** Premium catalog with advanced filtering by category and difficulty.
- **Interactive Learning:** Seamless course player with progress tracking and curriculum navigation.
- **Gamification:** XP system, leveling, and badge unlocking for milestones.
- **Certification:** Dynamic PDF certificate generation upon course mastery.

### 👨‍🏫 Instructor Features
- **Visual Course Builder:** Intuitive interface for creating multi-section curricula and uploading high-quality video content.
- **Detailed Analytics:** Dedicated course performance dashboard with revenue tracking, enrollment trends, and student progress metrics.
- **Content Management:** Full control over drafts, publication, and student engagement notifications.

### 🛠️ Admin Features
- **Global Control:** Comprehensive management of users, courses, and platform categories.
- **Financial Oversight:** Real-time transaction monitoring and enrollment tracking.
- **Course Moderation:** Quality control gate for all platform content.

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Real-time:** Socket.IO Client
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Design System)
- **Icons & UI:** Lucide-React + Framer Motion (Animations)
- **Data Viz:** Recharts (Analytics)

### Backend
- **Framework:** Node.js + Express 5
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Real-time:** Socket.IO
- **AI Integration:** Groq (AI-generated course descriptions)
- **Authentication:** JWT + Bcryptjs
- **Storage:** Cloudinary / Local Storage

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd elearning-platform
   ```

2. **Environment Configuration:**
   - Configure `.env` files in both `client` and `server` directories.

3. **Backend Setup:**
   ```bash
   cd server
   npm install
   npx prisma generate
   npm run dev
   ```

4. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

---
*Built with ❤️ for the future of education.*
