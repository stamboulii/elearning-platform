import { PrismaClient } from '@prisma/client';
import userService from '../services/authService.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test connection
// prisma.$connect()
//   .then(() => console.log('✅ Database connected successfully'))
//   .catch((err) => console.error('❌ Database connection failed:', err));


prisma
  .$connect()
  .then(async () => {
      try {
          console.log("✅ Database connected successfully");
          const admins = await userService.findUserByRole({
              role: "ADMIN",
          });
          if (admins.length === 0) {
              const firstName = process.env.DEFAULT_FIRSTNAME || "Super";
              const lastName = process.env.DEFAULT_LASTNAME || "Admin";
              const password = process.env.DEFAULT_PASSWORD || "Admin@123456"
              
              await userService.createUser({
                  email: process.env.DEFAULT_EMAIL || "admin@elearning.com",
                  role: "ADMIN",
                  firstName,
                  lastName,
                  password,
                  profilePicture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=512`,
              });
          }
      } catch (error) {
          console.log(error);
          process.exit(1);
      }
  })
  .catch((error) => {
      console.log(error);
      process.exit(1);
  });
export default prisma;