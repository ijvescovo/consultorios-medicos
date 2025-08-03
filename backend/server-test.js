const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de conexión a PostgreSQL
const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Ckpltq1262',
    database: 'consultorio_medico'
};

// Middleware de autenticación para rutas protegidas
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    
    try {
        const decoded = jwt.verify(token, 'secret_key_consultorio');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
    if (req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'Se requieren permisos de administrador' });
    }
    next();
};

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const authRoutes = require('./routes/auth');

// Ruta de login (SIMPLIFICADA PARA TESTING)
app.post('/api/auth/login', async (req, res) => {
    const client = new Client(dbConfig);
    
    try {
        const { email, password } = req.body;
        
        console.log('Intento de login:', email, 'password:', password);
        
        // Para testing: credenciales hardcoded
        if (email === 'admin@consultorio.com' && password === 'admin123') {
            console.log('✅ Login exitoso con credenciales de testing');
            
            const token = jwt.sign(
                { 
                    id: 1, 
                    email: 'admin@consultorio.com',
                    rol: 'administrador'
                },
                'secret_key_consultorio',
                { expiresIn: '24h' }
            );
            
            return res.json({
                token,
                usuario: {
                    id: 1,
                    email: 'admin@consultorio.com',
                    nombre: 'Administrador',
                    apellido: 'Sistema',
                    rol: 'administrador'
                }
            });
        }
        
        return res.status(401).json({ 
            error: 'Credenciales inválidas. Usa: admin@consultorio.com / admin123' 
        });
        
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta de verificación de servidor
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Ruta de estadísticas
app.get('/api/stats', (req, res) => {
    res.json({
        turnosHoy: 5,
        totalPacientes: 1250,
        message: 'Sistema funcionando correctamente'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 CREDENCIALES DE TESTING:`);
    console.log(`   Email: admin@consultorio.com`);
    console.log(`   Password: admin123`);
    console.log(`🌐 Frontend: file:///e:/ConsultoriosMedicos/frontend/login.html`);
});
