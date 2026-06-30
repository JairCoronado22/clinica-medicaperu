# 🏥 Clínica Médica Perú

Sistema web de gestión clínica con **telefonía IP (Asterisk PBX)**, **reconocimiento facial (face-api.js)** y **notificaciones en tiempo real (Socket.IO)**.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + React Router |
| Backend | Node.js + Express + Socket.IO |
| Base de datos | PostgreSQL |
| Telefonía | Asterisk 22 (PJSIP) + AMI |
| Reconocimiento facial | face-api.js (SSD Mobilenet v1) |
| Autenticación | JWT + bcrypt |

## Arquitectura

```
Navegador → :3001 React App
  ├── REST API → :3000/api → Express
  │     ├── /auth/login          → bcrypt + JWT
  │     ├── /auth/login-face     → face-api.js + JWT
  │     ├── /auth/register       → User.create()
  │     ├── /patients            → CRUD pacientes
  │     ├── /citas               → CRUD citas
  │     └── /calls               → Asterisk AMI + webhook
  │
  ├── Socket.IO → :3000 (eventos en tiempo real)
  │     └── llamada-entrante → CallNotification
  │
  └── PostgreSQL :5432
        ├── users  (id, username, password, role, telefono, face_descriptor)
        ├── citas  (id, paciente_id, doctor_id, fecha, motivo, estado)
        └── llamadas (id, numero_origen, numero_destino, duracion, tipo, paciente_id)

Asterisk PBX (Linux)
  ├── pjsip_extensions.conf → endpoints 1000/1001/1002
  ├── extensions.conf → dialplan con CURL a :3000
  └── manager.conf → AMI puerto 5038 (admin/admin123)
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Asterisk 20+ (opcional, para telefonía)
- Navegador con cámara (para reconocimiento facial)

## Instalación

### 1. Clonar

```bash
git clone https://github.com/JairCoronado22/clinica-medicaperu.git
cd clinica-medicaperu
```

### 2. Base de datos

```bash
sudo -u postgres psql <<EOF
CREATE DATABASE clinica;
CREATE USER clinica_user WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE clinica TO clinica_user;
\c clinica
GRANT ALL ON SCHEMA public TO clinica_user;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'patient')),
  telefono VARCHAR(20) UNIQUE,
  face_descriptor JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES users(id),
  doctor_id INTEGER REFERENCES users(id),
  fecha TIMESTAMP NOT NULL,
  motivo TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS llamadas (
  id SERIAL PRIMARY KEY,
  numero_origen VARCHAR(20),
  numero_destino VARCHAR(20),
  duracion INTEGER,
  tipo VARCHAR(20) CHECK (tipo IN ('entrante', 'saliente', 'perdida')),
  paciente_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_telefono ON users(telefono);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_citas_fecha ON citas(fecha);
EOF

# Permisos
sudo -u postgres psql -d clinica -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO clinica_user;"
sudo -u postgres psql -d clinica -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO clinica_user;"
```

### 3. Backend

```bash
cd backend
npm install
```

#### `.env`

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica
DB_USER=clinica_user
DB_PASSWORD=123456
JWT_SECRET=clinica_secret_change_this_in_production
FRONTEND_URL=http://localhost:3001
AMI_HOST=127.0.0.1
AMI_PORT=5038
AMI_USER=admin
AMI_PASSWORD=admin123
```

Crear archivo:

```bash
cat > .env <<'EOF'
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica
DB_USER=clinica_user
DB_PASSWORD=123456
JWT_SECRET=clinica_secret_change_this_in_production
FRONTEND_URL=http://localhost:3001
AMI_HOST=127.0.0.1
AMI_PORT=5038
AMI_USER=admin
AMI_PASSWORD=admin123
EOF
```

Ejecutar:

```bash
node server.js
# Debe mostrar: Backend corriendo en http://localhost:3000
```

### 4. Frontend

```bash
cd frontend
npm install

# .env (para ocultar warnings de face-api.js)
echo "GENERATE_SOURCEMAP=false" > .env

PORT=3001 npm start
# Abrir http://localhost:3001
```

### 5. Modelos face-api.js (necesario para login facial)

```bash
cd frontend/public
mkdir -p models && cd models

curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard2
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -LO https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

## Configurar Asterisk (PBX)

### PJSIP endpoints

```bash
sudo tee /etc/asterisk/pjsip_extensions.conf <<'EOF'
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[1000]
type=endpoint
context=clinica
disallow=all
allow=ulaw
auth=auth1000
aors=1000
callerid=Extension 1000 <1000>

[auth1000]
type=auth
auth_type=userpass
password=1234
username=1000

[1000]
type=aor
max_contacts=5

[1001]
type=endpoint
context=clinica
disallow=all
allow=ulaw
auth=auth1001
aors=1001
callerid=Extension 1001 <1001>

[auth1001]
type=auth
auth_type=userpass
password=5678
username=1001

[1001]
type=aor
max_contacts=5
EOF

sudo asterisk -rx "pjsip reload"
```

### Dialplan (webhook + ruteo)

```bash
sudo tee /etc/asterisk/extensions.conf <<'EOF'
[clinica]

exten => _X.,1,NoOp(Llamada entrante de ${CALLERID(num)} a ${EXTEN})
 same => n,Set(HTTP_RESULT=${CURL(http://localhost:3000/api/calls/llamada-entrante?numero=${CALLERID(num)})})
 same => n,NoOp(Backend response: ${HTTP_RESULT})
 same => n,Dial(PJSIP/${EXTEN},30)
 same => n,Hangup()
EOF

sudo asterisk -rx "dialplan reload"
```

### AMI (Manager Interface)

```bash
sudo tee /etc/asterisk/manager.conf <<'EOF'
[general]
enabled=yes
port=5038
bindaddr=0.0.0.0

[admin]
secret=admin123
read=all
write=all
EOF

sudo asterisk -rx "manager reload"
```

## Ejecución

### Desarrollo (dos terminales)

```bash
# Terminal 1: Backend
cd /ruta/clinica-medicaperu/backend
node server.js

# Terminal 2: Frontend
cd /ruta/clinica-medicaperu/frontend
PORT=3001 npm start
```

### Producción (systemd)

```bash
sudo tee /etc/systemd/system/clinica-backend.service <<'EOF'
[Unit]
Description=Clinica Medica Backend
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/ruta/clinica-medicaperu/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now clinica-backend.service

# Logs
sudo journalctl -u clinica-backend.service -f
```

## Comandos útiles

### Base de datos

```bash
# Conectar
PGPASSWORD=123456 psql -h localhost -U clinica_user -d clinica

# Ver tablas
\dt

# Ver usuarios
SELECT id, username, role, telefono FROM users;

# Limpiar todo (cuidado)
DELETE FROM llamadas; DELETE FROM citas; DELETE FROM users;
```

### Asterisk

```bash
# Recargar config PJSIP
sudo asterisk -rx "pjsip reload"

# Recargar dialplan
sudo asterisk -rx "dialplan reload"

# Ver endpoints registrados
sudo asterisk -rx "pjsip show endpoints"

# Ver canales activos
sudo asterisk -rx "core show channels"

# Verificar AMI conectado
sudo asterisk -rx "manager show connected"

# Consola interactiva
sudo asterisk -rvvv
```

### Backend

```bash
# Ver logs del servicio
sudo journalctl -u clinica-backend.service -f

# Verificar health
curl http://localhost:3000/api/health

# Simular llamada entrante (prueba)
curl http://localhost:3000/api/calls/llamada-entrante?numero=1000

# Forzar llamada desde Asterisk al doctor con callerid paciente
curl -X POST http://localhost:3000/api/calls/simular-llamada \
  -H "Content-Type: application/json" \
  -d '{"paciente_id":2}'
```

### Red / Puertos

```bash
# Ver qué está usando el puerto 3000
sudo lsof -i :3000

# Matar proceso en puerto
sudo kill -9 $(sudo lsof -ti :3000)
```

## Solución de problemas

### Error: `Backend corriendo` pero luego muere silenciosamente
- **Causa:** El `.env` no se encontró porque `process.cwd()` no es el directorio del backend.
- **Solución:** Siempre ejecutar `node server.js` **desde** `backend/`. No usar ruta absoluta.
- **Para systemd:** Asegurar que `WorkingDirectory` apunte al directorio del backend.

### Error: `WebSocket connection to ws://localhost:3001/socket.io/... failed`
- **Causa:** Socket.IO apunta a puerto 3001 (frontend) pero el servidor socket está en 3000.
- **Solución:** En `frontend/src/services/socket.js`, cambiar a `io('http://localhost:3000')`.

### Error: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`
- **Causa:** El `.env` no se cargó y `DB_PASSWORD` es `undefined`.
- **Solución:** Ejecutar `node server.js` desde `backend/` para que dotenv encuentre el `.env`.

### Error: `listen EADDRINUSE :3000`
- **Causa:** Puerto ocupado por otro proceso.
- **Solución:** `sudo lsof -i :3000` → matar proceso o esperar.

### Error: `Asterisk AMI not connected`
- **Causa:** La conexión TCP al puerto 5038 no se estableció a tiempo.
- **Solución:** El módulo `asterisk.js` ya incluye reconexión automática cada 200ms hasta 3s.

### Error: `CURL from Asterisk returns no response / backend log limpio`
- **Causa:** El backend no estaba corriendo cuando Asterisk ejecutó el CURL.
- **Solución:** Verificar que el backend esté activo. Con systemd: `sudo systemctl status clinica-backend.service`.

### Error: `Systemd restart hangs (deactivating stop-sigterm)`
- **Causa:** El handler `server.close()` en SIGTERM espera conexiones activas.
- **Solución:** Usar `process.exit(0)` en vez de `server.close()` en `server.js`.

### Error: `Face-api.js models load forever (botón deshabilitado)`
- **Causa:** Modelos cargando desde CDN lento o caído.
- **Solución:** El `FaceCapture.js` ahora carga desde `/models` (archivos locales en `frontend/public/models/`). Descargar modelos con los comandos de la sección 5.

### Error: `No se detectó ningún rostro`
- **Causa:** Mala iluminación, cámara tapada o ángulo incorrecto.
- **Solución:** Buena iluminación frontal, rostro centrado, sin lentes que reflejen.

### Error: `face-api.js: 175 source-map warnings`
- **Causa:** Modelos binarios detectados como source maps.
- **Solución:** Agregar `GENERATE_SOURCEMAP=false` al `.env` del frontend.

## Licencia

Proyecto académico — Universidad Tecnológica del Perú (UTP)
