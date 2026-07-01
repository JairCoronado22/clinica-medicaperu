const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

const callPatient = async (doctorNumber, patientNumber, patientName) => {
  if (!client) {
    console.log('Twilio no configurado');
    return null;
  }
  try {
    const call = await client.calls.create({
      to: doctorNumber,
      from: twilioPhone,
      twiml: `<Response>
        <Say voice="alice" language="es-PE">Llamada entrante de paciente ${patientName}</Say>
        <Dial>${patientNumber}</Dial>
      </Response>`,
    });
    console.log('Llamada Twilio iniciada:', call.sid);
    return call;
  } catch (err) {
    console.error('Error Twilio:', err.message);
    return null;
  }
};

module.exports = { callPatient };
