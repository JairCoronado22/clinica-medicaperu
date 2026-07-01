const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { findClosestUser } = require('../utils/face');

// LOGIN por contrasena
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contrasena requeridos' });
    }
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Credenciales invalidas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales invalidas' });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, telefono: user.telefono }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
});

// LOGIN facial
router.post('/login-face', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ error: 'Descriptor facial requerido' });
    }
    const allUsers = await User.getAllUsers();
    const match = findClosestUser(allUsers, faceDescriptor, 0.6);
    if (!match) return res.status(401).json({ error: 'No se encontro coincidencia facial' });
    const token = jwt.sign(
      { id: match.user.id, username: match.user.username, role: match.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: match.user.id, username: match.user.username, role: match.user.role, telefono: match.user.telefono }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en reconocimiento facial' });
  }
});

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, telefono, faceDescriptor } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Campos requeridos: username, password, role' });
    }
    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ error: 'El usuario ya existe' });
    const newUser = await User.create({ username, password, role, telefono, faceDescriptor });
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.status(201).json({
      token,
      user: { id: newUser.id, username: newUser.username, role: newUser.role, telefono: newUser.telefono }
    });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'El telefono ya esta registrado' });
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;