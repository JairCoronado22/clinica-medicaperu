const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { findClosestUser } = require('../utils/face');
require('dotenv').config();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, telefono, faceDescriptor } = req.body;
    // Validaciones básicas
    if (!username || !password || !role || !telefono) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    // Verificar si el usuario ya existe
    const existing = await User.findByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
    const newUser = await User.create({ username, password, role, telefono, faceDescriptor });
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login con contraseña
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, telefono: user.telefono } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login con biometría facial
router.post('/login-face', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    if (!faceDescriptor) return res.status(400).json({ error: 'Descriptor facial requerido' });

    const users = await User.getAllUsers();
    const result = findClosestUser(users, faceDescriptor);
    if (!result) {
      return res.status(401).json({ error: 'Rostro no reconocido' });
    }
    const user = result.user;
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, telefono: user.telefono } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;