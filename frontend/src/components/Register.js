import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FaceCapture from './FaceCapture';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [telefono, setTelefono] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceDescriptor) {
      alert('Debes capturar tu rostro');
      return;
    }
    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        role,
        telefono,
        faceDescriptor,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Error en el registro');
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Registro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Teléfono (ej. 1000)"
            className="input-field"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
          <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="patient">Paciente</option>
            <option value="doctor">Doctor</option>
          </select>

          <div style={{ margin: '16px 0' }}>
            <FaceCapture onCapture={(desc) => setFaceDescriptor(desc)} buttonText="Capturar rostro" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;