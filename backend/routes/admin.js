const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// Middleware para verificar que sea admin
const requireAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

// Dashboard de administración
router.get('/dashboard/stats', auth, requireAdmin, adminController.getDashboardStats);

// Gestión avanzada de usuarios
router.get('/usuarios', auth, requireAdmin, adminController.getUsuariosAvanzado);
router.post('/usuarios', auth, requireAdmin, adminController.crearUsuarioAvanzado);
router.put('/usuarios/:id/permisos', auth, requireAdmin, adminController.actualizarPermisos);
router.put('/usuarios/:id/bloqueo', auth, requireAdmin, adminController.toggleBloqueoUsuario);
router.put('/usuarios/:id/password-reset', auth, requireAdmin, adminController.resetearPassword);

// Logs y auditoría
router.get('/logs/actividad', auth, requireAdmin, adminController.getLogsActividad);
router.get('/logs/auditoria', auth, requireAdmin, adminController.getAuditLogs || adminController.getLogsActividad);

module.exports = router;
