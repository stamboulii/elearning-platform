import prisma from '../config/database.js';

class WishlistService {
    
    async addToWishlist(userId, courseId) {
        try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        const existing = await prisma.wishlist.findUnique({
            where: {
            userId_courseId: {
                userId,
                courseId
            }
            }
        });

        if (existing) {
            throw new Error('Course already in favorites');
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
            userId,
            courseId
            },
            include: {
            course: {
                select: {
                id: true,
                title: true,
                slug: true,
                thumbnailImage: true,
                instructor: {
                    select: {
                    id: true,
                    firstName: true,
                    lastName: true
                    }
                },
                price: true,
                discountPrice: true,
                isFree: true,
                level: true,
                language: true
                }
            }
            }
        });

        return wishlistItem;
        } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
        }
    }

    async removeFromWishlist(userId, courseId) {
        try {
        const wishlistItem = await prisma.wishlist.delete({
            where: {
            userId_courseId: {
                userId,
                courseId
            }
            }
        });

        return wishlistItem;
        } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
        }
    }

    async getUserWishlist(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.wishlist.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailImage: true,
                shortDescription: true,
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                },
                price: true,
                discountPrice: true,
                isFree: true,
                level: true,
                language: true,
                status: true,
                enrollments: {
                  select: {
                    id: true
                  }
                },
                reviews: {
                  select: {
                    rating: true
                  }
                }
              }
            }
          },
          orderBy: {
            addedAt: 'desc'
          }
        }),
        prisma.wishlist.count({
          where: { userId }
        })
      ]);

      // Calculate average rating for each course
      const wishlistWithRating = items.map(item => {
        const course = item.course;
        const ratings = course.reviews.map(r => r.rating);
        const avgRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
        
        const enrollmentsCount = course.enrollments.length;
        
        return {
          ...item,
          course: {
            ...course,
            avgRating: parseFloat(avgRating.toFixed(1)),
            enrollmentsCount,
            reviews: undefined // Remove reviews array
          }
        };
      });

      return {
        items: wishlistWithRating,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  // Check if course is in user's wishlist
  async isInWishlist(userId, courseId) {
    try {
      const wishlistItem = await prisma.wishlist.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      });

      return !!wishlistItem;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      throw error;
    }
  }

  // Get count of wishlist items
  async getWishlistCount(userId) {
    try {
      return await prisma.wishlist.count({
        where: { userId }
      });
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      throw error;
    }
  }
}

export default new WishlistService();