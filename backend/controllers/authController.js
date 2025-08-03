const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Importar modelos de Sequelize
const { Usuario, Medico } = require('../models');

// Configurar nodemailer (ajustar según tu proveedor de email)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Usuarios simulados para testing
        const usuariosSimulados = [
            {
                id: 1,
                email: 'admin@consultorio.com',
                password: 'Admin123!',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'admin',
                activo: true
            },
            {
                id: 2,
                email: 'doctor@consultorio.com', 
                password: 'Doctor123!',
                nombre: 'Dr. Juan',
                apellido: 'Pérez',
                rol: 'doctor',
                activo: true
            }
        ];
        
        // Intentar usar la base de datos primero
        try {
            const usuario = await Usuario.findOne({ where: { email, activo: true } });
            
            if (usuario) {
                // Verificar contraseña
                const validPassword = await usuario.validPassword(password);
                if (!validPassword) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }
                
                // Actualizar último acceso
                await usuario.update({ ultimoAcceso: new Date() });
                
                // Generar token JWT
                const token = jwt.sign(
                    { 
                        id: usuario.id, 
                        email: usuario.email, 
                        rol: usuario.rol, 
                        nombre: usuario.nombre,
                        apellido: usuario.apellido
                    },
                    process.env.JWT_SECRET || 'tu_clave_secreta_aqui',
                    { expiresIn: '8h' }
                );
                
                return res.json({ 
                    token, 
                    rol: usuario.rol, 
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    id: usuario.id 
                });
            }
        } catch (dbError) {
            console.log('⚠️ Base de datos no disponible, usando usuarios simulados:', dbError.message);
        }
        
        // Buscar en usuarios simulados
        const usuarioSimulado = usuariosSimulados.find(u => u.email === email);
        
        if (!usuarioSimulado) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Verificar contraseña (comparación directa para simulados)
        if (usuarioSimulado.password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Generar token JWT para usuario simulado
        const token = jwt.sign(
            { 
                id: usuarioSimulado.id, 
                email: usuarioSimulado.email, 
                rol: usuarioSimulado.rol, 
                nombre: usuarioSimulado.nombre,
                apellido: usuarioSimulado.apellido
            },
            process.env.JWT_SECRET || 'tu_clave_secreta_aqui',
            { expiresIn: '8h' }
        );
        
        res.json({ 
            token, 
            rol: usuarioSimulado.rol, 
            nombre: usuarioSimulado.nombre,
            apellido: usuarioSimulado.apellido,
            id: usuarioSimulado.id 
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Buscar usuario por email
        const usuario = await Usuario.findOne({ where: { email, activo: true } });
        
        if (!usuario) {
            // Por seguridad, siempre responder que se envió el email
            return res.json({ message: 'Si el email existe, recibirás un enlace de recuperación' });
        }
        
        // Generar token de recuperación (válido por 1 hora)
        const resetToken = jwt.sign(
            { id: usuario.id, email: usuario.email, type: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Guardar token en la base de datos
        await usuario.update({ 
            resetToken: resetToken,
            resetTokenExpires: new Date(Date.now() + 3600000) // 1 hora
        });
        
        // Enviar email (si está configurado)
        if (process.env.SMTP_USER) {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Recuperación de contraseña - Consultorio Médico',
                html: `
                    <h2>Recuperación de contraseña</h2>
                    <p>Has solicitado restablecer tu contraseña.</p>
                    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                    <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
                `
            };
            
            await transporter.sendMail(mailOptions);
        }
        
        res.json({ message: 'Si el email existe, recibirás un enlace de recuperación' });
    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.requestAccess = async (req, res) => {
    try {
        const { name, email, role, message } = req.body;
        
        // Validar datos
        if (!name || !email || !role) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        
        // Verificar si ya existe un usuario con ese email
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }
        
        // Crear solicitud de acceso (podrías tener una tabla específica para esto)
        const solicitud = {
            nombre: name,
            email: email,
            rol: role,
            mensaje: message,
            fechaSolicitud: new Date(),
            estado: 'pendiente'
        };
        
        // Aquí podrías guardar en una tabla de solicitudes o enviar email al admin
        console.log('Nueva solicitud de acceso:', solicitud);
        
        // Enviar notificación al administrador
        if (process.env.ADMIN_EMAIL && process.env.SMTP_USER) {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: process.env.ADMIN_EMAIL,
                subject: 'Nueva solicitud de acceso - Consultorio Médico',
                html: `
                    <h2>Nueva solicitud de acceso</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Rol solicitado:</strong> ${role}</p>
                    <p><strong>Mensaje:</strong></p>
                    <p>${message || 'Sin mensaje adicional'}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                `
            };
            
            await transporter.sendMail(mailOptions);
        }
        
        res.json({ message: 'Solicitud enviada correctamente' });
    } catch (error) {
        console.error('Error en solicitud de acceso:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        // El token ya fue verificado en el middleware authenticateToken
        
        // Usuarios simulados para testing
        const usuariosSimulados = [
            {
                id: 1,
                email: 'admin@consultorio.com',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'admin',
                activo: true
            },
            {
                id: 2,
                email: 'doctor@consultorio.com', 
                nombre: 'Dr. Juan',
                apellido: 'Pérez',
                rol: 'doctor',
                activo: true
            }
        ];
        
        // Intentar usar la base de datos primero
        try {
            const usuario = await Usuario.findByPk(req.user.id);
            
            if (usuario && usuario.activo) {
                return res.json({
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    rol: usuario.rol
                });
            }
        } catch (dbError) {
            console.log('⚠️ Base de datos no disponible para verificación, usando usuarios simulados');
        }
        
        // Buscar en usuarios simulados
        const usuarioSimulado = usuariosSimulados.find(u => u.id === req.user.id);
        
        if (!usuarioSimulado || !usuarioSimulado.activo) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }
        
        res.json({
            id: usuarioSimulado.id,
            email: usuarioSimulado.email,
            nombre: usuarioSimulado.nombre,
            apellido: usuarioSimulado.apellido,
            rol: usuarioSimulado.rol
        });
        
    } catch (error) {
        console.error('Error en verificación de token:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.logout = async (req, res) => {
    try {
        // En una implementación real, podrías mantener una lista de tokens revocados
        // o simplemente responder success ya que el cliente eliminará el token
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};