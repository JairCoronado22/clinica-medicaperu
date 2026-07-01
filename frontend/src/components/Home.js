import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '2rem' }}>🏥</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>MedicaPeru</span>
        </div>
        <nav>
          {!user ? (
            <>
              <Link to="/login" className="btn-primary" style={{ marginRight: '10px' }}>Iniciar sesión</Link>
              <Link to="/register" className="btn-secondary">Registrarse</Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn-primary">Ir a Dashboard</Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="hero animate-fade">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1>Atención médica inteligente</h1>
          <p>Conectamos doctores y pacientes con tecnología de vanguardia: gestión de pacientes, llamadas VoIP y reconocimiento facial.</p>
          {!user && (
            <Link to="/register" className="btn-primary" style={{ background: 'white', color: '#2563eb', padding: '14px 36px', fontSize: '1.1rem' }}>
              Comenzar ahora
            </Link>
          )}
          <div className="stats">
            <div className="stat-item">
              <div className="stat-number">+200</div>
              <div className="stat-label">Pacientes atendidos</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">+50</div>
              <div className="stat-label">Doctores registrados</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Disponibilidad</div>
            </div>
          </div>
        </div>
        {/* Fondo decorativo */}
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
      </section>

      {/* Características */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>¿Qué ofrecemos?</h2>
        <div className="feature-grid">
          <div className="feature-card animate-fade" style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon">🔐</div>
            <div className="feature-title">Login seguro</div>
            <div className="feature-desc">Reconocimiento facial y autenticación por usuario/contraseña para proteger tus datos.</div>
          </div>
          <div className="feature-card animate-fade" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon">📞</div>
            <div className="feature-title">Llamadas VoIP</div>
            <div className="feature-desc">Integración con Asterisk para Click to Call y detección automática de llamadas entrantes.</div>
          </div>
          <div className="feature-card animate-fade" style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon">📋</div>
            <div className="feature-title">Gestión de pacientes</div>
            <div className="feature-desc">CRUD completo para doctores: crear, editar, eliminar y listar pacientes fácilmente.</div>
          </div>
          <div className="feature-card animate-fade" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon">📊</div>
            <div className="feature-title">Métricas en tiempo real</div>
            <div className="feature-desc">Dashboard con estadísticas de llamadas y pacientes para un mejor seguimiento.</div>
          </div>
        </div>
      </section>

      {/* Testimonios o llamado a la acción */}
      <section style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3>Únete a MedicaPeru</h3>
          <p style={{ color: '#475569', marginBottom: '16px' }}>
            Simplifica la gestión de tu clínica y mejora la atención a tus pacientes.
          </p>
          {!user && (
            <Link to="/register" className="btn-primary">Regístrate gratis</Link>
          )}
        </div>
      </section>

      {/* Footer simple */}
      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        © 2025 MedicaPeru. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;