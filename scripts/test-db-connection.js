// scripts/test-db-connection.js
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✅ Connexion réussie à la base !');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base :', err);
  }); 