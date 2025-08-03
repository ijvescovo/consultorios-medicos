// Modelos de Sequelize para el sistema de consultorio médico
// Configuración optimizada para PostgreSQL

const { Sequelize, DataTypes } = require('sequelize');

// Configuración de conexión con pool optimizado
const sequelize = new Sequelize(
    process.env.DB_NAME || 'consultorio_medico',
    process.env.DB_USER || 'consultorio_admin',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        
        // Pool de conexiones optimizado para 38 usuarios concurrentes
        pool: {
            max: 50,        // Máximo de conexiones
            min: 10,        // Mínimo de conexiones activas
            acquire: 60000, // Tiempo máximo para obtener conexión
            idle: 10000,    // Tiempo antes de liberar conexión inactiva
            evict: 1000     // Intervalo de limpieza de conexiones
        },
        
        // Configuraciones de rendimiento
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false,
            connectTimeout: 60000,
            requestTimeout: 30000,
            pool: {
                max: 50,
                min: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            }
        },
        
        // Hooks para auditoría automática
        hooks: {
            beforeUpdate: (instance, options) => {
                if (options.transaction) {
                    options.transaction.afterCommit(() => {
                        // Log de auditoría
                        console.log(`Updated ${instance.constructor.name} ID: ${instance.id}`);
                    });
                }
            }
        }
    }
);

// ================================
// MODELO: USUARIO
// ================================
const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [2, 255]
        }
    },
    apellido: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [2, 255]
        }
    },
    rol: {
        type: DataTypes.ENUM('administrador', 'medico', 'recepcionista'),
        allowNull: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acceso: {
        type: DataTypes.DATE
    },
    reset_token: {
        type: DataTypes.STRING(255)
    },
    reset_token_expires: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    // Índices para optimización
    indexes: [
        {
            unique: true,
            fields: ['email'],
            where: { activo: true }
        },
        {
            fields: ['rol'],
            where: { activo: true }
        }
    ],
    
    // Scopes para consultas frecuentes
    scopes: {
        activos: {
            where: { activo: true }
        },
        medicos: {
            where: { rol: 'medico', activo: true }
        },
        recepcionistas: {
            where: { rol: 'recepcionista', activo: true }
        }
    }
});

// Métodos de instancia para Usuario
const bcrypt = require('bcryptjs');

Usuario.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

Usuario.prototype.setPassword = async function(password) {
    const saltRounds = 12;
    this.password_hash = await bcrypt.hash(password, saltRounds);
};

// Hook para hashear contraseña antes de crear
Usuario.beforeCreate(async (usuario) => {
    if (usuario.password_hash && !usuario.password_hash.startsWith('$2a$')) {
        const saltRounds = 12;
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, saltRounds);
    }
});

// Hook para hashear contraseña antes de actualizar
Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('password_hash') && !usuario.password_hash.startsWith('$2a$')) {
        const saltRounds = 12;
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, saltRounds);
    }
});

// ================================
// MODELO: MÉDICO
// ================================
const Medico = sequelize.define('Medico', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    matricula: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    especialidad: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    consultorio: {
        type: DataTypes.STRING(50)
    },
    horario_inicio: {
        type: DataTypes.TIME
    },
    horario_fin: {
        type: DataTypes.TIME
    },
    dias_atencion: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // [1,2,3,4,5] = Lun-Vie
        defaultValue: [1, 2, 3, 4, 5]
    }
}, {
    tableName: 'medicos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    
    indexes: [
        {
            unique: true,
            fields: ['matricula']
        },
        {
            fields: ['especialidad']
        }
    ]
});

// ================================
// MODELO: PACIENTE
// ================================
const Paciente = sequelize.define('Paciente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dni: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    sexo: {
        type: DataTypes.CHAR(1),
        validate: {
            isIn: [['M', 'F']]
        }
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    email: {
        type: DataTypes.STRING(255),
        validate: {
            isEmail: true
        }
    },
    direccion: {
        type: DataTypes.TEXT
    },
    obra_social: {
        type: DataTypes.STRING(255)
    },
    numero_afiliado: {
        type: DataTypes.STRING(50)
    },
    medico_cabecera_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Medico,
            key: 'id'
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
        {
            unique: true,
            fields: ['dni']
        },
        {
            fields: ['nombre', 'apellido']
        },
        {
            fields: ['medico_cabecera_id'],
            where: { activo: true }
        }
    ],
    
    scopes: {
        activos: {
            where: { activo: true }
        },
        porMedico: (medicoId) => ({
            where: { medico_cabecera_id: medicoId, activo: true }
        })
    }
});

// ================================
// MODELO: TURNO
// ================================
const Turno = sequelize.define('Turno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Paciente,
            key: 'id'
        }
    },
    medico_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Medico,
            key: 'id'
        }
    },
    fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duracion_minutos: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    estado: {
        type: DataTypes.ENUM('programado', 'confirmado', 'en_curso', 'completado', 'cancelado', 'no_asistio'),
        defaultValue: 'programado'
    },
    motivo: {
        type: DataTypes.TEXT
    },
    observaciones: {
        type: DataTypes.TEXT
    },
    created_by: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'id'
        }
    }
}, {
    tableName: 'turnos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
        {
            fields: ['fecha_hora', 'medico_id']
        },
        {
            fields: ['paciente_id', 'fecha_hora']
        },
        {
            fields: ['medico_id', 'estado', 'fecha_hora']
        }
    ],
    
    scopes: {
        hoy: {
            where: {
                fecha_hora: {
                    [Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
                    [Sequelize.Op.lt]: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        },
        activos: {
            where: {
                estado: {
                    [Sequelize.Op.in]: ['programado', 'confirmado', 'en_curso']
                }
            }
        },
        porMedico: (medicoId) => ({
            where: { medico_id: medicoId }
        })
    }
});

// ================================
// MODELO: HISTORIAL MÉDICO
// ================================
const HistorialMedico = sequelize.define('HistorialMedico', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Paciente,
            key: 'id'
        }
    },
    medico_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Medico,
            key: 'id'
        }
    },
    turno_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Turno,
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    motivo_consulta: {
        type: DataTypes.TEXT
    },
    diagnostico: {
        type: DataTypes.TEXT
    },
    tratamiento: {
        type: DataTypes.TEXT
    },
    observaciones: {
        type: DataTypes.TEXT
    },
    adjuntos: {
        type: DataTypes.JSONB // Para referencias a archivos
    }
}, {
    tableName: 'historiales_medicos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    
    indexes: [
        {
            fields: ['paciente_id', 'fecha']
        },
        {
            fields: ['medico_id', 'fecha']
        }
    ]
});

// ================================
// MODELO: AUDITORÍA
// ================================
const Auditoria = sequelize.define('Auditoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tabla_afectada: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    registro_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    accion: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    datos_anteriores: {
        type: DataTypes.JSONB
    },
    datos_nuevos: {
        type: DataTypes.JSONB
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    ip_address: {
        type: DataTypes.INET
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'auditoria',
    timestamps: false
});

// ================================
// RELACIONES
// ================================

// Usuario - Médico (1:1)
Usuario.hasOne(Medico, { foreignKey: 'usuario_id', as: 'medico' });
Medico.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Médico - Paciente (1:N) - Médico de cabecera
Medico.hasMany(Paciente, { foreignKey: 'medico_cabecera_id', as: 'pacientes' });
Paciente.belongsTo(Medico, { foreignKey: 'medico_cabecera_id', as: 'medicoCabecera' });

// Paciente - Turno (1:N)
Paciente.hasMany(Turno, { foreignKey: 'paciente_id', as: 'turnos' });
Turno.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

// Médico - Turno (1:N)
Medico.hasMany(Turno, { foreignKey: 'medico_id', as: 'turnos' });
Turno.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

// Usuario - Turno (1:N) - Creado por
Usuario.hasMany(Turno, { foreignKey: 'created_by', as: 'turnosCreados' });
Turno.belongsTo(Usuario, { foreignKey: 'created_by', as: 'creadoPor' });

// Paciente - HistorialMedico (1:N)
Paciente.hasMany(HistorialMedico, { foreignKey: 'paciente_id', as: 'historiales' });
HistorialMedico.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

// Médico - HistorialMedico (1:N)
Medico.hasMany(HistorialMedico, { foreignKey: 'medico_id', as: 'historiales' });
HistorialMedico.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

// Turno - HistorialMedico (1:1)
Turno.hasOne(HistorialMedico, { foreignKey: 'turno_id', as: 'historial' });
HistorialMedico.belongsTo(Turno, { foreignKey: 'turno_id', as: 'turno' });

// Usuario - Auditoría (1:N)
Usuario.hasMany(Auditoria, { foreignKey: 'usuario_id', as: 'auditorias' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// ================================
// FUNCIONES AUXILIARES
// ================================

// Función para estadísticas del dashboard
const obtenerEstadisticasDashboard = async (medicoId = null) => {
    const whereCondition = medicoId ? { medico_id: medicoId } : {};
    const whereConditionPacientes = medicoId ? { medico_cabecera_id: medicoId } : {};
    
    const [turnosHoy, turnosSemana, pacientesActivos, consultasMes] = await Promise.all([
        Turno.count({
            where: {
                ...whereCondition,
                fecha_hora: {
                    [Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
                    [Sequelize.Op.lt]: new Date(new Date().setHours(23, 59, 59, 999))
                },
                estado: {
                    [Sequelize.Op.in]: ['programado', 'confirmado']
                }
            }
        }),
        
        Turno.count({
            where: {
                ...whereCondition,
                fecha_hora: {
                    [Sequelize.Op.gte]: new Date(),
                    [Sequelize.Op.lt]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                estado: {
                    [Sequelize.Op.in]: ['programado', 'confirmado']
                }
            }
        }),
        
        Paciente.count({
            where: {
                ...whereConditionPacientes,
                activo: true
            }
        }),
        
        HistorialMedico.count({
            where: {
                ...whereCondition,
                fecha: {
                    [Sequelize.Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        })
    ]);
    
    return {
        turnos_hoy: turnosHoy,
        turnos_semana: turnosSemana,
        pacientes_activos: pacientesActivos,
        consultas_mes: consultasMes
    };
};

// Sincronización y exportación
const sincronizarBaseDatos = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente.');
        
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('🔄 Modelos sincronizados con la base de datos.');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        return false;
    }
};

module.exports = {
    sequelize,
    Usuario,
    Medico,
    Paciente,
    Turno,
    HistorialMedico,
    Auditoria,
    obtenerEstadisticasDashboard,
    sincronizarBaseDatos
};
