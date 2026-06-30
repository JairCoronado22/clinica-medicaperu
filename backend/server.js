const express = require('express');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const { initSocket } = require('./src/config/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Inicializar Socket.io (instancia UNICA)
const io = initSocket(server);
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3001', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rutas
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/patients', require('./src/routes/patients'));
app.use('/api/calls', require('./src/routes/calls'));
app.use('/api/citas', require('./src/routes/citas'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] ✅ Backend corriendo en http://localhost:${PORT}`);
});

// ─── Eventos de ciclo de vida ──────────────────────────────────────────────

function logShutdown(reason) {
  console.log(`[${new Date().toISOString()}] ⛔ Servidor detenido: ${reason}`);
  process.exit(0);
}

process.on('SIGTERM', () => logShutdown('SIGTERM'));
process.on('SIGINT', () => logShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error(`[${new Date().toISOString()}] 🔴 Error no capturado:`, err.message);
  logShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error(`[${new Date().toISOString()}] 🟡 Promesa rechazada:`, reason);
});