# 🏥 Sistema de Consultorios Médicos

Sistema completo de gestión para consultorios médicos con panel administrativo avanzado, gestión de pacientes, citas y historiales médicos.

## 🚀 Características Principales

- ✅ **Panel de Administración** tipo Active Directory
- ✅ **Gestión de Usuarios** (Admins, Doctores, Recepcionistas)
- ✅ **Gestión de Pacientes** completa
- ✅ **Sistema de Citas** con calendario
- ✅ **Historiales Médicos** detallados
- ✅ **Auditoría y Logs** de actividad
- ✅ **Base de datos en la nube** (Supabase)
- ✅ **Autenticación JWT** segura
- ✅ **Responsive Design**

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL en la nube)
- **JWT** para autenticación
- **bcrypt** para encriptación
- **CORS** y middlewares de seguridad

### Frontend
- **HTML5** + **CSS3** + **JavaScript**
- **Chart.js** para gráficos y estadísticas
- **FontAwesome** para iconografía
- **Responsive Design**

### Base de Datos
- **PostgreSQL** (via Supabase)
- **Row Level Security** (RLS)
- **Índices optimizados** para rendimiento
- **Triggers** para auditoría automática

## 📋 Requisitos Previos

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Cuenta en Supabase** (gratuita)

## ⚙️ Instalación

### 1. Clonar el repositorio
```bash
git clone [URL_DEL_REPO]
cd ConsultoriosMedicos
```

### 2. Instalar dependencias
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus datos de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key
JWT_SECRET=tu-jwt-secret
```

### 4. Configurar base de datos
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el schema: `database/supabase-schema.sql`
3. Configurar Row Level Security

### 5. Iniciar el servidor
```bash
npm start
# o para desarrollo
npm run dev
```



### Estructura de URLs
- `/` - Página principal
- `/login.html` - Inicio de sesión
- `/admin-portal.html` - Panel de administración
- `/dashboard.html` - Dashboard principal

## 📊 Estructura del Proyecto

```
ConsultoriosMedicos/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuraciones
│   │   ├── supabase.js     # Cliente Supabase
│   │   └── supabase-adapter.js
│   ├── controllers/        # Lógica de negocio
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── ...
│   ├── middlewares/        # Middlewares
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas de API
│   └── server-full.js     # Servidor principal
├── frontend/              # Frontend estático
│   ├── css/              # Estilos
│   ├── js/               # JavaScript
│   └── *.html           # Páginas HTML
├── database/             # Scripts de BD
│   └── supabase-schema.sql
└── docs/                # Documentación
```

## 🔐 Seguridad

- **JWT** tokens para autenticación
- **Row Level Security** en base de datos
- **bcrypt** para hash de contraseñas
- **CORS** configurado
- **Validación** de inputs
- **Auditoría** completa de acciones

### Buenas Prácticas de Seguridad

#### 1. Configuración de Variables de Entorno
```env
# ✅ Configuración segura
JWT_SECRET=un-secreto-muy-largo-y-aleatorio-de-al-menos-32-caracteres
SUPABASE_SERVICE_KEY=tu-service-key-mantenla-secreta
DATABASE_URL=postgresql://usuario:password@host:5432/db

# ❌ Nunca hagas esto
JWT_SECRET=123456
PASSWORD=admin
```

#### 2. Headers de Seguridad
El servidor configura automáticamente headers de seguridad:
```javascript
// Helmet.js configurado para:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### 3. Validación de Datos
```javascript
// Ejemplo de validación robusta
const validatePatientData = (data) => {
  const schema = {
    firstName: { type: 'string', min: 2, max: 50, pattern: /^[a-zA-ZÀ-ÿ\s]+$/ },
    lastName: { type: 'string', min: 2, max: 50, pattern: /^[a-zA-ZÀ-ÿ\s]+$/ },
    email: { type: 'email', max: 255 },
    dni: { type: 'string', pattern: /^\d{7,8}$/ },
    phone: { type: 'string', pattern: /^\+54\s\d{2}\s\d{4}-\d{4}$/ }
  };
  
  return validateSchema(data, schema);
};
```

#### 4. Rate Limiting
```javascript
// Configuración de límites por endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login
  message: 'Demasiados intentos de login'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas requests'
});
```

#### 5. Sanitización de Datos
```javascript
// Prevenir inyección SQL y XSS
const sanitize = require('sanitize-html');

const cleanInput = (input) => {
  return sanitize(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
};
```

#### 6. Logs de Seguridad
```javascript
// Logging de eventos críticos
const logSecurityEvent = (event, userId, details) => {
  logger.warn({
    type: 'SECURITY_EVENT',
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

// Eventos a loggear:
// - Intentos de login fallidos
// - Accesos a datos sensibles
// - Cambios de permisos
// - Exportación de datos
```

### Checklist de Seguridad

#### Desarrollo
- [ ] Variables de entorno configuradas
- [ ] Validación de inputs implementada
- [ ] Headers de seguridad configurados
- [ ] Rate limiting activado
- [ ] Logs de seguridad funcionando
- [ ] Pruebas de penetración básicas

#### Producción
- [ ] HTTPS configurado (certificado SSL)
- [ ] Base de datos con acceso restringido
- [ ] Backups encriptados
- [ ] Monitoreo de seguridad activo
- [ ] Plan de respuesta a incidentes
- [ ] Auditorías regulares de acceso

## 🚀 Deployment

### Desarrollo Local

```bash
# 1. Instalar dependencias
cd backend && npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con configuraciones locales

# 3. Iniciar base de datos (si usas local)
docker-compose up -d postgres

# 4. Ejecutar migraciones
npm run migrate

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Staging/Testing

```bash
# 1. Build para testing
npm run build

# 2. Variables de entorno para staging
export NODE_ENV=staging
export DATABASE_URL=postgresql://staging_db_url
export JWT_SECRET=staging_jwt_secret

# 3. Ejecutar migraciones en staging
npm run migrate:staging

# 4. Iniciar servidor
npm start
```

### Producción

#### Opción 1: Railway (Recomendado)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login y conectar proyecto
railway login
railway link

# 3. Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu-jwt-super-secreto
railway variables set SUPABASE_URL=tu-supabase-url
railway variables set SUPABASE_SERVICE_KEY=tu-service-key

# 4. Deploy
railway up
```

#### Opción 2: Heroku

```bash
# 1. Instalar Heroku CLI y login
heroku login

# 2. Crear aplicación
heroku create tu-consultorio-api

# 3. Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu-jwt-super-secreto
heroku config:set SUPABASE_URL=tu-supabase-url

# 4. Deploy
git push heroku main

# 5. Ejecutar migraciones
heroku run npm run migrate
```

#### Opción 3: VPS/Servidor Propio

```bash
# 1. Conectar por SSH
ssh usuario@tu-servidor.com

# 2. Instalar Node.js y PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 3. Clonar y configurar proyecto
git clone https://github.com/tu-usuario/consultorios-medicos.git
cd consultorios-medicos/backend
npm install --production

# 4. Configurar variables de entorno
sudo nano /etc/environment
# Agregar variables de producción

# 5. Configurar PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 6. Configurar Nginx como proxy reverso
sudo nano /etc/nginx/sites-available/consultorio
```

**Configuración de Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Opción 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: consultorio_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Frontend Deployment

#### Netlify (Recomendado para Frontend)

```bash
# 1. Build del frontend
cd frontend
npm run build  # Si tienes build process

# 2. Instalar Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=.
```

#### Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel --prod
```

#### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install and Build
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend
```

### Monitoreo y Mantenimiento

#### Health Checks
```javascript
// /api/health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    database: 'connected', // Verificar conexión DB
    memory: process.memoryUsage()
  });
});
```

#### Logging en Producción
```javascript
// Winston configurado para producción
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

#### Backup Strategy
```bash
# Script de backup automático
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="consultorio_db"

# Backup de base de datos
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos (si hay uploads)
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /app/uploads

# Limpiar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.sql" -type f -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +30 -delete

# Ejecutar diariamente con cron:
# 0 2 * * * /path/to/backup.sh
```

### Checklist de Deployment

#### Pre-Deploy
- [ ] Pruebas unitarias pasando
- [ ] Pruebas de integración pasando
- [ ] Variables de entorno configuradas
- [ ] Migraciones de DB preparadas
- [ ] Documentación actualizada
- [ ] Plan de rollback definido

#### Deploy
- [ ] Backup de DB creado
- [ ] Deploy en staging exitoso
- [ ] Migraciones ejecutadas
- [ ] Health checks pasando
- [ ] SSL certificado válido
- [ ] Monitoreo configurado

#### Post-Deploy
- [ ] Funcionalidad crítica verificada
- [ ] Logs monitoreados
- [ ] Performance verificada
- [ ] Usuarios notificados (si hay cambios)
- [ ] Documentación de deployment actualizada

### Troubleshooting

#### Problemas Comunes

**Error de conexión a DB:**
```bash
# Verificar variables de entorno
echo $DATABASE_URL

# Probar conexión manual
psql $DATABASE_URL -c "SELECT 1;"

# Verificar logs
tail -f logs/app.log | grep DATABASE
```

**Error de memoria:**
```bash
# Verificar uso de memoria
free -h
top -p $(pgrep node)

# Aumentar límite de memoria en PM2
pm2 start app.js --max-memory-restart 1G
```

**Error de SSL:**
```bash
# Verificar certificado
openssl s_client -connect tu-dominio.com:443

# Renovar certificado Let's Encrypt
certbot renew --dry-run
```

## 📈 Escalabilidad

Diseñado para soportar:
- ✅ **75,000+ pacientes**
- ✅ **20+ doctores**
- ✅ **12+ administrativos**
- ✅ **Múltiples especialidades**
- ✅ **Alta concurrencia**

## 🔧 API Endpoints

### Autenticación

#### Iniciar Sesión
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "doctor@consultorio.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "doctor@consultorio.com",
      "name": "Dr. Juan Pérez",
      "role": "doctor",
      "specialty": "Cardiología"
    },
    "token": "jwt-token-here",
    "expiresAt": "2025-01-15T10:30:00Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email o contraseña incorrectos"
  }
}
```

#### Verificar Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "uuid-here",
      "email": "doctor@consultorio.com",
      "role": "doctor"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token inválido o expirado"
  }
}
```

### Administración

#### Estadísticas del Dashboard
```http
GET /api/admin/dashboard/stats
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patients": {
      "total": 1250,
      "newThisMonth": 45,
      "activeToday": 23
    },
    "appointments": {
      "today": 18,
      "thisWeek": 127,
      "pending": 8,
      "completed": 119
    },
    "doctors": {
      "total": 12,
      "available": 8,
      "busy": 4
    },
    "revenue": {
      "today": 125000,
      "thisMonth": 2450000,
      "lastMonth": 2200000
    }
  }
}
```

#### Listar Usuarios
```http
GET /api/admin/usuarios?page=1&limit=10&role=doctor&search=juan
Authorization: Bearer {admin-token}
```

**Query Parameters:**
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10, max: 100)
- `role` (optional): Filtrar por rol (admin, doctor, receptionist)
- `search` (optional): Buscar por nombre o email

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-here",
        "email": "doctor@consultorio.com",
        "name": "Dr. Juan Pérez",
        "role": "doctor",
        "specialty": "Cardiología",
        "active": true,
        "lastLogin": "2025-01-10T08:30:00Z",
        "createdAt": "2024-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Crear Usuario
```http
POST /api/admin/usuarios
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "email": "nuevo.doctor@consultorio.com",
  "name": "Dr. María González",
  "password": "password123",
  "role": "doctor",
  "specialty": "Dermatología",
  "phone": "+54 11 1234-5678",
  "licenseNumber": "MN12345"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-uuid-here",
      "email": "nuevo.doctor@consultorio.com",
      "name": "Dr. María González",
      "role": "doctor",
      "specialty": "Dermatología",
      "active": true,
      "createdAt": "2025-01-15T09:15:00Z"
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": [
      {
        "field": "email",
        "message": "El email ya está en uso"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

#### Actualizar Usuario
```http
PUT /api/admin/usuarios/{userId}
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "name": "Dr. Juan Pérez García",
  "specialty": "Cardiología Pediátrica",
  "phone": "+54 11 9876-5432",
  "active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "doctor@consultorio.com",
      "name": "Dr. Juan Pérez García",
      "role": "doctor",
      "specialty": "Cardiología Pediátrica",
      "phone": "+54 11 9876-5432",
      "active": true,
      "updatedAt": "2025-01-15T11:20:00Z"
    }
  }
}
```

### Pacientes

#### Listar Pacientes
```http
GET /api/pacientes?page=1&limit=20&search=garcia&orderBy=name&order=asc
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Número de página
- `limit` (optional): Elementos por página
- `search` (optional): Buscar por nombre, email o DNI
- `orderBy` (optional): Campo para ordenar (name, email, createdAt)
- `order` (optional): Orden (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "patient-uuid",
        "firstName": "Ana",
        "lastName": "García",
        "email": "ana.garcia@email.com",
        "phone": "+54 11 2345-6789",
        "dni": "12345678",
        "birthDate": "1985-03-15",
        "gender": "female",
        "address": {
          "street": "Av. Corrientes 1234",
          "city": "Buenos Aires",
          "province": "CABA",
          "zipCode": "1043"
        },
        "medicalInfo": {
          "bloodType": "O+",
          "allergies": ["Penicilina"],
          "chronicConditions": ["Hipertensión"],
          "emergencyContact": {
            "name": "Carlos García",
            "phone": "+54 11 9876-5432",
            "relationship": "Esposo"
          }
        },
        "lastVisit": "2025-01-08T14:30:00Z",
        "createdAt": "2024-03-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Crear Paciente
```http
POST /api/pacientes
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "firstName": "Pedro",
  "lastName": "Martínez",
  "email": "pedro.martinez@email.com",
  "phone": "+54 11 3456-7890",
  "dni": "87654321",
  "birthDate": "1992-07-22",
  "gender": "male",
  "address": {
    "street": "Av. Santa Fe 5678",
    "city": "Buenos Aires",
    "province": "CABA",
    "zipCode": "1425"
  },
  "medicalInfo": {
    "bloodType": "A-",
    "allergies": [],
    "chronicConditions": [],
    "emergencyContact": {
      "name": "Laura Martínez",
      "phone": "+54 11 5432-1098",
      "relationship": "Hermana"
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "new-patient-uuid",
      "firstName": "Pedro",
      "lastName": "Martínez",
      "email": "pedro.martinez@email.com",
      "dni": "87654321",
      "createdAt": "2025-01-15T12:00:00Z"
    }
  }
}
```

#### Obtener Paciente por ID
```http
GET /api/pacientes/{patientId}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient-uuid",
      "firstName": "Ana",
      "lastName": "García",
      "email": "ana.garcia@email.com",
      "phone": "+54 11 2345-6789",
      "dni": "12345678",
      "birthDate": "1985-03-15",
      "age": 39,
      "gender": "female",
      "address": {
        "street": "Av. Corrientes 1234",
        "city": "Buenos Aires",
        "province": "CABA",
        "zipCode": "1043"
      },
      "medicalInfo": {
        "bloodType": "O+",
        "allergies": ["Penicilina"],
        "chronicConditions": ["Hipertensión"],
        "emergencyContact": {
          "name": "Carlos García",
          "phone": "+54 11 9876-5432",
          "relationship": "Esposo"
        }
      },
      "medicalHistory": [
        {
          "id": "history-uuid",
          "date": "2025-01-08T14:30:00Z",
          "doctorId": "doctor-uuid",
          "doctorName": "Dr. Juan Pérez",
          "specialty": "Cardiología",
          "diagnosis": "Control rutinario - Hipertensión estable",
          "treatment": "Continuar con medicación actual",
          "nextVisit": "2025-04-08T14:30:00Z"
        }
      ],
      "upcomingAppointments": [
        {
          "id": "appointment-uuid",
          "date": "2025-01-20T10:00:00Z",
          "doctorName": "Dr. María González",
          "specialty": "Dermatología",
          "status": "scheduled"
        }
      ],
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2025-01-08T14:35:00Z"
    }
  }
}
```

### Citas Médicas

#### Listar Citas
```http
GET /api/appointments?date=2025-01-15&doctorId=uuid&status=scheduled
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` (optional): Filtrar por fecha (YYYY-MM-DD)
- `doctorId` (optional): Filtrar por médico
- `patientId` (optional): Filtrar por paciente
- `status` (optional): Filtrar por estado (scheduled, completed, cancelled, no_show)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appointment-uuid",
        "patientId": "patient-uuid",
        "patientName": "Ana García",
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. Juan Pérez",
        "specialty": "Cardiología",
        "date": "2025-01-15T10:00:00Z",
        "duration": 30,
        "status": "scheduled",
        "type": "consultation",
        "reason": "Control rutinario",
        "notes": null,
        "createdAt": "2025-01-10T09:15:00Z"
      }
    ],
    "summary": {
      "total": 15,
      "scheduled": 12,
      "completed": 2,
      "cancelled": 1
    }
  }
}
```

#### Crear Cita
```http
POST /api/appointments
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "date": "2025-01-20T15:30:00Z",
  "duration": 30,
  "type": "consultation",
  "reason": "Dolor de cabeza persistente",
  "notes": "Primera consulta por este síntoma"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "new-appointment-uuid",
      "patientId": "patient-uuid",
      "doctorId": "doctor-uuid",
      "date": "2025-01-20T15:30:00Z",
      "duration": 30,
      "status": "scheduled",
      "type": "consultation",
      "reason": "Dolor de cabeza persistente",
      "createdAt": "2025-01-15T13:45:00Z"
    }
  }
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "TIME_SLOT_OCCUPIED",
    "message": "El horario seleccionado no está disponible",
    "details": {
      "conflictingAppointment": {
        "id": "existing-appointment-uuid",
        "patientName": "Pedro Martínez",
        "time": "2025-01-20T15:30:00Z"
      },
      "suggestedTimes": [
        "2025-01-20T16:00:00Z",
        "2025-01-20T16:30:00Z",
        "2025-01-21T09:00:00Z"
      ]
    }
  }
}
```

### Códigos de Error Comunes

| Código HTTP | Código Error | Descripción |
|-------------|--------------|-------------|
| 400 | `VALIDATION_ERROR` | Error en validación de datos |
| 401 | `INVALID_CREDENTIALS` | Credenciales incorrectas |
| 401 | `INVALID_TOKEN` | Token inválido o expirado |
| 403 | `INSUFFICIENT_PERMISSIONS` | Permisos insuficientes |
| 404 | `RESOURCE_NOT_FOUND` | Recurso no encontrado |
| 409 | `TIME_SLOT_OCCUPIED` | Horario ya ocupado |
| 409 | `EMAIL_ALREADY_EXISTS` | Email ya registrado |
| 409 | `DNI_ALREADY_EXISTS` | DNI ya registrado |
| 429 | `RATE_LIMIT_EXCEEDED` | Límite de requests excedido |
| 500 | `INTERNAL_SERVER_ERROR` | Error interno del servidor |

### Autenticación y Autorización

#### Headers Requeridos
```http
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

#### Roles y Permisos

**Admin:**
- Acceso completo a todos los endpoints
- Gestión de usuarios y configuración del sistema

**Doctor:**
- Gestión de sus propios pacientes y citas
- Acceso a historiales médicos
- Crear/editar consultas

**Receptionist:**
- Gestión de citas y pacientes
- Acceso limitado a información médica
- No puede crear/editar usuarios

## 🐛 Debugging

### Logs disponibles
```bash
# Ver logs del servidor
tail -f logs/app.log

# Ver logs de Supabase
# Dashboard → Logs → API/Database
```

### Problemas comunes
1. **Error de conexión**: Verificar variables de entorno
2. **Token inválido**: Regenerar JWT_SECRET
3. **RLS**: Verificar políticas en Supabase

## 🚀 Deployment

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Deploy en la nube
- **Backend**: Railway, Heroku, Vercel
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Base de datos**: Supabase (ya en la nube)

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Desarrollado con ❤️ para la gestión médica moderna**

---

## 📞 Soporte

Para reportar bugs o solicitar features:
- 📧 Email: [tu-email]
- 🐛 Issues: [GitHub Issues]
- 📖 Docs: [Documentación completa]

---

*Último update: Agosto 2025*
