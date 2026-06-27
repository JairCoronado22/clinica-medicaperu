const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../Services/db');

router.get('/', async (req, res) => {
  const patients = await getPatients();
  res.json(patients);
});

router.get('/:id', async (req, res) => {
  const patient = await getPatientById(req.params.id);
  res.json(patient);
});

router.post('/', async (req, res) => {
  const newPatient = await createPatient(req.body);
  res.status(201).json(newPatient);
});

router.put('/:id', async (req, res) => {
  const updatedPatient = await updatePatient(req.params.id, req.body);
  res.json(updatedPatient);
});

router.delete('/:id', async (req, res) => {
  await deletePatient(req.params.id);
  res.status(204).send();
});

module.exports = router;