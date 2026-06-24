const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const User = require('../models/User');
const { getIO } = require('../config/socket');

// Endpoint que recibe notificación de Asterisk (llamada entrante)
router.post('/llamada-entrante', async (req, res) => {
  try {
    const { numero } = req.body;
    if (!numero) return res.status(400).json({ error: 'Número requerido' });

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

// Click to Call
router.post('/click-to-call', async (req, res) => {
  try {
    const { numero } = req.body;
    if (!numero) return res.status(400).json({ error: 'Número requerido' });

    // Ejecutar comando en Asterisk para realizar llamada
    // Asumimos que el contexto default y la extensión origen es 1000 (doctor)
    const command = `sudo asterisk -rx "channel originate SIP/1000 extension ${numero}@default"`;
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