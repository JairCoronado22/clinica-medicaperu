const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// Obtener lista de pacientes (doctor/admin)
router.get('/', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const patients = await User.getAllPatients();
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// Crear paciente (doctor/admin)
router.post('/', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { username, password, telefono, faceDescriptor } = req.body;
    if (!username || !password || !telefono) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
    const newPatient = await User.create({
      username,
      password,
      role: 'patient',
      telefono,
      faceDescriptor: faceDescriptor || null,
    });
    res.status(201).json(newPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
});

// Editar paciente (doctor/admin)
router.put('/:id', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, telefono, faceDescriptor } = req.body;
    const updated = await User.updatePatient(id, { username, telefono, faceDescriptor });
    if (!updated) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// Eliminar paciente (doctor/admin)
router.delete('/:id', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.deletePatient(id);
    if (!deleted) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;