import React from 'react';

const CallNotification = ({ data, onClose }) => {
  const { numero, paciente } = data;
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#fff',
      border: '2px solid #007bff',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1000,
    }}>
      <h4>📞 Llamada entrante</h4>
      <p><strong>Número:</strong> {numero}</p>
      {paciente ? (
        <div>
          <p><strong>Paciente:</strong> {paciente.username}</p>
          <p><strong>Teléfono:</strong> {paciente.telefono}</p>
        </div>
      ) : (
        <p>Número no registrado</p>
      )}
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default CallNotification;