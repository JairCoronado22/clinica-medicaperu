import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PatientList = ({ onEdit, onLoad }) => {
  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
      if (onLoad) onLoad(res.data.length);
    } catch (err) {
      alert('Error al cargar pacientes');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este paciente?')) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div>
      {patients.length === 0 ? (
        <p style={{ color: '#64748b' }}>No hay pacientes registrados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {patients.map(p => (
            <li key={p.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <strong>{p.username}</strong> <span style={{ color: '#64748b', marginLeft: '8px' }}>{p.telefono}</span>
              </div>
              <div>
                <button className="btn-secondary" style={{ marginRight: '8px' }} onClick={() => onEdit(p)}>Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientList;