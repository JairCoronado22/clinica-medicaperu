const net = require('net');
const EventEmitter = require('events');

class AmiClient extends EventEmitter {
  constructor(options) {
    super();
    this.host = options.host || '127.0.0.1';
    this.port = options.port || 5038;
    this.username = options.username || options.login;
    this.password = options.password || options.secret;
    this.buffer = '';
    this.connected = false;
    this.socket = null;
    this.actionId = 0;
    this.pending = {};
  }

  connect() {
    try {
      this.socket = net.connect(this.port, this.host, () => {
        this.connected = true;
        this.emit('connect');
        this._login();
      });
      this.socket.on('data', (data) => this._onData(data));
      this.socket.on('error', (err) => {
        if (this.listenerCount('error') > 0) this.emit('error', err);
      });
      this.socket.on('close', () => { this.connected = false; this.emit('close'); });
      this.socket.on('end', () => { this.connected = false; this.emit('end'); });
    } catch (err) {
      console.warn('[Asterisk] No se pudo conectar a AMI —', err.message);
    }
  }

  _login() {
    this.send({ action: 'Login', username: this.username, secret: this.password });
  }

  _onData(data) {
    this.buffer += data.toString();
    const parts = this.buffer.split('\r\n\r\n');
    for (let i = 0; i < parts.length - 1; i++) {
      const block = parts[i];
      const lines = block.split('\r\n');
      const parsed = {};
      for (const line of lines) {
        const idx = line.indexOf(': ');
        if (idx > 0) {
          const key = line.slice(0, idx).toLowerCase();
          const val = line.slice(idx + 2);
          parsed[key] = val;
        }
      }
      const actionId = parsed.actionid;
      if (actionId && this.pending[actionId]) {
        this.pending[actionId](parsed);
        delete this.pending[actionId];
      }
      this.emit('ami_data', parsed);
    }
    this.buffer = parts[parts.length - 1];
  }

  send(action, cb) {
    if (!this.connected) return;
    this.actionId++;
    const id = String(this.actionId);
    if (cb) this.pending[id] = cb;
    const lines = Object.entries({ ...action, actionid: id })
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');
    this.socket.write(lines + '\r\n\r\n');
  }
}

const amiClient = new AmiClient({
  host: process.env.AMI_HOST || '127.0.0.1',
  port: process.env.AMI_PORT || 5038,
  username: process.env.AMI_USER || 'admin',
  password: process.env.AMI_PASSWORD || 'admin123',
});

amiClient.connect();

amiClient.on('error', (err) => {
  console.warn('[Asterisk] Error de conexión AMI —', err.message);
});

amiClient.on('ami_data', (data) => {
  if (data.event === 'Newchannel') {
    console.log('[Asterisk] Llamada entrante:', data);
  }
});

function sendOriginate(cid) {
  amiClient.send({
    action: 'Originate',
    channel: 'PJSIP/1000',
    callerid: cid,
    context: 'clinica',
    exten: '7001',
    priority: 1,
    timeout: 30000,
    async: true,
  });
  console.log(`[Asterisk] 📞 Llamando al doctor (1000) con CID: ${cid}`);
}

function makeCall({ number, callerid, calleridName }) {
  const cid = calleridName
    ? `"${calleridName}" <${callerid || number}>`
    : (callerid || number);

  if (!amiClient.connected) {
    console.log('[Asterisk] No conectado — conectando...');
    amiClient.connect();
    const check = setInterval(() => {
      if (amiClient.connected) {
        clearInterval(check);
        sendOriginate(cid);
      }
    }, 200);
    setTimeout(() => clearInterval(check), 3000);
    return;
  }
  sendOriginate(cid);
}

module.exports = { makeCall };