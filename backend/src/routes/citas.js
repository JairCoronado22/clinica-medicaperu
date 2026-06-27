const express = require('express');
const router = express.Router();
const { getCitas, getCitaById, createCita, updateCita, deleteCita } = require('../Services/db');

router.get('/', async (req, res) => {
  const citas = await getCitas();
  res.json(citas);
});

router.get('/:id', async (req, res) => {
  const cita = await getCitaById(req.params.id);
  res.json(cita);
});

router.post('/', async (req, res) => {
  const newCita = await createCita(req.body);
  res.status(201).json(newCita);
});

router.put('/:id', async (req, res) => {
  const updatedCita = await updateCita(req.params.id, req.body);
  res.json(updatedCita);
});

router.delete('/:id', async (req, res) => {
  await deleteCita(req.params.id);
  res.status(204).send();
});

module.exports = router;