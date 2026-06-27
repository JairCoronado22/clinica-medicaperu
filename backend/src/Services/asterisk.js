const AsteriskAmi = require('asterisk-ami');

const amiClient = new AsteriskAmi({
  host: process.env.AMI_HOST,
  port: process.env.AMI_PORT,
  login: process.env.AMI_USER,       // ✅ 'username' → 'login'
  password: process.env.AMI_PASSWORD,
});

amiClient.connect();                  // ✅ Conectar explícitamente

// Llamada externa (Click to Call)
function makeCall(phoneNumber) {      // ✅ No es async, usa .send()
  amiClient.send({
    action: 'Originate',              // ✅ .originate() no existe, usar .send()
    channel: 'SIP/1001',
    exten: phoneNumber,               // ✅ 'extension' → 'exten'
    context: 'clinica',
    priority: 1,
    async: true,
  });
}

// Evento de llamadas entrantes
amiClient.on('ami_data', (data) => { // ✅ 'NewChannel' → 'ami_data'
  if (data.event === 'Newchannel') { // ✅ Filtrar por tipo de evento
    console.log('Llamada entrante:', data);
    // Emitir evento a frontend via WebSocket
  }
});

module.exports = { makeCall };