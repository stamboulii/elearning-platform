import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Service - Handles user-related business logic
 */
class UserService {
  /**
   * Get user profile with all details
   */
  async getUserProfile(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        lastLogin: true,
        xp: true,
        level: true,
        badges: {
          include: {
            badge: true
          },
          orderBy: {
            awardedAt: 'desc'
          }
        },
        profile: {
          select: {
            phoneNumber: true,
            country: true,
            city: true,
            dateOfBirth: true,
            socialLinks: true,
            preferences: true
          }
        }
      }
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    return await prisma.user.update({
      where: { id: userId },
      data: profileData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        bio: true,
        profile: {
          select: {
            phoneNumber: true,
            country: true,
            city: true,
            dateOfBirth: true,
            socialLinks: true,
            preferences: true
          }
        }
      }
    });
  }

  /**
   * Update or create user profile details
   */
  async updateUserProfileDetails(userId, profileDetails) {
    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      // Update existing profile
      return await prisma.userProfile.update({
        where: { userId },
        data: profileDetails
      });
    } else {
      // Create new profile
      return await prisma.userProfile.create({
        data: {
          userId,
          ...profileDetails
        }
      });
    }
  }

  /**
   * Check if user exists
   */
  async userExists(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    return !!user;
  }
}

export default new UserService();