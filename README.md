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

## 📈 Escalabilidad

Diseñado para soportar:
- ✅ **75,000+ pacientes**
- ✅ **20+ doctores**
- ✅ **12+ administrativos**
- ✅ **Múltiples especialidades**
- ✅ **Alta concurrencia**

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Administración
- `GET /api/admin/dashboard/stats` - Estadísticas
- `GET /api/admin/usuarios` - Listar usuarios
- `POST /api/admin/usuarios` - Crear usuario
- `PUT /api/admin/usuarios/:id` - Actualizar usuario

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente

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
