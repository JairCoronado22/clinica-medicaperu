const express = require('express');
const router = express.Router();
const { makeCall } = require('../Services/asterisk');

router.post('/click-to-call', async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    await makeCall(phoneNumber);
    res.status(200).json({ message: 'Llamada iniciada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar la llamada' });
  }
});

module.exports = router;