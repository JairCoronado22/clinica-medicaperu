const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Distancia euclidiana
function euclideanDistance(d1, d2) {
  return Math.sqrt(d1.reduce((sum, val, i) => sum + (val - d2[i]) ** 2, 0));
}

// Comparación con BD
async function compareFaceDescriptor(descriptor) {
  const { rows } = await pool.query(
    'SELECT * FROM doctores UNION SELECT * FROM pacientes ORDER BY (descriptor_facial <-> $1)',
    [descriptor]
  );
  if (rows.length > 0) {
    const closest = rows[0];
    if (euclideanDistance(descriptor, closest.descriptor_facial) <= 0.6) {
      return closest;
    }
  }
  return null;
}

module.exports = { compareFaceDescriptor };