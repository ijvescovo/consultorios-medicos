-- Esquema de Base de Datos para Consultorio Médico - CORREGIDO
-- Optimizado para 100,000+ pacientes y alta concurrencia

-- 1. CREAR TIPOS ENUM PRIMERO
CREATE TYPE usuario_rol AS ENUM ('administrador', 'medico', 'recepcionista');
CREATE TYPE estado_turno AS ENUM ('programado', 'confirmado', 'en_curso', 'completado', 'cancelado', 'no_asistio');

-- 2. USUARIOS Y AUTENTICACIÓN
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    rol usuario_rol NOT NULL,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MÉDICOS (Información específica)
CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    especialidad VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    consultorio VARCHAR(50),
    horario_inicio TIME,
    horario_fin TIME,
    dias_atencion INTEGER[], -- Array: [1,2,3,4,5] = Lun-Vie
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PACIENTES (Tabla principal)
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    obra_social VARCHAR(255),
    numero_afiliado VARCHAR(50),
    medico_cabecera_id INTEGER REFERENCES medicos(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TURNOS (Optimizada para alta frecuencia)
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) NOT NULL,
    medico_id INTEGER REFERENCES medicos(id) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    estado estado_turno DEFAULT 'programado',
    motivo TEXT,
    observaciones TEXT,
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. HISTORIALES MÉDICOS (SIN particionado para evitar problemas)
CREATE TABLE historiales_medicos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) NOT NULL,
    medico_id INTEGER REFERENCES medicos(id) NOT NULL,
    turno_id INTEGER REFERENCES turnos(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT,
    diagnostico TEXT,
    tratamiento TEXT,
    observaciones TEXT,
    adjuntos JSONB, -- Para referencias a archivos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. RECETAS MÉDICAS
CREATE TABLE recetas (
    id SERIAL PRIMARY KEY,
    historial_id INTEGER REFERENCES historiales_medicos(id) NOT NULL,
    numero_receta VARCHAR(50) UNIQUE NOT NULL,
    medicamentos JSONB NOT NULL, -- Array de medicamentos
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE,
    codigo_qr VARCHAR(255),
    firma_digital TEXT,
    dispensada BOOLEAN DEFAULT false,
    farmacia_dispensada VARCHAR(255),
    fecha_dispensacion TIMESTAMP
);

-- 8. AUDITORÍA (Para trazabilidad)
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id INTEGER NOT NULL,
    accion VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    usuario_id INTEGER REFERENCES usuarios(id),
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES OPTIMIZADOS
-- Índices para búsquedas frecuentes
CREATE INDEX idx_pacientes_dni ON pacientes(dni);
CREATE INDEX idx_pacientes_nombre_apellido ON pacientes(nombre, apellido);
CREATE INDEX idx_pacientes_medico_cabecera ON pacientes(medico_cabecera_id) WHERE activo = true;

-- Índices para turnos (consultas más frecuentes)
CREATE INDEX idx_turnos_fecha_medico ON turnos(fecha_hora, medico_id);
CREATE INDEX idx_turnos_paciente_fecha ON turnos(paciente_id, fecha_hora DESC);
CREATE INDEX idx_turnos_medico_estado_fecha ON turnos(medico_id, estado, fecha_hora);

-- Índices para historiales
CREATE INDEX idx_historiales_paciente_fecha ON historiales_medicos(paciente_id, fecha DESC);
CREATE INDEX idx_historiales_medico_fecha ON historiales_medicos(medico_id, fecha DESC);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email) WHERE activo = true;
CREATE INDEX idx_usuarios_rol ON usuarios(rol) WHERE activo = true;

-- TRIGGERS PARA AUDITORÍA
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria(tabla_afectada, registro_id, accion, datos_anteriores, usuario_id)
        VALUES(TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), 
               CASE WHEN current_setting('app.user_id', true) = '' THEN NULL 
                    ELSE current_setting('app.user_id', true)::integer END);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria(tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id)
        VALUES(TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW),
               CASE WHEN current_setting('app.user_id', true) = '' THEN NULL 
                    ELSE current_setting('app.user_id', true)::integer END);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria(tabla_afectada, registro_id, accion, datos_nuevos, usuario_id)
        VALUES(TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
               CASE WHEN current_setting('app.user_id', true) = '' THEN NULL 
                    ELSE current_setting('app.user_id', true)::integer END);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a tablas críticas
CREATE TRIGGER audit_pacientes AFTER INSERT OR UPDATE OR DELETE ON pacientes FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_turnos AFTER INSERT OR UPDATE OR DELETE ON turnos FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_historiales AFTER INSERT OR UPDATE OR DELETE ON historiales_medicos FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- FUNCIÓN PARA ESTADÍSTICAS RÁPIDAS
CREATE OR REPLACE FUNCTION estadisticas_dashboard(medico_id_param INTEGER DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'turnos_hoy', (
            SELECT COUNT(*) FROM turnos 
            WHERE DATE(fecha_hora) = CURRENT_DATE 
            AND ($1 IS NULL OR medico_id = $1)
            AND estado IN ('programado', 'confirmado')
        ),
        'turnos_semana', (
            SELECT COUNT(*) FROM turnos 
            WHERE fecha_hora >= CURRENT_DATE 
            AND fecha_hora < CURRENT_DATE + INTERVAL '7 days'
            AND ($1 IS NULL OR medico_id = $1)
            AND estado IN ('programado', 'confirmado')
        ),
        'pacientes_activos', (
            SELECT COUNT(*) FROM pacientes 
            WHERE activo = true 
            AND ($1 IS NULL OR medico_cabecera_id = $1)
        ),
        'consultas_mes', (
            SELECT COUNT(*) FROM historiales_medicos 
            WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)
            AND ($1 IS NULL OR medico_id = $1)
        )
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- INSERTAR USUARIO ADMINISTRADOR POR DEFECTO
INSERT INTO usuarios (email, password_hash, nombre, apellido, rol)
VALUES (
    'admin@consultorio.com',
    '$2b$10$K7L1OxVGBxJ2uVY8FW.oKe.dNKw1YJG5.eLW8/GWyGwmVWLWjWt.m', -- Password: Admin123!
    'Administrador',
    'Sistema',
    'administrador'
);

-- VERIFICAR INSTALACIÓN
SELECT 'Base de datos creada exitosamente' as mensaje;
SELECT 'Usuario admin creado: admin@consultorio.com / Admin123!' as credenciales;
