const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../Services/db');

router.get('/', async (req, res) => {
  const doctors = await getDoctors();
  res.json(doctors);
});

router.get('/:id', async (req, res) => {
  const doctor = await getDoctorById(req.params.id);
  res.json(doctor);
});

router.post('/', async (req, res) => {
  const newDoctor = await createDoctor(req.body);
  res.status(201).json(newDoctor);
});

router.put('/:id', async (req, res) => {
  const updatedDoctor = await updateDoctor(req.params.id, req.body);
  res.json(updatedDoctor);
});

router.delete('/:id', async (req, res) => {
  await deleteDoctor(req.params.id);
  res.status(204).send();
});

module.exports = router;