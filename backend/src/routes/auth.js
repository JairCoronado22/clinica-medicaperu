const express = require('express');
const router = express.Router();
const { compareFaceDescriptor } = require('../Services/facial');
const jwt = require('jsonwebtoken');

router.post('/facial', async (req, res) => {
  const { descriptor } = req.body;
  try {
    const user = await compareFaceDescriptor(descriptor);
    if (user) {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user });
    } else {
      res.status(401).json({ error: 'No se encontró coincidencia' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

module.exports = router;