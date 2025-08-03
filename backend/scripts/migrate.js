// Script para crear la base de datos y ejecutar migraciones
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración para crear la base de datos
const createDBConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD) || '',
    database: 'postgres' // Conectamos a postgres para crear la nueva BD
};

// Configuración para conectar a nuestra base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD) || '',
    database: process.env.DB_NAME || 'consultorio_medico'
};

async function crearBaseDatos() {
    const client = new Client(createDBConfig);
    
    try {
        await client.connect();
        console.log('🔌 Conectado a PostgreSQL');
        
        // Verificar si la base de datos existe
        const checkDB = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbConfig.database]
        );
        
        if (checkDB.rows.length === 0) {
            // Crear la base de datos
            await client.query(`CREATE DATABASE "${dbConfig.database}"`);
            console.log(`✅ Base de datos "${dbConfig.database}" creada exitosamente`);
        } else {
            console.log(`ℹ️ La base de datos "${dbConfig.database}" ya existe`);
        }
        
    } catch (error) {
        console.error('❌ Error al crear base de datos:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

async function ejecutarMigracion() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log(`🔌 Conectado a la base de datos "${dbConfig.database}"`);
        
        // Leer el archivo schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Ejecutar el schema
        await client.query(schemaSql);
        console.log('✅ Schema ejecutado exitosamente');
        
        // Crear usuario administrador por defecto
        const adminExists = await client.query(
            "SELECT 1 FROM usuarios WHERE email = $1",
            ['admin@consultorio.com']
        );
        
        if (adminExists.rows.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            
            await client.query(`
                INSERT INTO usuarios (email, password_hash, nombre, apellido, rol)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                'admin@consultorio.com',
                hashedPassword,
                'Administrador',
                'Sistema',
                'administrador'
            ]);
            
            console.log('👤 Usuario administrador creado:');
            console.log('   📧 Email: admin@consultorio.com');
            console.log('   🔑 Password: Admin123!');
        }
        
    } catch (error) {
        console.error('❌ Error al ejecutar migración:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

async function main() {
    try {
        console.log('🚀 Iniciando configuración de base de datos...\n');
        
        // Cargar variables de entorno
        require('dotenv').config();
        
        // Verificar que tenemos la contraseña
        if (!process.env.DB_PASSWORD) {
            console.error('❌ Error: DB_PASSWORD no está configurada en .env');
            process.exit(1);
        }
        
        console.log(`📋 Configuración:
   Host: ${process.env.DB_HOST || 'localhost'}
   Puerto: ${process.env.DB_PORT || 5432}
   Usuario: ${process.env.DB_USER || 'postgres'}
   Base de datos: ${process.env.DB_NAME || 'consultorio_medico'}
`);
        
        // Crear base de datos
        await crearBaseDatos();
        
        // Ejecutar migración
        await ejecutarMigracion();
        
        console.log('\n✅ ¡Configuración completada exitosamente!');
        console.log('🎯 La base de datos está lista para usar');
        
    } catch (error) {
        console.error('\n❌ Error en la configuración:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { crearBaseDatos, ejecutarMigracion };
