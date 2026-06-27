// server.js
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');
const AsteriskAmi = require('asterisk-ami'); // ✅ Sin destructuring

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./src/routes/auth');
const pacienteRoutes = require('./src/routes/pacientes');
const doctorRoutes = require('./src/routes/doctores');
const citaRoutes = require('./src/routes/citas');
const llamadaRoutes = require('./src/routes/llamadas');

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/doctores', doctorRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/llamadas', llamadaRoutes);

// Conexión a PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Conexión a Asterisk (AMI)
const amiClient = new AsteriskAmi({  // ✅ Sin destructuring
  host: process.env.AMI_HOST,
  port: process.env.AMI_PORT,
  login: process.env.AMI_USER,        // ✅ 'username' → 'login'
  password: process.env.AMI_PASSWORD,
});

amiClient.connect();                  // ✅ Conectar explícitamente

amiClient.on('ami_data', (data) => { // ✅ 'NewChannel' → 'ami_data'
  if (data.event === 'Newchannel') {
    io.emit('llamada_entrante', { caller_id: data.calleridnum });
  }
});

// Iniciar servidor
server.listen(process.env.PORT, () => {
  console.log(`Backend en http://localhost:${process.env.PORT}`);
}); // ✅ Eliminar el '2' al final
