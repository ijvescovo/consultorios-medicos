require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de conexión a PostgreSQL
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
    const client = new Client(dbConfig);
    
    try {
        const { email, password } = req.body;
        
        // Conectar a la base de datos
        await client.connect();
        
        // Buscar usuario por email
        const result = await client.query(
            'SELECT id, email, password_hash, nombre, apellido, rol FROM usuarios WHERE email = $1 AND activo = true',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }
        
        const usuario = result.rows[0];
        
        // Verificar password
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
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
            process.env.JWT_SECRET || 'secret_key_default',
            { expiresIn: '24h' }
        );
        
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
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        await client.end();
    }
});

// Ruta de verificación de servidor
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Ruta de estadísticas (simplificada)
app.get('/api/stats', async (req, res) => {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        
        const stats = {
            turnosHoy: 0,
            totalPacientes: 1, // Valor de ejemplo
            message: 'Sistema conectado correctamente'
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error en stats:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    } finally {
        await client.end();
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 Base de datos PostgreSQL configurada`);
    console.log(`🌐 Prueba el login en: http://localhost:${PORT}/api/auth/login`);
});

// Verificar conexión a base de datos al iniciar
const verificarConexion = async () => {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        await client.end();
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
    }
};

verificarConexion();
