import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPatient = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <div className="header-actions">
        <span style={{ fontWeight: 500 }}>🧑‍⚕️ {user?.username}</span>
        <button onClick={logout} className="btn-secondary">Cerrar sesión</button>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h2>Mi perfil</h2>
        <p><strong>Usuario:</strong> {user?.username}</p>
        <p><strong>Teléfono:</strong> {user?.telefono}</p>
        <p><strong>Rol:</strong> Paciente</p>
        <hr style={{ margin: '16px 0' }} />
        <p style={{ color: '#64748b' }}>Aquí podrás ver tu historial clínico y próximas citas próximamente.</p>
      </div>
    </div>
  );
};

export default DashboardPatient;