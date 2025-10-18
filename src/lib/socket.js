import { io } from 'socket.io-client';
import { mongodbService } from './mongodb';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const API_URL = (import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3002').replace(/\/$/, '');
  const token = mongodbService.token;
  if (!token) return null;
  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}



























