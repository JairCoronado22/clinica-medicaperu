const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Crear usuario (registro)
  static async create({ username, password, role, telefono, faceDescriptor }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, role, telefono, face_descriptor)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, role, telefono
    `;
    const values = [username, hashedPassword, role, telefono, JSON.stringify(faceDescriptor)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Buscar por username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Buscar por número de teléfono
  static async findByTelefono(telefono) {
    const query = 'SELECT * FROM users WHERE telefono = $1';
    const result = await pool.query(query, [telefono]);
    return result.rows[0];
  }

  // Obtener todos los pacientes (solo rol patient)
  static async getAllPatients() {
    const query = 'SELECT id, username, telefono, role FROM users WHERE role = $1';
    const result = await pool.query(query, ['patient']);
    return result.rows;
  }

  // Actualizar datos de paciente (solo algunos campos)
  static async updatePatient(id, { username, telefono, faceDescriptor }) {
    const fields = [];
    const values = [];
    let idx = 1;
    if (username) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (telefono) {
      fields.push(`telefono = $${idx++}`);
      values.push(telefono);
    }
    if (faceDescriptor) {
      fields.push(`face_descriptor = $${idx++}`);
      values.push(JSON.stringify(faceDescriptor));
    }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, username, telefono, role
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar paciente (solo si es patient)
  static async deletePatient(id) {
    const query = 'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id';
    const result = await pool.query(query, [id, 'patient']);
    return result.rows[0];
  }

  // Obtener todos los usuarios (para comparación facial)
  static async getAllUsers() {
    const query = 'SELECT id, username, role, telefono, face_descriptor FROM users';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = User;