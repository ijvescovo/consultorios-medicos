# ===================================================================
# GUÍA COMPLETA: CONECTAR BASE DE DATOS POSTGRESQL
# ===================================================================

## 📋 PASO 1: INSTALAR POSTGRESQL
1. Descargar PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Instalar con estas configuraciones:
   - Puerto: 5432
   - Usuario: postgres
   - Contraseña: (elige una segura, ejemplo: PostgresAdmin2024!)
   - Instalar pgAdmin 4 (interfaz gráfica)

## 🔧 PASO 2: CONFIGURAR POSTGRESQL
1. Abrir pgAdmin 4
2. Conectar al servidor local
3. Crear una nueva base de datos:
   - Nombre: consultorio_medico
   - Owner: postgres

## 📦 PASO 3: INSTALAR DEPENDENCIAS DEL BACKEND
Abrir PowerShell en la carpeta backend y ejecutar:

```powershell
cd e:\ConsultoriosMedicos\backend
npm install
```

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO
Editar el archivo .env con tus datos reales:

```env
# Cambiar estos valores por los tuyos:
DB_PASSWORD=TU_PASSWORD_POSTGRESQL_AQUI
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_gmail
```

## 🗄️ PASO 5: CREAR LA ESTRUCTURA DE BASE DE DATOS
Ejecutar el script de migración:

```powershell
cd e:\ConsultoriosMedicos\backend
node scripts/migrate.js
```

Este script va a:
✅ Crear todas las tablas
✅ Crear índices optimizados
✅ Configurar triggers de auditoría
✅ Crear usuario administrador inicial

## 🚀 PASO 6: INICIAR EL SERVIDOR
```powershell
cd e:\ConsultoriosMedicos\backend
npm run dev
```

## 🔍 PASO 7: VERIFICAR LA CONEXIÓN
1. El servidor debe mostrar: "📊 Base de datos PostgreSQL conectada"
2. Ir a: http://localhost:5000/api/auth/login
3. Probar login con:
   - Email: admin@consultorio.com
   - Password: Admin123!

## 🎯 PASO 8: CONECTAR EL FRONTEND
1. Abrir el frontend: e:\ConsultoriosMedicos\frontend\index.html
2. Ir a la página de login
3. Probar el login con las credenciales del administrador

## 🛠️ COMANDOS ÚTILES

### Ver logs de la base de datos:
```sql
-- En pgAdmin, ejecutar:
SELECT * FROM auditoria ORDER BY timestamp DESC LIMIT 10;
```

### Ver estadísticas:
```sql
-- En pgAdmin, ejecutar:
SELECT estadisticas_dashboard();
```

### Backup manual:
```powershell
pg_dump -h localhost -U postgres -d consultorio_medico -f "backup_$(Get-Date -Format 'yyyyMMdd').sql"
```

## ❗ SOLUCIÓN DE PROBLEMAS

### Error: "no se puede conectar a PostgreSQL"
1. Verificar que PostgreSQL esté ejecutándose:
   - Servicios de Windows → PostgreSQL debe estar "Ejecutándose"
2. Verificar puerto 5432 abierto:
   ```powershell
   netstat -an | findstr 5432
   ```

### Error: "base de datos no existe"
```powershell
# Recrear la base de datos:
node scripts/migrate.js
```

### Error: "credenciales inválidas"
1. Verificar .env con password correcto
2. Verificar que el usuario postgres existe en PostgreSQL

## 📊 MONITOREO DE PERFORMANCE

### Ver conexiones activas:
```sql
SELECT count(*) as conexiones_activas FROM pg_stat_activity WHERE state = 'active';
```

### Ver tamaño de base de datos:
```sql
SELECT pg_size_pretty(pg_database_size('consultorio_medico')) as tamaño_bd;
```

## 🔒 CONFIGURACIÓN DE SEGURIDAD

1. **Cambiar passwords por defecto**
2. **Configurar SSL en producción**
3. **Limitar conexiones por IP**
4. **Configurar backups automáticos**

## ✅ CHECKLIST FINAL

- [ ] PostgreSQL instalado y ejecutándose
- [ ] Base de datos "consultorio_medico" creada
- [ ] Variables .env configuradas
- [ ] Script migrate.js ejecutado exitosamente
- [ ] Servidor backend iniciado sin errores
- [ ] Login funcionando desde frontend
- [ ] Usuario administrador creado
- [ ] Auditoría funcionando
