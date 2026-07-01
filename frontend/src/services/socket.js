import { io } from 'socket.io-client';

const socket = io({
  transports: ['websocket', 'polling'],
});

export const joinRoom = (userId) => {
  socket.emit('join', userId);
};

export default socket;
