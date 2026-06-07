import prisma from '../config/database.js';

export const createNotification = async ({ userId, type, title, message, data = null }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
      },
    });

    const io = global.io;
    if (io) {
      io.to(userId).emit('notification:new', notification);

      const unreadCount = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      io.to(userId).emit('notification:unread_count', unreadCount);
    }
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

export const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  if (global.io) {
    const unreadCount = await getUnreadCount(userId);
    global.io.to(userId).emit('notification:unread_count', unreadCount);
  }

  return notification;
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  if (global.io) {
    global.io.to(userId).emit('notification:unread_count', 0);
  }

  return true;
};

export const deleteNotification = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });
  const wasUnread = notification && !notification.isRead;

  await prisma.notification.delete({
    where: { id },
  });

  if (wasUnread && global.io) {
    const unreadCount = await getUnreadCount(userId);
    global.io.to(userId).emit('notification:unread_count', unreadCount);
  }

  return true;
};