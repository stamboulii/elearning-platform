import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Auth Service - Handles all authentication business logic
 */
class AuthService {
  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        bio: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            phoneNumber: true,
            country: true,
            city: true,
            dateOfBirth: true,
            socialLinks: true
          }
        }
      }
    });
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    const { email, password, firstName, lastName, role } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'STUDENT',
        profilePicture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=512`,
        profile: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        createdAt: true
      }
    });

    return user;
  }

  /**
   * Verify user password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    });
  }

  /**
   * Check if user is active
   */
  isUserActive(user) {
    return user && user.isActive === true;
  }

  /**
   * Get user without password
   */
  excludePassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();