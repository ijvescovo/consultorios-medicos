const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de conexión a PostgreSQL (hardcoded para testing)
const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Ckpltq1262',
    database: 'consultorio_medico'
};

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
    const client = new Client(dbConfig);
    
    try {
        const { email, password } = req.body;
        
        console.log('Intento de login:', email);
        
        // Conectar a la base de datos
        await client.connect();
        console.log('Conectado a PostgreSQL');
        
        // Buscar usuario por email
        const result = await client.query(
            'SELECT id, email, password_hash, nombre, apellido, rol FROM usuarios WHERE email = $1 AND activo = true',
            [email]
        );
        
        if (result.rows.length === 0) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }
        
        const usuario = result.rows[0];
        console.log('Usuario encontrado:', usuario.email);
        
        // Verificar password
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        console.log('Password válido:', passwordValido);
        
        if (!passwordValido) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }
        
        // Actualizar último acceso
        await client.query(
            'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1',
            [usuario.id]
        );
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email,
                rol: usuario.rol
            },
            'secret_key_consultorio',
            { expiresIn: '24h' }
        );
        
        console.log('Login exitoso para:', usuario.email);
        
        res.json({
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                rol: usuario.rol
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        await client.end();
    }
});

// Ruta de verificación de servidor
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 Credenciales de prueba: admin@consultorio.com / Admin123!`);
});

// Verificar conexión a base de datos al iniciar
const verificarConexion = async () => {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        
        // Verificar que el usuario admin existe
        const result = await client.query('SELECT email FROM usuarios WHERE email = $1', ['admin@consultorio.com']);
        if (result.rows.length > 0) {
            console.log('👤 Usuario administrador encontrado');
        } else {
            console.log('❌ Usuario administrador NO encontrado');
        }
        
        await client.end();
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
    }
};

verificarConexion();
