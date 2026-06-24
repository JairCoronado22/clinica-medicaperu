const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { initSocket } = require('./src/config/socket');
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patients');
const callRoutes = require('./src/routes/calls');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', callRoutes); // /api/llamada-entrante y /api/click-to-call

// Inicializar Socket.io
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});