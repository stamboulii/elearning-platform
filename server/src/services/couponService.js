// import prisma from '../config/database.js';

// class CouponService {

//   async createCoupon(couponData) {
//     try {
//       // Validate dates
//       const validFrom = new Date(couponData.validFrom);
//       const validUntil = new Date(couponData.validUntil);
      
//       if (validUntil <= validFrom) {
//         throw new Error('Valid until date must be after valid from date');
//       }

//       if (couponData.discountType === 'PERCENTAGE' && couponData.discountValue > 100) {
//         throw new Error('Discount percentage cannot exceed 100%');
//       }

//       const coupon = await prisma.coupon.create({
//         data: {
//           code: couponData.code.toUpperCase(),
//           discountType: couponData.discountType,
//           discountValue: couponData.discountValue,
//           validFrom,
//           validUntil,
//           usageLimit: couponData.usageLimit || null,
//           applicableCourses: couponData.applicableCourses || null,
//           isActive: couponData.isActive !== undefined ? couponData.isActive : true,
//         },
//       });

//       return coupon;
//     } catch (error) {
//       console.error('Error creating coupon:', error);
//       throw error;
//     }
//   }

//   async validateCoupon(code, userId, cartItems = []) {
//     try {
//       // Find active coupon
//       const coupon = await prisma.coupon.findFirst({
//         where: {
//           code: code.toUpperCase(),
//           isActive: true,
//           validFrom: { lte: new Date() },
//           validUntil: { gte: new Date() },
//         },
//       });

//       if (!coupon) {
//         throw new Error('Invalid or expired coupon');
//       }

//       // Check usage limit
//       if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
//         throw new Error('Coupon usage limit reached');
//       }

//       // Check if user has already used this coupon
//       const userUsage = await prisma.couponUsage.findFirst({
//         where: {
//           couponId: coupon.id,
//           userId,
//         },
//       });

//       if (userUsage) {
//         throw new Error('You have already used this coupon');
//       }

//       // Validate applicable courses if specified
//       if (coupon.applicableCourses && cartItems.length > 0) {
//         const applicableCourseIds = coupon.applicableCourses;
//         const cartCourseIds = cartItems.map(item => item.courseId);
        
//         const hasApplicableCourse = cartCourseIds.some(courseId => 
//           applicableCourseIds.includes(courseId)
//         );

//         if (!hasApplicableCourse) {
//           throw new Error('Coupon not applicable to any course in your cart');
//         }
//       }

//       return {
//         valid: true,
//         coupon,
//         message: 'Coupon is valid',
//       };
//     } catch (error) {
//       console.error('Error validating coupon:', error);
//       return {
//         valid: false,
//         message: error.message,
//         coupon: null,
//       };
//     }
//   }

//     async applyCouponToCart(code, userId, cartItems, cartTotal) {
//         try {
//             // Validate coupon
//             const validation = await this.validateCoupon(code, userId, cartItems);
            
//             if (!validation.valid) {
//             throw new Error(validation.message);
//             }

//             const coupon = validation.coupon;

//             // Calculate discount
//             let discountAmount = 0;
            
//             if (coupon.discountType === 'PERCENTAGE') {
//             discountAmount = (cartTotal * coupon.discountValue) / 100;
//             } else if (coupon.discountType === 'FIXED') {
//             discountAmount = Number(coupon.discountValue);
            
//             // Ensure discount doesn't exceed cart total
//             if (discountAmount > cartTotal) {
//                 discountAmount = cartTotal;
//             }
//             }

//             // Apply applicable courses logic ONLY if applicableCourses exists and has items
//             if (coupon.applicableCourses && 
//                 Array.isArray(coupon.applicableCourses) && 
//                 coupon.applicableCourses.length > 0 && 
//                 cartItems.length > 0) {
            
//             const applicableCourseIds = coupon.applicableCourses;
//             const applicableCartItems = cartItems.filter(item => 
//                 applicableCourseIds.includes(item.courseId)
//             );

//             if (applicableCartItems.length === 0) {
//                 throw new Error('Coupon not applicable to any course in your cart');
//             }

//             // Calculate subtotal for applicable courses only
//             const applicableSubtotal = applicableCartItems.reduce((total, item) => {
//                 return total + Number(item.currentPrice || item.price);
//             }, 0);

//             // Recalculate discount based on applicable courses only
//             if (coupon.discountType === 'PERCENTAGE') {
//                 discountAmount = (applicableSubtotal * coupon.discountValue) / 100;
//             } else if (coupon.discountType === 'FIXED') {
//                 discountAmount = Number(coupon.discountValue);
                
//                 // Ensure discount doesn't exceed applicable subtotal
//                 if (discountAmount > applicableSubtotal) {
//                 discountAmount = applicableSubtotal;
//                 }
//             }
//             }
//             // If applicableCourses is empty/null, apply discount to entire cart

//             return {
//             success: true,
//             coupon,
//             discountAmount,
//             finalTotal: cartTotal - discountAmount,
//             };
//         } catch (error) {
//             console.error('Error applying coupon:', error);
//             return {
//             success: false,
//             message: error.message,
//             discountAmount: 0,
//             finalTotal: cartTotal,
//             };
//         }
//     }

//     async useCoupon(couponId, userId, transactionId) {
//         try {
//         // Check if coupon exists and is still valid
//         const coupon = await prisma.coupon.findUnique({
//             where: { id: couponId },
//         });

//         if (!coupon || !coupon.isActive) {
//             throw new Error('Invalid coupon');
//         }

//         // Check usage limit
//         if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
//             throw new Error('Coupon usage limit reached');
//         }

//         // Create coupon usage record
//         const couponUsage = await prisma.couponUsage.create({
//             data: {
//             couponId,
//             userId,
//             transactionId,
//             },
//         });

//         // Increment times used
//         await prisma.coupon.update({
//             where: { id: couponId },
//             data: {
//             timesUsed: { increment: 1 },
//             },
//         });

//         return couponUsage;
//         } catch (error) {
//         console.error('Error using coupon:', error);
//         throw error;
//         }
//     }

//     async getAllCoupons(filters = {}) {
//         try {
//         const whereClause = {};
        
//         if (filters.isActive !== undefined) {
//             whereClause.isActive = filters.isActive;
//         }
        
//         if (filters.search) {
//             whereClause.OR = [
//             { code: { contains: filters.search, mode: 'insensitive' } },
//             ];
//         }

//         const coupons = await prisma.coupon.findMany({
//             where: whereClause,
//             include: {
//             _count: {
//                 select: { usages: true },
//             },
//             },
//             orderBy: {
//             createdAt: 'desc',
//             },
//         });

//         return coupons;
//         } catch (error) {
//         console.error('Error getting coupons:', error);
//         throw error;
//         }
//     }

//     async getCouponById(id) {
//         try {
//         const coupon = await prisma.coupon.findUnique({
//             where: { id },
//             include: {
//             usages: {
//                 include: {
//                 user: {
//                     select: {
//                     id: true,
//                     email: true,
//                     firstName: true,
//                     lastName: true,
//                     },
//                 },
//                 transaction: {
//                     select: {
//                     id: true,
//                     amount: true,
//                     status: true,
//                     createdAt: true,
//                     },
//                 },
//                 },
//             },
//             },
//         });

//         return coupon;
//         } catch (error) {
//         console.error('Error getting coupon:', error);
//         throw error;
//         }
//     }

//     async updateCoupon(id, updateData) {
//         try {
//         // Validate dates if provided
//         if (updateData.validFrom && updateData.validUntil) {
//             const validFrom = new Date(updateData.validFrom);
//             const validUntil = new Date(updateData.validUntil);
            
//             if (validUntil <= validFrom) {
//             throw new Error('Valid until date must be after valid from date');
//             }
//         }

//         if (updateData.discountType === 'PERCENTAGE' && updateData.discountValue > 100) {
//             throw new Error('Discount percentage cannot exceed 100%');
//         }

//         const coupon = await prisma.coupon.update({
//             where: { id },
//             data: updateData,
//         });

//         return coupon;
//         } catch (error) {
//         console.error('Error updating coupon:', error);
//         throw error;
//         }
//     }

//     async deleteCoupon(id) {
//         try {
//         // Check if coupon has been used
//         const coupon = await prisma.coupon.findUnique({
//             where: { id },
//             include: {
//             _count: {
//                 select: { usages: true },
//             },
//             },
//         });

//         if (coupon._count.usages > 0) {
//             throw new Error('Cannot delete coupon that has been used');
//         }

//         await prisma.coupon.delete({
//             where: { id },
//         });

//         return { success: true };
//         } catch (error) {
//         console.error('Error deleting coupon:', error);
//         throw error;
//         }
//     }

//     async getCouponUsageStats(couponId) {
//         try {
//         const coupon = await prisma.coupon.findUnique({
//             where: { id: couponId },
//             include: {
//             _count: {
//                 select: { usages: true },
//             },
//             usages: {
//                 select: {
//                 usedAt: true,
//                 user: {
//                     select: {
//                     id: true,
//                     email: true,
//                     },
//                 },
//                 transaction: {
//                     select: {
//                     amount: true,
//                     status: true,
//                     },
//                 },
//                 },
//                 orderBy: {
//                 usedAt: 'desc',
//                 },
//             },
//             },
//         });

//         if (!coupon) {
//             throw new Error('Coupon not found');
//         }

//         // Calculate total discount value
//         let totalDiscount = 0;
//         if (coupon.discountType === 'PERCENTAGE') {
//             // For percentage coupons, we need transaction amounts to calculate
//             totalDiscount = coupon.usages.reduce((total, usage) => {
//             if (usage.transaction) {
//                 return total + (Number(usage.transaction.amount) * coupon.discountValue) / 100;
//             }
//             return total;
//             }, 0);
//         } else {
//             totalDiscount = coupon.usages.length * Number(coupon.discountValue);
//         }

//         return {
//             coupon,
//             usageCount: coupon._count.usages,
//             totalDiscount,
//             usageStats: {
//             today: coupon.usages.filter(usage => {
//                 const today = new Date();
//                 const usageDate = new Date(usage.usedAt);
//                 return usageDate.toDateString() === today.toDateString();
//             }).length,
//             thisWeek: coupon.usages.filter(usage => {
//                 const now = new Date();
//                 const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//                 return new Date(usage.usedAt) >= weekAgo;
//             }).length,
//             thisMonth: coupon.usages.filter(usage => {
//                 const now = new Date();
//                 const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
//                 return new Date(usage.usedAt) >= monthAgo;
//             }).length,
//             },
//         };
//         } catch (error) {
//         console.error('Error getting coupon stats:', error);
//         throw error;
//         }
//     }

//     async getUserCouponUsage(userId) {
//         try {
//         const couponUsages = await prisma.couponUsage.findMany({
//             where: { userId },
//             include: {
//             coupon: {
//                 select: {
//                 id: true,
//                 code: true,
//                 discountType: true,
//                 discountValue: true,
//                 },
//             },
//             transaction: {
//                 select: {
//                 id: true,
//                 amount: true,
//                 status: true,
//                 createdAt: true,
//                 },
//             },
//             },
//             orderBy: {
//             usedAt: 'desc',
//             },
//         });

//         return couponUsages;
//         } catch (error) {
//         console.error('Error getting user coupon usage:', error);
//         throw error;
//         }
//     }
// }

// export default new CouponService();

import prisma from '../config/database.js';

class CouponService {
    
  async createCoupon(couponData) {
    try {
      // Validate dates
      const validFrom = new Date(couponData.validFrom);
      const validUntil = new Date(couponData.validUntil);
      
      if (validUntil <= validFrom) {
        throw new Error('Valid until date must be after valid from date');
      }

      if (couponData.discountType === 'PERCENTAGE' && parseFloat(couponData.discountValue) > 100) {
        throw new Error('Discount percentage cannot exceed 100%');
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: couponData.code.toUpperCase(),
          discountType: couponData.discountType,
          discountValue: parseFloat(couponData.discountValue),
          validFrom,
          validUntil,
          usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : null,
          applicableCourses: couponData.applicableCourses && couponData.applicableCourses.length > 0 
            ? couponData.applicableCourses 
            : null,
          isActive: couponData.isActive !== undefined ? couponData.isActive : true,
        },
      });

      return coupon;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  }

  async validateCoupon(code, userId, cartItems = []) {
    try {
        
        const coupon = await prisma.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (!coupon) {
        throw new Error('Invalid or expired coupon');
      }

      if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
      }

      const userUsage = await prisma.couponUsage.findFirst({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsage) {
        throw new Error('You have already used this coupon');
      }

      if (coupon.applicableCourses && 
            Array.isArray(coupon.applicableCourses) && 
            coupon.applicableCourses.length > 0 &&
            cartItems.length > 0) {
        const applicableCourseIds = coupon.applicableCourses;
        const cartCourseIds = cartItems.map(item => item.courseId);
        
        const hasApplicableCourse = cartCourseIds.some(courseId => 
          applicableCourseIds.includes(courseId)
        );

        if (!hasApplicableCourse) {
          throw new Error('Coupon not applicable to any course in your cart');
        }
      }

      return {
        valid: true,
        coupon,
        message: 'Coupon is valid',
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        message: error.message,
        coupon: null,
      };
    }
  }

  async applyCouponToCart(code, userId, cartItems, cartTotal) {
    try {
      // Validate coupon
      const validation = await this.validateCoupon(code, userId, cartItems);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const coupon = validation.coupon;

      // Calculate discount
      let discountAmount = 0;
      
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === 'FIXED') {
        discountAmount = Number(coupon.discountValue);
        
        // Ensure discount doesn't exceed cart total
        if (discountAmount > cartTotal) {
          discountAmount = cartTotal;
        }
      }

      // Apply applicable courses logic ONLY if applicableCourses exists and has items
      if (coupon.applicableCourses && 
          Array.isArray(coupon.applicableCourses) && 
          coupon.applicableCourses.length > 0 && 
          cartItems.length > 0) {
        
        const applicableCourseIds = coupon.applicableCourses;
        const applicableCartItems = cartItems.filter(item => 
          applicableCourseIds.includes(item.courseId)
        );

        if (applicableCartItems.length === 0) {
          throw new Error('Coupon not applicable to any course in your cart');
        }

        // Calculate subtotal for applicable courses only
        const applicableSubtotal = applicableCartItems.reduce((total, item) => {
          return total + Number(item.currentPrice || item.price);
        }, 0);

        // Recalculate discount based on applicable courses only
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (applicableSubtotal * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'FIXED') {
          discountAmount = Number(coupon.discountValue);
          
          // Ensure discount doesn't exceed applicable subtotal
          if (discountAmount > applicableSubtotal) {
            discountAmount = applicableSubtotal;
          }
        }
      }
      // If applicableCourses is empty/null, apply discount to entire cart

      return {
        success: true,
        coupon,
        discountAmount,
        finalTotal: cartTotal - discountAmount,
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        success: false,
        message: error.message,
        discountAmount: 0,
        finalTotal: cartTotal,
      };
    }
  }

  async useCoupon(couponId, userId, transactionId) {
    try {
      // Check if coupon exists and is still valid
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon || !coupon.isActive) {
        throw new Error('Invalid coupon');
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
      }

      // Create coupon usage record
      const couponUsage = await prisma.couponUsage.create({
        data: {
          couponId,
          userId,
          transactionId,
        },
      });

      // Increment times used
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          timesUsed: { increment: 1 },
        },
      });

      return couponUsage;
    } catch (error) {
      console.error('Error using coupon:', error);
      throw error;
    }
  }

  async getAllCoupons(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      
      if (filters.search) {
        whereClause.OR = [
          { code: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const coupons = await prisma.coupon.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { usages: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return coupons;
    } catch (error) {
      console.error('Error getting coupons:', error);
      throw error;
    }
  }

  async getCouponById(id) {
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: {
          usages: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              transaction: {
                select: {
                  id: true,
                  amount: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      return coupon;
    } catch (error) {
      console.error('Error getting coupon:', error);
      throw error;
    }
  }

  async updateCoupon(id, updateData) {
    try {
      // Prepare the data object with proper formatting
      const dataToUpdate = {
        ...updateData
      };

      // Convert date strings to Date objects if provided
      if (updateData.validFrom) {
        dataToUpdate.validFrom = new Date(updateData.validFrom);
      }
      
      if (updateData.validUntil) {
        dataToUpdate.validUntil = new Date(updateData.validUntil);
      }

      // Validate dates if both are provided
      if (dataToUpdate.validFrom && dataToUpdate.validUntil) {
        if (dataToUpdate.validUntil <= dataToUpdate.validFrom) {
          throw new Error('Valid until date must be after valid from date');
        }
      }

      // Convert discountValue to number if it's a string
      if (updateData.discountValue !== undefined) {
        dataToUpdate.discountValue = parseFloat(updateData.discountValue);
      }

      // Validate discount percentage
      if (updateData.discountType === 'PERCENTAGE' && dataToUpdate.discountValue > 100) {
        throw new Error('Discount percentage cannot exceed 100%');
      }

      // Handle usageLimit - convert empty string to null
      if (updateData.usageLimit === '' || updateData.usageLimit === null) {
        dataToUpdate.usageLimit = null;
      } else if (updateData.usageLimit !== undefined) {
        dataToUpdate.usageLimit = parseInt(updateData.usageLimit);
      }

      // Handle applicableCourses - ensure it's an array or null
      if (updateData.applicableCourses !== undefined) {
        if (Array.isArray(updateData.applicableCourses) && updateData.applicableCourses.length === 0) {
          dataToUpdate.applicableCourses = null;
        } else {
          dataToUpdate.applicableCourses = updateData.applicableCourses;
        }
      }

      const coupon = await prisma.coupon.update({
        where: { id },
        data: dataToUpdate,
      });

      return coupon;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  }

  async deleteCoupon(id) {
    try {
      // Check if coupon has been used
      const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: {
          _count: {
            select: { usages: true },
          },
        },
      });

      if (coupon._count.usages > 0) {
        throw new Error('Cannot delete coupon that has been used');
      }

      await prisma.coupon.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }

  async getCouponUsageStats(couponId) {
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
        include: {
          _count: {
            select: { usages: true },
          },
          usages: {
            select: {
              usedAt: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
              transaction: {
                select: {
                  amount: true,
                  status: true,
                },
              },
            },
            orderBy: {
              usedAt: 'desc',
            },
          },
        },
      });

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Calculate total discount value
      let totalDiscount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        // For percentage coupons, we need transaction amounts to calculate
        totalDiscount = coupon.usages.reduce((total, usage) => {
          if (usage.transaction) {
            return total + (Number(usage.transaction.amount) * coupon.discountValue) / 100;
          }
          return total;
        }, 0);
      } else {
        totalDiscount = coupon.usages.length * Number(coupon.discountValue);
      }

      return {
        coupon,
        usageCount: coupon._count.usages,
        totalDiscount,
        usageStats: {
          today: coupon.usages.filter(usage => {
            const today = new Date();
            const usageDate = new Date(usage.usedAt);
            return usageDate.toDateString() === today.toDateString();
          }).length,
          thisWeek: coupon.usages.filter(usage => {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return new Date(usage.usedAt) >= weekAgo;
          }).length,
          thisMonth: coupon.usages.filter(usage => {
            const now = new Date();
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return new Date(usage.usedAt) >= monthAgo;
          }).length,
        },
      };
    } catch (error) {
      console.error('Error getting coupon stats:', error);
      throw error;
    }
  }

  async getUserCouponUsage(userId) {
    try {
      const couponUsages = await prisma.couponUsage.findMany({
        where: { userId },
        include: {
          coupon: {
            select: {
              id: true,
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
          transaction: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          usedAt: 'desc',
        },
      });

      return couponUsages;
    } catch (error) {
      console.error('Error getting user coupon usage:', error);
      throw error;
    }
  }
}

export default new CouponService();