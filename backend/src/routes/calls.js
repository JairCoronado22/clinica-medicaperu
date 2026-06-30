const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const User = require('../models/User');
const { getIO } = require('../config/socket');

// Endpoint que recibe notificación de Asterisk (llamada entrante)
router.all('/llamada-entrante', async (req, res) => {
  console.log('📞 /llamada-entrante received:', req.method, req.query, req.body);
  try {
    const numero = req.query.numero || req.body?.numero;
    if (!numero) {
      console.log('❌ No numero provided');
      return res.status(400).json({ error: 'Número requerido' });
    }
    console.log('🔍 Looking up numero:', numero);

    // Buscar paciente por teléfono
    const user = await User.findByTelefono(numero);
    if (user) {
      // Emitir evento via socket al frontend
      const io = getIO();
      io.emit('llamada-entrante', {
        numero,
        paciente: {
          id: user.id,
          username: user.username,
          telefono: user.telefono,
          role: user.role,
        },
      });
      return res.json({ message: 'Notificación enviada', paciente: user });
    } else {
      // Número no registrado
      const io = getIO();
      io.emit('llamada-entrante', { numero, paciente: null });
      return res.json({ message: 'Número no registrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Simular llamada entrante (para pruebas) - recibe un numero de paciente
router.post('/simular-llamada', async (req, res) => {
  try {
    const { paciente_id } = req.body;
    if (!paciente_id) return res.status(400).json({ error: 'paciente_id requerido' });

    const user = await User.findById(paciente_id);
    if (!user) return res.status(404).json({ error: 'Paciente no encontrado' });

    const io = getIO();
    io.emit('llamada-entrante', {
      numero: user.telefono,
      paciente: {
        id: user.id,
        username: user.username,
        telefono: user.telefono,
        role: user.role,
      },
    });

    // También originar llamada real por Asterisk al doctor
    const { makeCall } = require('../Services/asterisk');
    makeCall({
      number: user.telefono,
      callerid: user.telefono,
      calleridName: user.username,
    });

    res.json({ message: 'Llamada simulada enviada', paciente: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Click to Call
router.post('/click-to-call', async (req, res) => {
  try {
    const { numero } = req.body;
    if (!numero) return res.status(400).json({ error: 'Número requerido' });

    // Ejecutar comando en Asterisk para realizar llamada
    // Asumimos que el contexto default y la extensión origen es 1000 (doctor)
    const command = `sudo asterisk -rx "channel originate PJSIP/1000 extension ${numero}@clinica"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar asterisk: ${error}`);
        return res.status(500).json({ error: 'Error al iniciar llamada' });
      }
      console.log(`Llamada iniciada: ${stdout}`);
    });
    res.json({ message: 'Llamada iniciada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;