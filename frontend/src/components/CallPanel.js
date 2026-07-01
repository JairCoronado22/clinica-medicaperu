import React, { useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  panel: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    minWidth: '320px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    margin: '0 auto 16px',
  },
  status: {
    color: '#22c55e',
    fontWeight: 600,
    marginBottom: '8px',
  },
  callerName: {
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '4px',
  },
  duration: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  btnHangup: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  btnAccept: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
  },
  btnReject: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    background: '#f59e0b',
  },
};

const CallPanel = ({ inCall, isCalling, callerName, onHangup }) => {
  const [muted, setMuted] = useState(false);

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.avatar}>👤</div>
        {isCalling ? (
          <>
            <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '8px' }}>📞 Llamando...</div>
            <div style={styles.callerName}>{callerName || 'Paciente'}</div>
            <div style={{ ...styles.duration, marginBottom: '24px' }}>Esperando respuesta...</div>
          </>
        ) : (
          <>
            <div style={styles.status}>🔵 En llamada</div>
            <div style={styles.callerName}>{callerName || 'Paciente'}</div>
            <div style={styles.duration}>En curso</div>
          </>
        )}
        <audio ref={el => { if (el) el.autoplay = true; }} hidden />
        <div>
          {!isCalling && (
            <button
              style={{ ...styles.btnHangup, ...(muted ? styles.muted : {}), marginRight: '16px' }}
              onClick={() => setMuted(!muted)}
              title={muted ? 'Activar micrófono' : 'Silenciar'}
            >
              {muted ? '🔇' : '🎤'}
            </button>
          )}
          <button style={styles.btnHangup} onClick={onHangup}>
            📞
          </button>
        </div>
      </div>
    </div>
  );
};

export const IncomingCallAlert = ({ callerName, onAccept, onReject }) => (
  <div style={styles.overlay}>
    <div style={styles.panel}>
      <div style={styles.avatar}>📞</div>
      <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '8px' }}>Llamada entrante</div>
      <div style={styles.callerName}>{callerName || 'Doctor'}</div>
      <div style={{ ...styles.duration, marginBottom: '24px' }}>¿Responder?</div>
      <div>
        <button style={styles.btnAccept} onClick={onAccept}>📞</button>
        <button style={styles.btnReject} onClick={onReject}>✕</button>
      </div>
    </div>
  </div>
);

export default CallPanel;
