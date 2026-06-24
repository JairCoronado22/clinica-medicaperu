import React, { useState } from 'react';
import api from '../services/api';

const ClickToCall = () => {
  const [numero, setNumero] = useState('');

  const handleCall = async () => {
    if (!numero) {
      alert('Ingresa un número');
      return;
    }
    try {
      await api.post('/click-to-call', { numero });
      alert('Llamada iniciada');
    } catch (err) {
      alert('Error al iniciar llamada');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Click to Call</h3>
      <input
        type="text"
        placeholder="Número a llamar (ej. 1001)"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      <button onClick={handleCall}>Llamar</button>
    </div>
  );
};

export default ClickToCall;