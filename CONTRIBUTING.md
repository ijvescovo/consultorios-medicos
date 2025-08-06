# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Consultorios Médicos! Esta guía te ayudará a comenzar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables.

### Nuestros Valores
- **Respeto**: Tratamos a todos con respeto y dignidad
- **Inclusión**: Valoramos la diversidad y fomentamos un ambiente inclusivo
- **Colaboración**: Trabajamos juntos para lograr objetivos comunes
- **Profesionalismo**: Mantenemos altos estándares profesionales

## 🚀 Cómo Contribuir

### Tipos de Contribuciones Bienvenidas

- 🐛 **Corrección de bugs**
- ✨ **Nuevas funcionalidades**
- 📚 **Mejoras en documentación**
- 🧪 **Pruebas adicionales**
- 🎨 **Mejoras de UI/UX**
- 🔧 **Optimizaciones de rendimiento**
- 🌐 **Internacionalización**

### Antes de Comenzar

1. **Busca issues existentes** - Evita trabajo duplicado
2. **Discute cambios grandes** - Abre un issue para discutir antes de implementar
3. **Lee la documentación** - Familiarízate con el proyecto

## ⚙️ Configuración del Entorno

### Prerrequisitos

```bash
# Versiones requeridas
Node.js >= 16.0.0
npm >= 8.0.0
Git >= 2.0.0
```

### Instalación

```bash
# 1. Fork y clona el repositorio
git clone https://github.com/TU_USUARIO/consultorios-medicos.git
cd consultorios-medicos

# 2. Instala dependencias del backend
cd backend
npm install

# 3. Configura variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones

# 4. Ejecuta migraciones de base de datos
npm run migrate

# 5. Inicia el servidor de desarrollo
npm run dev
```

### Configuración de Base de Datos

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia las credenciales

2. **Configurar variables de entorno**
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_KEY=tu-service-key
   JWT_SECRET=tu-jwt-secret-aleatorio
   ```

3. **Ejecutar schema**
   ```bash
   # En Supabase SQL Editor
   # Ejecuta: database/supabase-schema.sql
   ```

## 🏗️ Estructura del Proyecto

```
consultorios-medicos/
├── backend/                     # Servidor Node.js + Express
│   ├── config/                 # Configuraciones
│   │   ├── supabase.js        # Cliente Supabase
│   │   └── database.js        # Configuración DB
│   ├── controllers/           # Lógica de negocio
│   │   ├── authController.js  # Autenticación
│   │   ├── patientController.js # Pacientes
│   │   ├── appointmentController.js # Citas
│   │   └── doctorController.js # Médicos
│   ├── middlewares/           # Middlewares Express
│   │   ├── auth.js           # Autenticación JWT
│   │   └── errorHandler.js   # Manejo de errores
│   ├── models/               # Modelos de datos
│   ├── routes/               # Rutas de API
│   ├── tests/                # Pruebas automatizadas
│   ├── server.js             # Punto de entrada
│   └── package.json          # Dependencias
├── frontend/                  # Frontend estático
│   ├── css/                  # Hojas de estilo
│   │   ├── styles.css        # Estilos principales
│   │   ├── dashboard.css     # Dashboard específico
│   │   └── login.css         # Login específico
│   ├── js/                   # JavaScript modular
│   │   ├── modules/          # Módulos separados
│   │   │   ├── notifications.js # Sistema de notificaciones
│   │   │   ├── forms.js         # Validación de formularios
│   │   │   ├── navigation.js    # Navegación y scrolling
│   │   │   └── animations.js    # Animaciones y efectos
│   │   ├── main.js          # Punto de entrada principal
│   │   ├── auth.js          # Autenticación frontend
│   │   └── dashboard.js     # Dashboard específico
│   ├── assets/              # Recursos estáticos
│   │   ├── images/          # Imágenes
│   │   └── icons/           # Iconos
│   ├── index.html           # Página principal
│   ├── login.html           # Página de login
│   └── dashboard.html       # Dashboard principal
├── database/                 # Scripts de base de datos
│   ├── supabase-schema.sql  # Schema inicial
│   └── migrations/          # Migraciones
├── docs/                    # Documentación adicional
└── tests/                   # Pruebas E2E
```

## 📝 Estándares de Código

### JavaScript/Node.js

```javascript
// ✅ Buenas prácticas
// 1. Usa const/let en lugar de var
const apiUrl = 'https://api.example.com';
let userCount = 0;

// 2. Nomenclatura descriptiva
const fetchUserProfile = async (userId) => {
  // Implementación
};

// 3. Manejo de errores
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Error en operación:', error);
  throw new Error('Error específico del usuario');
}

// 4. Comentarios útiles
/**
 * Calcula el costo total de una cita médica
 * @param {Object} appointment - Datos de la cita
 * @param {number} appointment.duration - Duración en minutos
 * @param {string} appointment.type - Tipo de consulta
 * @returns {number} Costo total en pesos
 */
const calculateAppointmentCost = (appointment) => {
  // Implementación
};
```

### CSS

```css
/* ✅ Buenas prácticas */
/* 1. Usar metodología BEM */
.medical-card {
  padding: 1rem;
  border-radius: 0.5rem;
}

.medical-card__title {
  font-size: 1.25rem;
  font-weight: 600;
}

.medical-card__title--urgent {
  color: #ef4444;
}

/* 2. Variables CSS para consistencia */
:root {
  --primary-color: #3b82f6;
  --success-color: #22c55e;
  --error-color: #ef4444;
  --border-radius: 0.5rem;
}

/* 3. Mobile-first responsive */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### HTML

```html
<!-- ✅ Buenas prácticas -->
<!-- 1. Estructura semántica -->
<main>
  <section aria-labelledby="patients-heading">
    <h2 id="patients-heading">Lista de Pacientes</h2>
    <!-- Contenido -->
  </section>
</main>

<!-- 2. Accesibilidad -->
<button 
  aria-label="Editar paciente Juan Pérez"
  data-patient-id="123"
  class="btn btn--edit">
  <i class="fas fa-edit" aria-hidden="true"></i>
  Editar
</button>

<!-- 3. Formularios accesibles -->
<form>
  <label for="patient-name">Nombre del Paciente</label>
  <input 
    id="patient-name"
    type="text"
    required
    aria-describedby="name-help">
  <div id="name-help">Ingresa el nombre completo</div>
</form>
```

### Base de Datos

```sql
-- ✅ Buenas prácticas SQL
-- 1. Nomenclatura clara y consistente
CREATE TABLE medical_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para rendimiento
CREATE INDEX idx_appointments_date ON medical_appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON medical_appointments(patient_id);

-- 3. Constraints para integridad
ALTER TABLE medical_appointments 
ADD CONSTRAINT chk_duration_positive 
CHECK (duration_minutes > 0);
```

## 🔄 Proceso de Pull Request

### 1. Preparación

```bash
# Crear rama para tu feature
git checkout -b feature/descripcion-breve

# Mantener la rama actualizada
git fetch origin
git rebase origin/main
```

### 2. Desarrollo

- **Commits atómicos**: Un commit por cambio lógico
- **Mensajes descriptivos**: Usa convenciones de commit

```bash
# Ejemplos de buenos mensajes
git commit -m "feat: agregar validación de email en formulario de registro"
git commit -m "fix: corregir error de timezone en citas"
git commit -m "docs: actualizar guía de instalación"
git commit -m "refactor: modularizar sistema de notificaciones"
```

### 3. Antes de Enviar

```bash
# 1. Ejecutar pruebas
cd backend
npm test

# 2. Verificar linting
npm run lint

# 3. Verificar build
npm run build

# 4. Probar manualmente
npm run dev
# Verificar funcionalidad en navegador
```

### 4. Pull Request

#### Template de PR

```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio que rompe compatibilidad
- [ ] Mejora de documentación

## ✅ Testing
- [ ] Pruebas unitarias pasan
- [ ] Pruebas de integración pasan
- [ ] Probado manualmente
- [ ] Agregadas nuevas pruebas

## 📱 Screenshots (si aplica)
Agregar capturas de pantalla para cambios de UI.

## 📋 Checklist
- [ ] Código sigue los estándares del proyecto
- [ ] Auto-revisión realizada
- [ ] Comentarios agregados en código complejo
- [ ] Documentación actualizada
- [ ] No se introducen warnings
```

### 5. Revisión

- **Sé receptivo**: Acepta feedback constructivo
- **Explica decisiones**: Justifica cambios complejos
- **Itera rápido**: Aplica sugerencias prontamente

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca duplicados** en issues existentes
2. **Reproduce el error** consistentemente
3. **Prueba en ambiente limpio**

### Template de Bug Report

```markdown
## 🐛 Descripción del Bug
Descripción clara y concisa del problema.

## 🔄 Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hasta '...'
4. Ve el error

## ✅ Comportamiento Esperado
Descripción de lo que esperabas que ocurriera.

## ❌ Comportamiento Actual
Descripción de lo que realmente ocurre.

## 📱 Entorno
- **OS**: [ej. macOS, Windows, Ubuntu]
- **Navegador**: [ej. Chrome 91, Firefox 89]
- **Versión del proyecto**: [ej. v1.2.3]
- **Node.js**: [ej. 16.14.0]

## 📎 Screenshots/Logs
Agrega capturas de pantalla o logs si ayudan a explicar el problema.

## ➕ Contexto Adicional
Cualquier otra información relevante sobre el problema.
```

## ✨ Solicitar Features

### Template de Feature Request

```markdown
## 🎯 Descripción del Feature
Descripción clara de la funcionalidad solicitada.

## 🤔 Problema que Resuelve
Explica qué problema específico resuelve esta funcionalidad.

## 💡 Solución Propuesta
Descripción detallada de cómo te gustaría que funcionara.

## 🔄 Alternativas Consideradas
Otras soluciones que has considerado.

## 📊 Impacto
- **Usuarios afectados**: [ej. Médicos, Administradores, Pacientes]
- **Frecuencia de uso**: [ej. Diario, Semanal, Mensual]
- **Prioridad**: [ej. Alta, Media, Baja]

## 🖼️ Mockups/Referencias
Agregar mockups, capturas de pantalla o referencias si las tienes.
```

## 📚 Recursos Adicionales

### Herramientas Recomendadas

- **Editor**: VS Code con extensiones:
  - ES6 String HTML
  - Prettier
  - ESLint
  - Supabase
- **Testing**: 
  - Jest (unit tests)
  - Playwright (E2E tests)
- **API Testing**: Postman o Insomnia

### Enlaces Útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/es/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Comunicación

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas y discusiones
- **Email**: [correo-del-mantenedor] para temas privados

## 🎉 Reconocimientos

¡Todos los contribuidores son reconocidos en nuestro README! Las contribuciones de cualquier tamaño son valoradas y apreciadas.

### Tipos de Contribución

- 💻 **Código**
- 📖 **Documentación**
- 🐛 **Reportes de bug**
- 💡 **Ideas y sugerencias**
- 🧪 **Testing**
- 🎨 **Diseño**
- 🌐 **Traducción**

---

**¿Preguntas?** No dudes en abrir un issue con la etiqueta `question` o contactarnos directamente.

¡Gracias por contribuir al Sistema de Consultorios Médicos! 🏥✨