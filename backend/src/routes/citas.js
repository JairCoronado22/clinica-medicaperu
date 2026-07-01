const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'doctor') {
      result = await pool.query(
        'SELECT c.*, u.username AS paciente_nombre, u.telefono AS paciente_telefono FROM citas c LEFT JOIN users u ON c.paciente_id = u.id ORDER BY c.fecha DESC'
      );
    } else {
      result = await pool.query(
        'SELECT c.*, u.username AS doctor_nombre FROM citas c LEFT JOIN users u ON c.doctor_id = u.id WHERE c.paciente_id = $1 ORDER BY c.fecha DESC',
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citas WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener cita:', err);
    res.status(500).json({ error: 'Error al obtener cita' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { paciente_id, doctor_id, fecha, motivo } = req.body;
    if (!paciente_id || !doctor_id || !fecha) {
      return res.status(400).json({ error: 'paciente_id, doctor_id y fecha son requeridos' });
    }
    const result = await pool.query(
      'INSERT INTO citas (paciente_id, doctor_id, fecha, motivo) VALUES ($1, $2, $3, $4) RETURNING *',
      [paciente_id, doctor_id, fecha, motivo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cita:', err);
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { fecha, motivo, estado } = req.body;
    const result = await pool.query(
      'UPDATE citas SET fecha = COALESCE($1, fecha), motivo = COALESCE($2, motivo), estado = COALESCE($3, estado) WHERE id = $4 RETURNING *',
      [fecha, motivo, estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cita:', err);
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM citas WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

module.exports = router;
