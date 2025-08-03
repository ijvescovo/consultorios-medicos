-- ==========================================
-- SCHEMA PARA CONSULTORIO MÉDICO - SUPABASE
-- ==========================================

-- Habilitar Row Level Security por defecto
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ==========================================
-- 1. TABLA DE USUARIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'doctor', 'recepcionista')),
    activo BOOLEAN DEFAULT true,
    permisos JSONB DEFAULT '{}',
    debe_cambiar_password BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

-- Política: Solo admins pueden ver todos los usuarios
CREATE POLICY "Admins pueden ver todos los usuarios" ON usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text 
            AND rol = 'admin'
        )
    );

-- ==========================================
-- 2. TABLA DE MÉDICOS
-- ==========================================
CREATE TABLE IF NOT EXISTS medicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    consultorio VARCHAR(50),
    horario_inicio TIME DEFAULT '08:00',
    horario_fin TIME DEFAULT '18:00',
    dias_atencion JSONB DEFAULT '["lunes","martes","miercoles","jueves","viernes"]',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;

-- Política: Médicos solo ven su propia información
CREATE POLICY "Médicos ven su propia info" ON medicos
    FOR ALL USING (
        auth.uid()::text = usuario_id::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text 
            AND rol IN ('admin', 'recepcionista')
        )
    );

-- ==========================================
-- 3. TABLA DE PACIENTES
-- ==========================================
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro')),
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    obra_social VARCHAR(100),
    numero_afiliado VARCHAR(50),
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(20),
    medico_asignado_id UUID REFERENCES medicos(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Política: Médicos ven solo sus pacientes asignados
CREATE POLICY "Médicos ven sus pacientes" ON pacientes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medicos m 
            WHERE m.usuario_id::text = auth.uid()::text 
            AND m.id = medico_asignado_id
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text 
            AND rol IN ('admin', 'recepcionista')
        )
    );

-- ==========================================
-- 4. TABLA DE CITAS
-- ==========================================
CREATE TABLE IF NOT EXISTS citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES medicos(id) ON DELETE CASCADE,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
    motivo_consulta TEXT,
    notas TEXT,
    precio DECIMAL(10,2),
    pagado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- Política: Médicos ven solo sus citas
CREATE POLICY "Médicos ven sus citas" ON citas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medicos m 
            WHERE m.usuario_id::text = auth.uid()::text 
            AND m.id = medico_id
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text 
            AND rol IN ('admin', 'recepcionista')
        )
    );

-- ==========================================
-- 5. TABLA DE HISTORIALES MÉDICOS
-- ==========================================
CREATE TABLE IF NOT EXISTS historiales_medicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES medicos(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnostico TEXT,
    tratamiento TEXT,
    medicamentos JSONB DEFAULT '[]',
    observaciones TEXT,
    adjuntos JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Particionamiento por año para historiales
-- CREATE TABLE historiales_medicos_2024 PARTITION OF historiales_medicos 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
-- CREATE TABLE historiales_medicos_2025 PARTITION OF historiales_medicos 
-- FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

ALTER TABLE historiales_medicos ENABLE ROW LEVEL SECURITY;

-- Política: Médicos ven historiales de sus pacientes
CREATE POLICY "Médicos ven historiales de sus pacientes" ON historiales_medicos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medicos m 
            WHERE m.usuario_id::text = auth.uid()::text 
            AND m.id = medico_id
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text 
            AND rol IN ('admin')
        )
    );

-- ==========================================
-- 6. TABLA DE AUDITORÍA
-- ==========================================
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solo admins pueden ver logs
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo admins ven logs" ON logs_auditoria
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text 
            AND rol = 'admin'
        )
    );

-- ==========================================
-- 7. ÍNDICES PARA RENDIMIENTO
-- ==========================================

-- Índices de búsqueda frecuente
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_medicos_usuario_id ON medicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_medico ON pacientes(medico_asignado_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_id, fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historiales_paciente ON historiales_medicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historiales_fecha ON historiales_medicos(fecha);

-- Índice para búsqueda de texto completo en pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_busqueda ON pacientes 
USING gin(to_tsvector('spanish', nombre || ' ' || apellido || ' ' || dni));

-- ==========================================
-- 8. TRIGGERS PARA TIMESTAMPS
-- ==========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicos_updated_at BEFORE UPDATE ON medicos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_historiales_updated_at BEFORE UPDATE ON historiales_medicos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. DATOS INICIALES (OPCIONAL)
-- ==========================================

-- Insertar usuario admin inicial
INSERT INTO usuarios (id, email, password_hash, nombre, apellido, rol, debe_cambiar_password)
VALUES (
    gen_random_uuid(),
    'admin@consultorio.com',
    crypt('Admin123!', gen_salt('bf')),
    'Administrador',
    'Principal',
    'admin',
    false
) ON CONFLICT (email) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE medicos IS 'Información específica de médicos';
COMMENT ON TABLE pacientes IS 'Registro de pacientes';
COMMENT ON TABLE citas IS 'Programación de citas médicas';
COMMENT ON TABLE historiales_medicos IS 'Historiales clínicos de pacientes';
COMMENT ON TABLE logs_auditoria IS 'Registro de auditoría del sistema';
