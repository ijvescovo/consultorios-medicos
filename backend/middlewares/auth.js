const jwt = require('jsonwebtoken');

// Middleware principal de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
        req.user = decoded; // Cambiar de usuario a user para consistencia
        req.usuario = decoded; // Mantener compatibilidad
        next();
    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar roles específicos
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user && !req.usuario) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const userRole = req.user?.rol || req.usuario?.rol;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
        }

        next();
    };
};

// Middleware para verificar que el usuario esté activo
const requireActiveUser = async (req, res, next) => {
    try {
        const Usuario = require('../models/usuario');
        const userId = req.user?.id || req.usuario?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no identificado' });
        }

        const usuario = await Usuario.findByPk(userId);

        if (!usuario || !usuario.activo) {
            return res.status(403).json({ error: 'Usuario inactivo o no encontrado' });
        }

        next();
    } catch (error) {
        console.error('Error verificando usuario activo:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Middleware heredado para compatibilidad
const rolRequerido = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.rol || req.usuario?.rol;
        if (!Array.isArray(roles)) {
            roles = [roles];
        }
        
        if (!roles.includes(userRole)) {
            return res.status(403).json({ error: 'Acceso prohibido' });
        }
        next();
    };
};

// Exportar como función principal y como objeto con métodos específicos
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.requireRole = requireRole;
module.exports.requireActiveUser = requireActiveUser;
module.exports.rolRequerido = rolRequerido;