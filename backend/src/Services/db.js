const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Pacientes
async function getPatients() {
  const { rows } = await pool.query('SELECT * FROM pacientes');
  return rows;
}

async function getPatientById(id) {
  const { rows } = await pool.query('SELECT * FROM pacientes WHERE id = $1', [id]);
  return rows[0];
}

async function createPatient(patient) {
  const { id, nombre, telefono, email, foto_url, descriptor_facial, fecha_nacimiento } = patient;
  const { rows } = await pool.query(
    'INSERT INTO pacientes (nombre, telefono, email, foto_url, descriptor_facial, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [nombre, telefono, email, foto_url, descriptor_facial, fecha_nacimiento]
  );
  return rows[0];
}

async function updatePatient(id, data) {
  const { rows } = await pool.query(
    'UPDATE pacientes SET nombre = $1, telefono = $2, email = $3, foto_url = $4, descriptor_facial = $5, fecha_nacimiento = $6 WHERE id = $7 RETURNING *',
    [data.nombre, data.telefono, data.email, data.foto_url, data.descriptor_facial, data.fecha_nacimiento, id]
  );
  return rows[0];
}

async function deletePatient(id) {
  await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
}

// Doctores
async function getDoctors() {
  const { rows } = await pool.query('SELECT * FROM doctores');
  return rows;
}

async function getDoctorById(id) {
  const { rows } = await pool.query('SELECT * FROM doctores WHERE id = $1', [id]);
  return rows[0];
}

async function createDoctor(doctor) {
  const { id, nombre, especialidad, telefono, email, foto_url, descriptor_facial, extension_sip, password_hash } = doctor;
  const { rows } = await pool.query(
    'INSERT INTO doctores (nombre, especialidad, telefono, email, foto_url, descriptor_facial, extension_sip, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [nombre, especialidad, telefono, email, foto_url, descriptor_facial, extension_sip, password_hash]
  );
  return rows[0];
}

async function updateDoctor(id, data) {
  const { rows } = await pool.query(
    'UPDATE doctores SET nombre = $1, especialidad = $2, telefono = $3, email = $4, foto_url = $5, descriptor_facial = $6, extension_sip = $7, password_hash = $8 WHERE id = $9 RETURNING *',
    [data.nombre, data.especialidad, data.telefono, data.email, data.foto_url, data.descriptor_facial, data.extension_sip, data.password_hash, id]
  );
  return rows[0];
}

async function deleteDoctor(id) {
  await pool.query('DELETE FROM doctores WHERE id = $1', [id]);
}

// Citas y otros servicios...
module.exports = {
  getPatients, getPatientById, createPatient, updatePatient, deletePatient,
  getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor,
};