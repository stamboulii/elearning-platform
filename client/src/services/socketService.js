import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  if (typeof window === 'undefined') return null;

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    query: { userId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    extraHeaders: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  socket.on('connect', () => {
    socket.emit('join', userId);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
