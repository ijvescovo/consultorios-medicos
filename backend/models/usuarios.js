const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('admin', 'doctor', 'recepcionista'),
        allowNull: false
    },
    permisos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
    },
    intentos_fallidos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bloqueado_hasta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    razon_bloqueo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    debe_cambiar_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    matricula: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.password) {
                const salt = await bcrypt.genSalt(12);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('password')) {
                const salt = await bcrypt.genSalt(12);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    }
});

Usuario.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Métodos para administración
Usuario.prototype.tienePermiso = function(permiso) {
    return this.permisos && this.permisos.includes(permiso);
};

Usuario.prototype.estaBloqueado = function() {
    return !this.activo || (this.bloqueado_hasta && new Date() < this.bloqueado_hasta);
};

Usuario.prototype.actualizarUltimoAcceso = async function() {
    this.ultimo_acceso = new Date();
    this.intentos_fallidos = 0;
    await this.save();
};

Usuario.prototype.incrementarIntentosFallidos = async function() {
    this.intentos_fallidos += 1;
    
    // Bloquear después de 3 intentos fallidos
    if (this.intentos_fallidos >= 3) {
        this.bloqueado_hasta = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
        this.razon_bloqueo = 'Demasiados intentos fallidos de login';
    }
    
    await this.save();
};

// Método estático para crear usuario con permisos por defecto
Usuario.crearConPermisos = async function(userData) {
    const permisosPorRol = {
        'admin': [
            'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'usuarios.ver',
            'pacientes.crear', 'pacientes.editar', 'pacientes.eliminar', 'pacientes.ver',
            'turnos.crear', 'turnos.editar', 'turnos.eliminar', 'turnos.ver',
            'historiales.crear', 'historiales.editar', 'historiales.ver',
            'recetas.crear', 'recetas.editar', 'recetas.ver',
            'reportes.ver', 'configuracion.editar'
        ],
        'doctor': [
            'pacientes.crear', 'pacientes.editar', 'pacientes.ver',
            'turnos.ver', 'turnos.editar',
            'historiales.crear', 'historiales.editar', 'historiales.ver',
            'recetas.crear', 'recetas.editar', 'recetas.ver'
        ],
        'recepcionista': [
            'pacientes.crear', 'pacientes.editar', 'pacientes.ver',
            'turnos.crear', 'turnos.editar', 'turnos.ver'
        ]
    };

    userData.permisos = userData.permisos || permisosPorRol[userData.rol] || [];
    return await Usuario.create(userData);
};

module.exports = Usuario;