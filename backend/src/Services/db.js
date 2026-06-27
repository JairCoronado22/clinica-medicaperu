const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ldo0XGcZQuO5@ep-sparkling-hall-aiz5e1p5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: true,
  },
});

// Prueba de conexión
pool.query('SELECT * FROM doctores LIMIT 1', (err, res) => {
  if (err) {
    console.error('Error de conexión:', err);
  } else {
    console.log('Conexión exitosa. Ejemplo de doctor:', res.rows[0]);
  }
  pool.end();
});