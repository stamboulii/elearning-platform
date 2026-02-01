import prisma from '../config/database.js';

class CartService {
  async addToCart(userId, courseId) {
    try {
      // Check if course exists and is published
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          isFree: true,
          price: true,
        },
      });

      if (!course) {
        throw new Error('Course not found or not published');
      }

      // Check if user already owns the course
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (existingEnrollment) {
        throw new Error('You already own this course');
      }

      // Check if course is already in cart
      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (existingCartItem) {
        throw new Error('Course already in cart');
      }

      // Check if course is free - auto enroll instead of adding to cart
      if (course.isFree || Number(course.price) === 0) {
        // Auto-enroll user for free course
        const enrollment = await prisma.enrollment.create({
          data: {
            userId,
            courseId,
            isPaid: true,
            paidAmount: 0,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        });

        // Return special response for free course enrollment
        return {
          cartItem: null,
          enrollment,
          isFreeCourse: true,
        };
      }

      // Add course to cart
      const cartItem = await prisma.cartItem.create({
        data: {
          userId,
          courseId,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailImage: true,
              shortDescription: true,
              price: true,
              discountPrice: true,
              isFree: true,
              level: true,
              language: true,
              instructor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      return {
        cartItem,
        enrollment: null,
        isFreeCourse: false,
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async removeFromCart(userId, cartItemId) {
    try {
      // Verify the cart item belongs to the user
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId,
        },
      });

      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Delete the cart item
      await prisma.cartItem.delete({
        where: {
          id: cartItemId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async removeFromCartByCourse(userId, courseId) {
    try {
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!cartItem) {
        throw new Error('Course not in cart');
      }

      await prisma.cartItem.delete({
        where: {
          id: cartItem.id,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart by course:', error);
      throw error;
    }
  }

  async getUserCart(userId) {
    try {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailImage: true,
              shortDescription: true,
              price: true,
              discountPrice: true,
              isFree: true,
              level: true,
              language: true,
              instructor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              enrollments: {
                where: { userId },
                select: { id: true },
              },
              _count: {
                select: {
                  enrollments: true,
                  reviews: true,
                },
              },
              reviews: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        orderBy: {
          addedAt: 'desc',
        },
      });

      // Calculate cart summary
      let subtotal = 0;
      let discount = 0;

      const processedItems = cartItems.map(item => {
        const course = item.course;
        const currentPrice = course.discountPrice || course.price;
        
        // Add to subtotal
        subtotal += Number(currentPrice);

        // Calculate discount if any
        if (course.discountPrice && course.price) {
          discount += Number(course.price) - Number(course.discountPrice);
        }

        // Calculate average rating
        const ratings = course.reviews.map(r => r.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

        // Check if user owns the course
        const isOwned = course.enrollments.length > 0;

        return {
          id: item.id,
          courseId: course.id,
          title: course.title,
          slug: course.slug,
          thumbnailImage: course.thumbnailImage,
          shortDescription: course.shortDescription,
          price: course.price,
          discountPrice: course.discountPrice,
          currentPrice: Number(currentPrice),
          isFree: course.isFree,
          level: course.level,
          language: course.language,
          instructor: {
            id: course.instructor.id,
            name: `${course.instructor.firstName} ${course.instructor.lastName}`,
            profilePicture: course.instructor.profilePicture,
          },
          category: course.category,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalStudents: course._count.enrollments,
          totalReviews: course._count.reviews,
          isOwned,
          addedAt: item.addedAt,
        };
      });

      const total = subtotal;
      const tax = 0; // You can add tax calculation logic here
      const grandTotal = subtotal + tax;

      return {
        items: processedItems,
        summary: {
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          tax: tax.toFixed(2),
          total: grandTotal.toFixed(2),
        },
        itemCount: cartItems.length,
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async moveToWishlist(userId, cartItemIds) {
    try {
      // Get cart items
      const cartItems = await prisma.cartItem.findMany({
        where: {
          id: { in: cartItemIds },
          userId,
        },
        include: {
          course: {
            select: { id: true },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new Error('No cart items found');
      }

      const courseIds = cartItems.map(item => item.courseId);

      // Check which courses are already in wishlist
      const existingWishlists = await prisma.wishlist.findMany({
        where: {
          userId,
          courseId: { in: courseIds },
        },
      });

      const existingCourseIds = new Set(existingWishlists.map(w => w.courseId));

      // Prepare wishlist items to create
      const wishlistItems = cartItems
        .filter(item => !existingCourseIds.has(item.courseId))
        .map(item => ({
          userId,
          courseId: item.courseId,
        }));

      // Create wishlist items
      let createdWishlists = [];
      if (wishlistItems.length > 0) {
        // Use transaction for multiple operations
        await prisma.$transaction(async (tx) => {
          // Create wishlist items
          for (const item of wishlistItems) {
            const wishlist = await tx.wishlist.create({
              data: item,
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            });
            createdWishlists.push(wishlist);
          }

          // Remove from cart
          await tx.cartItem.deleteMany({
            where: {
              id: { in: cartItems.map(item => item.id) },
            },
          });
        });
      } else {
        // Only remove from cart if no wishlist items to create
        await prisma.cartItem.deleteMany({
          where: {
            id: { in: cartItems.map(item => item.id) },
          },
        });
      }

      return {
        movedToWishlist: wishlistItems.length,
        alreadyInWishlist: cartItems.length - wishlistItems.length,
        wishlistItems: createdWishlists,
      };
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      throw error;
    }
  }

  async isInCart(userId, courseId) {
    try {
        const cartItem = await prisma.cartItem.findUnique({
        where: {
            userId_courseId: {
            userId,
            courseId,
            },
        },
        select: {
            id: true,
            addedAt: true,
        },
        });

        return {
        isInCart: !!cartItem,
        cartItemId: cartItem?.id || null,
        };
    } catch (error) {
        console.error('Error checking cart:', error);
        throw error;
    }
    }

    async getCartCount(userId) {
        try {
        return await prisma.cartItem.count({
            where: { userId },
        });
        } catch (error) {
        console.error('Error getting cart count:', error);
        throw error;
        }
    }
}

export default new CartService();