Sistema web desarrollado con:

React (Frontend)
Node.js + Express (Backend)
PostgreSQL (Base de Datos)
Asterisk PBX (Telefonía IP)
Face API.js (Reconocimiento facial)
WSL2 + Ubuntu
Requisitos

Instalar:

Node.js 18+
PostgreSQL
Git
WSL2
Ubuntu
Asterisk
Clonar proyecto
git clone https://github.com/JairCoronado22/clinica-medicaperu.git
cd clinica-medicaperu
Configurar PostgreSQL

Crear base de datos:

CREATE DATABASE clinica;

Crear usuario:

CREATE USER clinica_user WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE clinica TO clinica_user;
Configurar Backend

Entrar a backend:

cd backend
npm install

Crear archivo .env

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica
DB_USER=clinica_user
DB_PASSWORD=123456

JWT_SECRET=clinica_secret

AMI_HOST=127.0.0.1
AMI_PORT=5038
AMI_USER=admin
AMI_PASSWORD=admin123

Ejecutar backend:

npm run dev

Debe mostrar:

Backend corriendo en http://localhost:3000
Configurar Frontend

Entrar a frontend:

cd frontend
npm install

Ejecutar:

npm start

Abrir:

http://localhost:3001
Configurar modelos Face API

Crear carpeta:

frontend/public/models

buscar los que no esten corruptos

Configurar WSL2 y Ubuntu

Instalar:

wsl --install

Instalar Ubuntu desde Microsoft Store.

Verificar:

wsl
Configurar Asterisk

Instalar:

sudo apt update
sudo apt install asterisk

Verificar:

sudo systemctl status asterisk

Entrar a consola:

sudo asterisk -rvvv
Archivos modificados de Asterisk

Editar:

/etc/asterisk/sip.conf
/etc/asterisk/extensions.conf
/etc/asterisk/manager.conf

Luego recargar:

sudo asterisk -rx "reload"

o:

sudo systemctl restart asterisk

# clinica-medicaperu