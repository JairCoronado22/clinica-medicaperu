const { Server } = require('socket.io');

let io;
const userSockets = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, cb) => cb(null, true),
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id} (IP: ${socket.handshake.address})`);

    socket.onAny((event, ...args) => {
      console.log(`📨 Evento recibido: ${event} de ${socket.id}`, JSON.stringify(args).slice(0,200));
    });

    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      userSockets[userId] = socket.id;
      console.log(`✅ Usuario ${userId} unido a sala (socket ${socket.id})`);
      console.log(`📊 Salas actuales:`, Object.keys(userSockets));
    });

    socket.on('call-user', ({ targetUserId, offer, callerName }) => {
      console.log(`🔔 Llamada de ${socket.id} a usuario ${targetUserId}`);
      const targetSocketId = userSockets[targetUserId];
      if (targetSocketId) {
        console.log(`✅ Enviando incoming-call a socket ${targetSocketId}`);
        io.to(targetSocketId).emit('incoming-call', {
          from: socket.id,
          offer,
          callerName,
        });
      } else {
        console.log(`❌ Paciente ${targetUserId} NO CONECTADO`);
        socket.emit('call-error', { message: 'Paciente no conectado' });
      }
    });

    socket.on('accept-call', ({ targetSocketId, answer }) => {
      console.log(`✅ Llamada aceptada, reenviando a ${targetSocketId}`);
      io.to(targetSocketId).emit('call-accepted', { answer });
    });

    socket.on('ice-candidate', ({ targetSocketId, targetUserId, candidate }) => {
      const target = targetSocketId || userSockets[targetUserId];
      if (target) {
        console.log(`🧊 ICE candidate: ${socket.id} -> ${target}`);
        io.to(target).emit('ice-candidate', { candidate });
      }
    });

    socket.on('end-call', ({ targetSocketId, targetUserId }) => {
      const target = targetSocketId || userSockets[targetUserId];
      if (target) {
        console.log(`🔚 End call: ${socket.id} -> ${target}`);
        io.to(target).emit('call-ended');
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
      for (const userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          delete userSockets[userId];
          console.log(`🧹 Limpiado userSockets[${userId}]`);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
};

module.exports = { initSocket, getIO };
