const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configurar variables de entorno por defecto para testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret_key_consultorio';
process.env.DB_NAME = process.env.DB_NAME || 'consultorio_medico';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'Ckpltq1262';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
        }
        
        next();
    };
};

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta de login simplificada para testing
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Intento de login:', email);
        
        // Para testing: credenciales hardcoded
        if (email === 'admin@consultorio.com' && password === 'admin123') {
            console.log('✅ Login exitoso con credenciales de testing');
            
            const token = jwt.sign(
                { 
                    id: 1, 
                    email: 'admin@consultorio.com',
                    nombre: 'Administrador',
                    apellido: 'Sistema',
                    rol: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            return res.json({
                token,
                id: 1,
                email: 'admin@consultorio.com',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'admin'
            });
        }
        
        // Intentar con la base de datos real
        try {
            const { sincronizarBaseDatos, Usuario } = require('./models');
            
            // Verificar conexión a la base de datos
            await sincronizarBaseDatos();
            
            // Buscar usuario en la base de datos
            const usuario = await Usuario.findOne({ 
                where: { email, activo: true } 
            });
            
            if (!usuario) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Verificar contraseña
            const validPassword = await usuario.validPassword(password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Actualizar último acceso
            await usuario.update({ ultimo_acceso: new Date() });
            
            // Generar token JWT
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    rol: usuario.rol, 
                    nombre: usuario.nombre 
                },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
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
            
        } catch (dbError) {
            console.error('Error de base de datos, usando credenciales de testing:', dbError.message);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Importar y usar rutas de usuarios solo si Sequelize está disponible
try {
    const usuariosRoutes = require('./routes/usuarios');
    app.use('/api/usuarios', usuariosRoutes);
    console.log('✅ Rutas de usuarios cargadas');
} catch (error) {
    console.warn('⚠️  No se pudieron cargar las rutas de usuarios:', error.message);
}

// Importar y usar rutas de administración
try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    console.log('✅ Rutas de administración cargadas');
} catch (error) {
    console.warn('⚠️  No se pudieron cargar las rutas de administración:', error.message);
}

// Ruta para verificar token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            email: req.user.email,
            nombre: req.user.nombre,
            rol: req.user.rol
        });
    } catch (error) {
        console.error('Error en verificación de token:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log('📋 Rutas disponibles:');
    console.log('   POST /api/auth/login - Login de usuarios');
    console.log('   GET  /api/auth/verify - Verificar token');
    console.log('   GET  /api/health - Estado del servidor');
    console.log('   GET  /api/usuarios - Listar usuarios (admin)');
    console.log('   POST /api/usuarios - Crear usuario (admin)');
    console.log('   PUT  /api/usuarios/:id - Actualizar usuario (admin)');
    console.log('   DEL  /api/usuarios/:id - Eliminar usuario (admin)');
    console.log('   🛡️  RUTAS DE ADMINISTRACIÓN:');
    console.log('   GET  /api/admin/dashboard/stats - Estadísticas del dashboard');
    console.log('   GET  /api/admin/usuarios - Gestión avanzada de usuarios');
    console.log('   POST /api/admin/usuarios - Crear usuario avanzado');
    console.log('   PUT  /api/admin/usuarios/:id/permisos - Actualizar permisos');
    console.log('   PUT  /api/admin/usuarios/:id/bloqueo - Bloquear/desbloquear usuario');
    console.log('   PUT  /api/admin/usuarios/:id/password-reset - Resetear contraseña');
    console.log('   GET  /api/admin/logs/actividad - Logs de auditoría');
});

module.exports = app;
