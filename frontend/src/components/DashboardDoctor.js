import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import CallNotification from './CallNotification';
import ClickToCall from './ClickToCall';
import socket from '../services/socket';

const DashboardDoctor = () => {
  const { user, logout } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [patientsCount, setPatientsCount] = useState(0);

  useEffect(() => {
    socket.on('llamada-entrante', (data) => {
      setIncomingCall(data);
    });
    return () => socket.off('llamada-entrante');
  }, []);

  // Actualizar contador desde PatientList (usando callback)
  const handlePatientsLoaded = (count) => setPatientsCount(count);

  return (
    <div className="app-container">
      <div className="header-actions">
        <span style={{ fontWeight: 500 }}>👨‍⚕️ Dr. {user?.username}</span>
        <button onClick={logout} className="btn-secondary">Cerrar sesión</button>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Panel del Doctor</h2>

      {/* Métricas */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="number">{patientsCount}</div>
          <div className="label">Pacientes registrados</div>
        </div>
        <div className="metric-card">
          <div className="number">0</div>
          <div className="label">Llamadas hoy</div>
        </div>
        <div className="metric-card">
          <div className="number">0</div>
          <div className="label">Citas pendientes</div>
        </div>
      </div>

      {/* Click to Call */}
      <div className="card">
        <ClickToCall />
      </div>

      {/* Gestión de pacientes */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Pacientes</h3>
          <button className="btn-primary" onClick={() => { setSelectedPatient(null); setShowForm(true); }}>
            + Nuevo paciente
          </button>
        </div>
        {showForm && (
          <PatientForm
            patient={selectedPatient}
            onClose={() => { setShowForm(false); setSelectedPatient(null); }}
            onSuccess={() => { /* refrescar lista */ window.location.reload(); }}
          />
        )}
        <PatientList onEdit={(patient) => { setSelectedPatient(patient); setShowForm(true); }} onLoad={handlePatientsLoaded} />
      </div>

      {/* Notificación de llamada entrante */}
      {incomingCall && (
        <CallNotification data={incomingCall} onClose={() => setIncomingCall(null)} />
      )}
    </div>
  );
};

export default DashboardDoctor;