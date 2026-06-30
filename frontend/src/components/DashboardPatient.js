import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CallNotification from './CallNotification';
import socket from '../services/socket';

const DashboardPatient = () => {
  const { user, logout } = useAuth();
  const [citas, setCitas] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    socket.on('llamada-entrante', (data) => setIncomingCall(data));
    return () => socket.off('llamada-entrante');
  }, []);

  useEffect(() => {
    api.get('/citas').then(r => setCitas(r.data)).catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <div className="header-actions">
        <span style={{ fontWeight: 500 }}>🧑‍⚕️ {user?.username}</span>
        <button onClick={logout} className="btn-secondary">Cerrar sesion</button>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Mi Perfil</h2>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="number">{user?.username}</div>
          <div className="label">Usuario</div>
        </div>
        <div className="metric-card">
          <div className="number">{user?.telefono || '—'}</div>
          <div className="label">Telefono</div>
        </div>
        <div className="metric-card">
          <div className="number">{citas.length}</div>
          <div className="label">Citas</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📅 Mis Citas</h3>
        {citas.length === 0 ? (
          <p style={{ color: '#64748b' }}>No tienes citas programadas.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {citas.map(c => (
              <li key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <strong>{new Date(c.fecha).toLocaleString()}</strong> — {c.motivo}
              </li>
            ))}
          </ul>
        )}
      </div>

      {incomingCall && (
        <CallNotification data={incomingCall} onClose={() => setIncomingCall(null)} />
      )}
    </div>
  );
};

export default DashboardPatient;