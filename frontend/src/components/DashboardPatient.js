import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CallNotification from './CallNotification';
import socket, { joinRoom } from '../services/socket';
import { IncomingCallAlert } from './CallPanel';

const DashboardPatient = () => {
  const { user, logout } = useAuth();
  const [citas, setCitas] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callerSocketId, setCallerSocketId] = useState(null);
  const [callerName, setCallerName] = useState('');
  const [callState, setCallState] = useState('idle');
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (user?.id) joinRoom(user.id);
  }, [user]);

  useEffect(() => {
    socket.on('llamada-entrante', (data) => setIncomingCall(data));
    socket.on('incoming-call', ({ from, offer, callerName: name }) => {
      setCallerSocketId(from);
      setIncomingOffer(offer);
      setCallerName(name || 'Doctor');
    });
    socket.on('call-ended', () => {
      hangupCall();
    });
    return () => {
      socket.off('llamada-entrante');
      socket.off('incoming-call');
      socket.off('call-ended');
    };
  }, []);

  const getLocalStream = async () => {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      alert('Error al acceder al micrófono');
      return null;
    }
  };

  const answerIncomingCall = async () => {
    const stream = await getLocalStream();
    if (!stream) return;
    setIncomingOffer(null);
    setCallState('connected');
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { targetSocketId: callerSocketId, candidate: e.candidate });
    };
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
    };
    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('accept-call', { targetSocketId: callerSocketId, answer });
    setPeerConnection(pc);
  };

  const hangupCall = () => {
    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    setPeerConnection(null);
    setLocalStream(null);
    setCallState('idle');
    setIncomingOffer(null);
    setCallerSocketId(null);
    setCallerName('');
  };

  const rejectCall = () => {
    if (callerSocketId) socket.emit('end-call', { targetSocketId: callerSocketId });
    setIncomingOffer(null);
    setCallerSocketId(null);
    setCallerName('');
  };

  useEffect(() => {
    api.get('/citas').then(r => setCitas(r.data)).catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <audio ref={remoteAudioRef} autoPlay />

      {incomingOffer && (
        <IncomingCallAlert
          callerName={callerName}
          onAccept={answerIncomingCall}
          onReject={rejectCall}
        />
      )}

      {callState === 'connected' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            textAlign: 'center', minWidth: '320px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%',
              background: '#e0e7ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
              👤
            </div>
            <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: '8px' }}>🔵 En llamada</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px' }}>{callerName}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>En curso</div>
            <button
              onClick={hangupCall}
              style={{
                background: '#ef4444', color: '#fff', border: 'none',
                borderRadius: '50%', width: '64px', height: '64px',
                fontSize: '1.5rem', cursor: 'pointer'
              }}
            >📞</button>
          </div>
        </div>
      )}

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