const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Middleware para verificar que sea administrador
const requireAdmin = requireRole(['administrador']);

// Obtener todos los usuarios (solo administradores)
router.get('/', authenticateToken, requireAdmin, usuarioController.getUsuarios);

// Obtener estadísticas de usuarios
router.get('/stats', authenticateToken, requireAdmin, usuarioController.getUsuariosStats);

// Obtener un usuario por ID
router.get('/:id', authenticateToken, requireAdmin, usuarioController.getUsuario);

// Crear nuevo usuario (solo administradores)
router.post('/', authenticateToken, requireAdmin, usuarioController.createUsuario);

// Actualizar usuario (solo administradores)
router.put('/:id', authenticateToken, requireAdmin, usuarioController.updateUsuario);

// Cambiar contraseña (administradores pueden cambiar cualquiera, usuarios solo la suya)
router.patch('/:id/password', authenticateToken, usuarioController.changePassword);

// Desactivar usuario (solo administradores)
router.delete('/:id', authenticateToken, requireAdmin, usuarioController.deleteUsuario);

module.exports = router;
