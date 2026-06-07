import { io } from 'socket.io-client';

export const connectSocket = (userId) => {
  if (typeof window === 'undefined') return null;
  
  const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    query: { userId },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    socket.emit('join', userId);
  });

  return socket;
};
