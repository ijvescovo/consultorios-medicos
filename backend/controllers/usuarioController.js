const bcrypt = require('bcryptjs');
const { Usuario, Medico } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los usuarios
 */
exports.getUsuarios = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', rol = '' } = req.query;
        const offset = (page - 1) * limit;
        
        // Construir filtros de búsqueda
        const whereClause = {
            activo: true
        };
        
        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { apellido: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        if (rol) {
            whereClause.rol = rol;
        }
        
        const { count, rows: usuarios } = await Usuario.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'email', 'nombre', 'apellido', 'rol', 'activo', 'ultimo_acceso', 'created_at'],
            include: [{
                model: Medico,
                required: false,
                attributes: ['matricula', 'especialidad', 'telefono']
            }],
            offset: parseInt(offset),
            limit: parseInt(limit),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            usuarios,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Obtener un usuario por ID
 */
exports.getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = await Usuario.findOne({
            where: { id, activo: true },
            attributes: ['id', 'email', 'nombre', 'apellido', 'rol', 'activo', 'ultimo_acceso', 'created_at'],
            include: [{
                model: Medico,
                required: false,
                attributes: ['matricula', 'especialidad', 'telefono', 'direccion_consultorio']
            }]
        });
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(usuario);
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Crear nuevo usuario
 */
exports.createUsuario = async (req, res) => {
    try {
        const {
            email,
            password,
            nombre,
            apellido,
            rol,
            // Datos adicionales para médicos
            matricula,
            especialidad,
            telefono,
            direccion_consultorio
        } = req.body;
        
        // Validaciones básicas
        if (!email || !password || !nombre || !apellido || !rol) {
            return res.status(400).json({ 
                error: 'Todos los campos obligatorios deben ser completados' 
            });
        }
        
        // Validar que el email no exista
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Ya existe un usuario con este email' 
            });
        }
        
        // Validar rol
        const validRoles = ['administrador', 'medico', 'recepcionista'];
        if (!validRoles.includes(rol)) {
            return res.status(400).json({ 
                error: 'Rol inválido' 
            });
        }
        
        // Hash de la contraseña
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        // Crear usuario en transacción
        const transaction = await Usuario.sequelize.transaction();
        
        try {
            const nuevoUsuario = await Usuario.create({
                email,
                password_hash,
                nombre,
                apellido,
                rol,
                activo: true
            }, { transaction });
            
            // Si es médico, crear registro en tabla médicos
            if (rol === 'medico') {
                if (!matricula) {
                    await transaction.rollback();
                    return res.status(400).json({ 
                        error: 'La matrícula es obligatoria para médicos' 
                    });
                }
                
                await Medico.create({
                    usuario_id: nuevoUsuario.id,
                    matricula,
                    especialidad: especialidad || null,
                    telefono: telefono || null,
                    direccion_consultorio: direccion_consultorio || null
                }, { transaction });
            }
            
            await transaction.commit();
            
            // Respuesta sin la contraseña
            const usuarioResponse = {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                rol: nuevoUsuario.rol,
                activo: nuevoUsuario.activo,
                created_at: nuevoUsuario.created_at
            };
            
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                usuario: usuarioResponse
            });
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error('Error creando usuario:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                error: 'Ya existe un usuario con este email' 
            });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Actualizar usuario
 */
exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email,
            nombre,
            apellido,
            rol,
            activo,
            // Datos adicionales para médicos
            matricula,
            especialidad,
            telefono,
            direccion_consultorio
        } = req.body;
        
        const usuario = await Usuario.findOne({ where: { id, activo: true } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // No permitir que el usuario se desactive a sí mismo
        if (req.user.id === parseInt(id) && activo === false) {
            return res.status(400).json({ 
                error: 'No puedes desactivar tu propia cuenta' 
            });
        }
        
        const transaction = await Usuario.sequelize.transaction();
        
        try {
            // Actualizar datos del usuario
            const updateData = {};
            if (email && email !== usuario.email) {
                // Verificar que el nuevo email no exista
                const existingUser = await Usuario.findOne({ 
                    where: { email, id: { [Op.ne]: id } } 
                });
                if (existingUser) {
                    await transaction.rollback();
                    return res.status(400).json({ 
                        error: 'Ya existe un usuario con este email' 
                    });
                }
                updateData.email = email;
            }
            
            if (nombre) updateData.nombre = nombre;
            if (apellido) updateData.apellido = apellido;
            if (rol) updateData.rol = rol;
            if (typeof activo === 'boolean') updateData.activo = activo;
            
            await usuario.update(updateData, { transaction });
            
            // Si es médico, actualizar datos médicos
            if (rol === 'medico' || usuario.rol === 'medico') {
                const medico = await Medico.findOne({ 
                    where: { usuario_id: id } 
                });
                
                if (rol === 'medico') {
                    const medicoData = {};
                    if (matricula) medicoData.matricula = matricula;
                    if (especialidad !== undefined) medicoData.especialidad = especialidad;
                    if (telefono !== undefined) medicoData.telefono = telefono;
                    if (direccion_consultorio !== undefined) medicoData.direccion_consultorio = direccion_consultorio;
                    
                    if (medico) {
                        await medico.update(medicoData, { transaction });
                    } else if (matricula) {
                        await Medico.create({
                            usuario_id: id,
                            matricula,
                            especialidad: especialidad || null,
                            telefono: telefono || null,
                            direccion_consultorio: direccion_consultorio || null
                        }, { transaction });
                    }
                } else if (medico && rol !== 'medico') {
                    // Si cambió de médico a otro rol, desactivar registro médico
                    await medico.update({ activo: false }, { transaction });
                }
            }
            
            await transaction.commit();
            
            res.json({ message: 'Usuario actualizado exitosamente' });
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Cambiar contraseña de usuario
 */
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }
        
        const usuario = await Usuario.findOne({ where: { id, activo: true } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Si es el propio usuario, verificar contraseña actual
        if (req.user.id === parseInt(id)) {
            if (!currentPassword) {
                return res.status(400).json({ 
                    error: 'Contraseña actual requerida' 
                });
            }
            
            const validPassword = await bcrypt.compare(currentPassword, usuario.password_hash);
            if (!validPassword) {
                return res.status(400).json({ 
                    error: 'Contraseña actual incorrecta' 
                });
            }
        }
        
        // Hash de la nueva contraseña
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);
        
        await usuario.update({ password_hash });
        
        res.json({ message: 'Contraseña actualizada exitosamente' });
        
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Desactivar usuario (soft delete)
 */
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = await Usuario.findOne({ where: { id, activo: true } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // No permitir que el usuario se elimine a sí mismo
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ 
                error: 'No puedes eliminar tu propia cuenta' 
            });
        }
        
        await usuario.update({ activo: false });
        
        res.json({ message: 'Usuario desactivado exitosamente' });
        
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Obtener estadísticas de usuarios
 */
exports.getUsuariosStats = async (req, res) => {
    try {
        const stats = await Usuario.findAll({
            attributes: [
                'rol',
                [Usuario.sequelize.fn('COUNT', Usuario.sequelize.col('id')), 'count']
            ],
            where: { activo: true },
            group: ['rol'],
            raw: true
        });
        
        const formattedStats = {
            total: 0,
            administradores: 0,
            medicos: 0,
            recepcionistas: 0
        };
        
        stats.forEach(stat => {
            formattedStats.total += parseInt(stat.count);
            formattedStats[stat.rol + 's'] = parseInt(stat.count);
        });
        
        res.json(formattedStats);
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
