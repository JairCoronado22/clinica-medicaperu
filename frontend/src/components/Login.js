import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FaceCapture from './FaceCapture';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const handleFaceLogin = async (descriptor) => {
    try {
      const res = await api.post('/auth/login-face', { faceDescriptor: descriptor });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Error en reconocimiento facial');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '32px', animation: 'fadeInUp 0.6s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '2.5rem' }}>🏥</span>
          <h2 style={{ marginTop: '8px', fontSize: '1.8rem' }}>Bienvenido de nuevo</h2>
          <p style={{ color: '#64748b' }}>Inicia sesión para acceder a tu cuenta</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          <button
            className={mode === 'password' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMode('password')}
            style={{ flex: 1 }}
          >
            🔑 Contraseña
          </button>
          <button
            className={mode === 'face' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMode('face')}
            style={{ flex: 1 }}
          >
            😀 Facial
          </button>
        </div>

        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }}>👤</span>
              <input
                type="text"
                placeholder="Usuario"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }}>🔒</span>
              <input
                type="password"
                placeholder="Contraseña"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
              Iniciar sesión
            </button>
          </form>
        )}

        {mode === 'face' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', color: '#475569' }}>Mira a la cámara y presiona "Capturar"</p>
            <FaceCapture onCapture={handleFaceLogin} buttonText="Iniciar sesión con rostro" />
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          ¿No tienes cuenta? <a href="/register" className="link">Regístrate aquí</a>
        </div>
      </div>
    </div>
  );
};

export default Login;