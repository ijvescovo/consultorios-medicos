// Test de conexión a base de datos
require('dotenv').config();

console.log('Variables de entorno:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***CONFIGURADA***' : 'NO CONFIGURADA');

// Probar conexión directa con pg
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function probarConexion() {
    try {
        await client.connect();
        console.log('✅ Conexión PostgreSQL exitosa');
        
        const result = await client.query('SELECT version()');
        console.log('📋 Versión PostgreSQL:', result.rows[0].version);
        
        await client.end();
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

probarConexion();
