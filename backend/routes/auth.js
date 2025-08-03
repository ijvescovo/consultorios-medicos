const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Login de usuarios
router.post('/login', authController.login);

// Recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);

// Solicitud de acceso
router.post('/request-access', authController.requestAccess);

// Verificar token
router.get('/verify', authenticateToken, authController.verifyToken);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Endpoint de salud para verificar estado del servidor
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;