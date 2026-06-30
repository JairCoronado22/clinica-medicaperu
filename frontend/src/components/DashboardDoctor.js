import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  const [citas, setCitas] = useState([]);
  const [showCitaForm, setShowCitaForm] = useState(false);
  const [newCita, setNewCita] = useState({ paciente_id: '', doctor_id: user?.id, fecha: '', motivo: '' });
  const [patients, setPatients] = useState([]);
  const [citasCount, setCitasCount] = useState(0);

  useEffect(() => {
    socket.on('llamada-entrante', (data) => {
      setIncomingCall(data);
    });
    return () => socket.off('llamada-entrante');
  }, []);

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const loadCitas = () => {
    api.get('/citas').then(r => {
      setCitas(r.data);
      setCitasCount(r.data.filter(c => c.estado === 'pendiente').length);
    }).catch(() => {});
  };

  useEffect(() => { loadCitas(); }, []);

  const handlePatientsLoaded = (count) => setPatientsCount(count);

  const handleCreateCita = async (e) => {
    e.preventDefault();
    try {
      await api.post('/citas', newCita);
      setShowCitaForm(false);
      setNewCita({ paciente_id: '', doctor_id: user?.id, fecha: '', motivo: '' });
      loadCitas();
    } catch (err) {
      alert('Error al crear cita: ' + (err.response?.data?.error || err.message));
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="app-container">
      <div className="header-actions">
        <span style={{ fontWeight: 500 }}>👨‍⚕️ Dr. {user?.username}</span>
        <button onClick={logout} className="btn-secondary">Cerrar sesión</button>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Panel del Doctor</h2>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="number">{patientsCount}</div>
          <div className="label">Pacientes registrados</div>
        </div>
        <div className="metric-card">
          <div className="number">{citasCount}</div>
          <div className="label">Citas pendientes</div>
        </div>
        <div className="metric-card">
          <div className="number">{citas.length}</div>
          <div className="label">Total citas</div>
        </div>
      </div>

      <div className="card">
        <ClickToCall />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>🧪 Pruebas</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
          Simula una llamada entrante de paciente para probar la notificación en tiempo real.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={async () => {
            try {
              await api.post('/calls/simular-llamada', { paciente_id: 2 });
              alert('Llamada simulada de Juan');
            } catch (err) {
              alert('Error: ' + (err.response?.data?.error || err.message));
            }
          }}>
            📞 Simular llamada de Juan
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>📅 Citas</h3>
          <button className="btn-primary" onClick={() => setShowCitaForm(!showCitaForm)}>
            + Nueva cita
          </button>
        </div>
        {showCitaForm && (
          <form onSubmit={handleCreateCita} style={{ marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select required value={newCita.paciente_id} onChange={e => setNewCita({ ...newCita, paciente_id: e.target.value })}>
                <option value="">Seleccionar paciente</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.username} ({p.telefono})</option>)}
              </select>
              <input type="datetime-local" required value={newCita.fecha} onChange={e => setNewCita({ ...newCita, fecha: e.target.value })} />
              <input type="text" placeholder="Motivo" value={newCita.motivo} onChange={e => setNewCita({ ...newCita, motivo: e.target.value })} style={{ gridColumn: '1 / -1' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>Guardar cita</button>
          </form>
        )}
        {citas.length === 0 ? (
          <p style={{ color: '#64748b' }}>No hay citas registradas.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>Paciente</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Motivo</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}>{c.paciente_nombre || '—'}</td>
                  <td style={tdStyle}>{new Date(c.fecha).toLocaleString()}</td>
                  <td style={tdStyle}>{c.motivo || '—'}</td>
                  <td style={tdStyle}><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
            onSuccess={() => window.location.reload()}
          />
        )}
        <PatientList onEdit={(patient) => { setSelectedPatient(patient); setShowForm(true); }} onLoad={handlePatientsLoaded} />
      </div>

      {incomingCall && (
        <CallNotification data={incomingCall} onClose={() => setIncomingCall(null)} />
      )}
    </div>
  );
};

const thStyle = { textAlign: 'left', padding: '10px 8px', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' };
const tdStyle = { padding: '10px 8px', fontSize: '0.9rem' };

export default DashboardDoctor;