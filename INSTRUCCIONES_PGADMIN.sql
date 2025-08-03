-- ============================================================
-- INSTRUCCIONES PARA CREAR BASE DE DATOS EN pgAdmin
-- ============================================================

-- PASO 1: Crear la base de datos
-- En pgAdmin:
-- 1. Click derecho en "Databases"
-- 2. Seleccionar "Create" > "Database"
-- 3. Nombre: consultorio_medico
-- 4. Owner: postgres
-- 5. Click "Save"

-- PASO 2: Ejecutar este script en pgAdmin
-- 1. Click derecho en "consultorio_medico"
-- 2. Seleccionar "Query Tool"
-- 3. Copiar y pegar TODO el contenido de schema.sql
-- 4. Click en "Execute" (F5)

-- PASO 3: Crear usuario administrador
-- Ejecutar este comando después del schema:

INSERT INTO usuarios (email, password_hash, nombre, apellido, rol)
VALUES (
    'admin@consultorio.com',
    '$2b$10$K7L1OxVGBxJ2uVY8FW.oKe.dNKw1YJG5.eLW8/GWyGwmVWLWjWt.m', -- Password: Admin123!
    'Administrador',
    'Sistema',
    'administrador'
);

-- VERIFICAR QUE TODO FUNCIONA:
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Debe mostrar todas estas tablas:
-- auditoria
-- historiales_2024
-- historiales_2025
-- historiales_medicos
-- medicos
-- pacientes
-- recetas
-- turnos
-- usuarios

-- ============================================================
-- ALTERNATIVA: USAR LA LÍNEA DE COMANDOS
-- ============================================================

-- Si tienes problemas con pgAdmin, usa esto en PowerShell:

-- 1. Agregar PostgreSQL al PATH:
-- $env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

-- 2. Crear base de datos:
-- createdb -h localhost -U postgres consultorio_medico

-- 3. Ejecutar schema:
-- psql -h localhost -U postgres -d consultorio_medico -f "e:\ConsultoriosMedicos\database\schema.sql"
