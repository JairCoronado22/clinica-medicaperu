import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FaceCapture from './FaceCapture';

const PatientForm = ({ patient, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  useEffect(() => {
    if (patient) {
      setUsername(patient.username);
      setTelefono(patient.telefono);
    }
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (patient) {
        await api.put(`/patients/${patient.id}`, { username, telefono, faceDescriptor });
      } else {
        if (!password) {
          alert('Debes establecer una contraseña');
          return;
        }
        await api.post('/patients', { username, password, telefono, faceDescriptor });
      }
      onClose();
      if (onSuccess) onSuccess();
      window.location.reload(); // recargar lista
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
      <h3>{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {!patient && (
          <input
            type="password"
            placeholder="Contraseña"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Teléfono"
          className="input-field"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <div style={{ margin: '12px 0' }}>
          <FaceCapture onCapture={(desc) => setFaceDescriptor(desc)} buttonText="Capturar rostro" />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn-primary">Guardar</button>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;