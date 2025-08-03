-- Script de respaldo y mantenimiento para PostgreSQL
-- Diseñado para consultorios médicos con alta concurrencia

-- =========================
-- CONFIGURACIÓN DE BACKUPS
-- =========================

-- 1. BACKUP COMPLETO DIARIO (Automatizar con cron/Task Scheduler)
-- Comando para Windows PowerShell:
-- pg_dump -h localhost -U consultorio_admin -d consultorio_medico -f "backup_completo_$(Get-Date -Format 'yyyyMMdd').sql" --verbose

-- 2. BACKUP INCREMENTAL (WAL - Write Ahead Log)
-- En postgresql.conf ya configurado:
-- wal_level = replica
-- archive_mode = on
-- archive_command = 'copy "%p" "C:\\PostgreSQL\\archives\\%f"'

-- 3. SCRIPT DE RESPALDO AUTOMÁTICO (PowerShell)
/*
# backup_automatico.ps1
$fecha = Get-Date -Format "yyyyMMdd_HHmm"
$ruta_backup = "C:\Backups\Consultorio"
$database = "consultorio_medico"

# Crear directorio si no existe
if (!(Test-Path $ruta_backup)) {
    New-Item -ItemType Directory -Path $ruta_backup -Force
}

# Backup completo de estructura y datos
pg_dump -h localhost -U consultorio_admin -d $database -f "$ruta_backup\backup_completo_$fecha.sql" --verbose

# Backup solo de datos (más rápido para recuperación)
pg_dump -h localhost -U consultorio_admin -d $database -a -f "$ruta_backup\backup_datos_$fecha.sql" --verbose

# Comprimir backups
Compress-Archive -Path "$ruta_backup\backup_*_$fecha.sql" -DestinationPath "$ruta_backup\backup_$fecha.zip"

# Eliminar backups no comprimidos
Remove-Item "$ruta_backup\backup_*_$fecha.sql"

# Limpiar backups antiguos (mantener 30 días)
Get-ChildItem $ruta_backup -Name "backup_*.zip" | Where-Object {
    $_.CreationTime -lt (Get-Date).AddDays(-30)
} | Remove-Item -Force

Write-Host "Backup completado: backup_$fecha.zip"
*/

-- =========================
-- MANTENIMIENTO DE RENDIMIENTO
-- =========================

-- 1. REINDEXACIÓN SEMANAL (Ejecutar fuera de horario de atención)
REINDEX INDEX CONCURRENTLY idx_turnos_fecha_medico;
REINDEX INDEX CONCURRENTLY idx_pacientes_dni;
REINDEX INDEX CONCURRENTLY idx_historiales_paciente_fecha;

-- 2. ANÁLISIS DE ESTADÍSTICAS (Optimizar query planner)
ANALYZE pacientes;
ANALYZE turnos;
ANALYZE historiales_medicos;
ANALYZE usuarios;

-- 3. LIMPIEZA DE DATOS ANTIGUOS (Ejecutar mensualmente)
-- Eliminar tokens de reset vencidos
DELETE FROM usuarios 
WHERE reset_token_expires < CURRENT_TIMESTAMP - INTERVAL '1 day';

-- Archivar turnos cancelados antiguos (más de 2 años)
CREATE TABLE IF NOT EXISTS turnos_archivo (LIKE turnos INCLUDING ALL);

INSERT INTO turnos_archivo 
SELECT * FROM turnos 
WHERE estado IN ('cancelado', 'no_asistio') 
AND created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';

DELETE FROM turnos 
WHERE estado IN ('cancelado', 'no_asistio') 
AND created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';

-- 4. VACUUM Y LIMPIEZA DE ESPACIO
VACUUM ANALYZE pacientes;
VACUUM ANALYZE turnos;
VACUUM ANALYZE historiales_medicos;

-- =========================
-- MONITOREO DE PERFORMANCE
-- =========================

-- 1. QUERIES PARA DETECTAR PROBLEMAS
-- Consultas lentas activas
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state = 'active';

-- Tamaño de tablas principales
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Índices no utilizados (revisar y eliminar)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Conexiones activas por usuario
SELECT 
    usename,
    count(*) as connections,
    state
FROM pg_stat_activity
WHERE state IS NOT NULL
GROUP BY usename, state
ORDER BY connections DESC;

-- =========================
-- PROCEDIMIENTOS DE RECUPERACIÓN
-- =========================

-- 1. RECUPERACIÓN COMPLETA
-- Para restaurar desde backup completo:
-- psql -h localhost -U consultorio_admin -d consultorio_medico_nuevo -f backup_completo_20241220.sql

-- 2. RECUPERACIÓN POINT-IN-TIME
-- Para recuperar hasta un momento específico:
-- pg_basebackup -h localhost -D recovery_data -U replication_user -v -P -W -R
-- Editar recovery.conf:
-- restore_command = 'copy "C:\\PostgreSQL\\archives\\%f" "%p"'
-- recovery_target_time = '2024-12-20 15:30:00'

-- 3. VERIFICACIÓN DE INTEGRIDAD
-- Verificar consistencia de datos después de recuperación
SELECT 
    'Pacientes' as tabla,
    COUNT(*) as registros,
    COUNT(DISTINCT dni) as dni_unicos,
    COUNT(*) - COUNT(DISTINCT dni) as posibles_duplicados
FROM pacientes
UNION ALL
SELECT 
    'Turnos' as tabla,
    COUNT(*) as registros,
    COUNT(*) FILTER (WHERE fecha_hora > CURRENT_TIMESTAMP) as turnos_futuros,
    COUNT(*) FILTER (WHERE estado = 'programado') as programados
FROM turnos
UNION ALL
SELECT 
    'Usuarios' as tabla,
    COUNT(*) as registros,
    COUNT(*) FILTER (WHERE activo = true) as activos,
    COUNT(DISTINCT email) as emails_unicos
FROM usuarios;

-- =========================
-- CONFIGURACIÓN DE ALERTAS
-- =========================

-- Script para monitoreo automático (PowerShell + SQL)
/*
# monitoreo_consultorio.ps1
$conexion = "Server=localhost;Database=consultorio_medico;User Id=monitor_user;Password=password;"

# Verificar conexiones excesivas
$conexiones = Invoke-Sqlcmd -Query "SELECT count(*) as total FROM pg_stat_activity WHERE state = 'active'" -ConnectionString $conexion

if ($conexiones.total -gt 150) {
    Send-MailMessage -To "admin@consultorio.com" -Subject "ALERTA: Muchas conexiones activas" -Body "Conexiones activas: $($conexiones.total)" -SmtpServer "smtp.consultorio.com"
}

# Verificar espacio en disco
$espacio_db = Invoke-Sqlcmd -Query "SELECT pg_database_size('consultorio_medico') as tamaño" -ConnectionString $conexion
$tamaño_gb = [math]::Round($espacio_db.tamaño / 1GB, 2)

if ($tamaño_gb -gt 50) {
    Send-MailMessage -To "admin@consultorio.com" -Subject "ALERTA: Base de datos grande" -Body "Tamaño de BD: $tamaño_gb GB" -SmtpServer "smtp.consultorio.com"
}

Write-Host "Monitoreo completado. BD: $tamaño_gb GB, Conexiones: $($conexiones.total)"
*/
