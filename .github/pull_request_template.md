## 📝 Descripción

<!-- Descripción clara y concisa de los cambios realizados -->

### Resumen
Breve descripción de qué hace este PR.

### Motivación y Contexto
¿Por qué es necesario este cambio? ¿Qué problema resuelve?

### Relacionado con
<!-- Enlaces a issues relacionados -->
- Closes #[número]
- Fixes #[número]
- Relates to #[número]

## 🎯 Tipo de Cambio

<!-- Marca todos los que apliquen -->
- [ ] 🐛 Bug fix (cambio que corrige un problema)
- [ ] ✨ Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] 💥 Breaking change (cambio que rompe compatibilidad hacia atrás)
- [ ] 📚 Actualización de documentación
- [ ] 🎨 Cambios de estilo/formato (espacios, formato, punto y coma faltante, etc.)
- [ ] ♻️ Refactoring (cambio de código que no corrige bug ni agrega feature)
- [ ] ⚡ Mejora de rendimiento
- [ ] ✅ Agregar o actualizar tests
- [ ] 🔧 Cambios en configuración/build
- [ ] 🔒 Cambios relacionados con seguridad

## 🧪 Testing

### Checklist de Testing
- [ ] ✅ Todas las pruebas unitarias pasan
- [ ] ✅ Todas las pruebas de integración pasan
- [ ] ✅ Probado manualmente en desarrollo
- [ ] ✅ Probado en diferentes navegadores
- [ ] ✅ Probado en dispositivos móviles
- [ ] ✅ Verificado rendimiento

### Pruebas Nuevas
- [ ] ✅ Se agregaron tests para nuevas funcionalidades
- [ ] ✅ Se agregaron tests para casos límite
- [ ] ✅ Se actualizaron tests existentes

### Escenarios de Prueba
<!-- Describe los escenarios que probaste -->
1. **Escenario 1**: Descripción
   - Pasos: ...
   - Resultado esperado: ...
   - ✅ Resultado obtenido: ...

2. **Escenario 2**: Descripción
   - Pasos: ...
   - Resultado esperado: ...
   - ✅ Resultado obtenido: ...

## 📱 Screenshots/Videos

<!-- Si hay cambios visuales, incluye antes/después -->

### Antes
<!-- Screenshot del estado anterior -->

### Después
<!-- Screenshot del estado nuevo -->

### Video Demo (si aplica)
<!-- Link a video demostrando la funcionalidad -->

## 🔧 Cambios Técnicos

### Frontend
<!-- Describe cambios en el frontend -->
- [ ] Nuevos componentes: ...
- [ ] Estilos modificados: ...
- [ ] JavaScript actualizado: ...
- [ ] Dependencias agregadas/actualizadas: ...

### Backend
<!-- Describe cambios en el backend -->
- [ ] Nuevos endpoints: ...
- [ ] Modificaciones en API: ...
- [ ] Cambios en base de datos: ...
- [ ] Nuevas dependencias: ...

### Base de Datos
<!-- Si hay cambios en DB -->
- [ ] Nuevas tablas: ...
- [ ] Migraciones incluidas: ...
- [ ] Índices agregados: ...
- [ ] Scripts de migración: ...

## 📊 Impacto

### Usuarios Afectados
- [ ] 👥 Todos los usuarios
- [ ] 👨‍⚕️ Solo médicos
- [ ] 👨‍💼 Solo administradores
- [ ] 👩‍💻 Solo recepcionistas
- [ ] 🤒 Solo pacientes

### Breaking Changes
<!-- Si hay breaking changes, explícalos detalladamente -->
- [ ] ⚠️ Sin breaking changes
- [ ] 💥 Cambios que rompen compatibilidad:
  - Detalle 1
  - Detalle 2

### Migración Requerida
- [ ] ✅ No requiere migración
- [ ] 🔄 Requiere migración de datos
- [ ] 📝 Requiere actualización de configuración

## 📋 Checklist del Desarrollador

### Calidad de Código
- [ ] ✅ El código sigue los estándares del proyecto
- [ ] ✅ Se realizó auto-revisión del código
- [ ] ✅ Código comentado en partes complejas
- [ ] ✅ No se introducen warnings de linter
- [ ] ✅ No hay código comentado/debug innecesario

### Documentación
- [ ] ✅ Documentación actualizada (README, CONTRIBUTING, etc.)
- [ ] ✅ Comentarios en código agregados donde es necesario
- [ ] ✅ Changelog actualizado (si aplica)
- [ ] ✅ API documentation actualizada (si aplica)

### Seguridad
- [ ] ✅ Validación de inputs implementada
- [ ] ✅ No se exponen datos sensibles
- [ ] ✅ Autenticación/autorización verificada
- [ ] ✅ No hay vulnerabilidades conocidas

### Performance
- [ ] ✅ No se introducen problemas de rendimiento
- [ ] ✅ Consultas optimizadas (si aplica)
- [ ] ✅ Imágenes optimizadas (si aplica)
- [ ] ✅ Bundle size no aumenta significativamente

## 🚀 Deployment

### Configuración Requerida
- [ ] ✅ No requiere configuración adicional
- [ ] ⚙️ Requiere nuevas variables de entorno:
  - `VARIABLE_1`: Descripción
  - `VARIABLE_2`: Descripción

### Scripts de Deploy
- [ ] ✅ No requiere scripts especiales
- [ ] 📜 Requiere ejecutar scripts:
  ```bash
  npm run migrate
  npm run seed:new-data
  ```

### Orden de Deploy
- [ ] ✅ Deploy normal (backend → frontend)
- [ ] 🔄 Requiere orden especial:
  1. Paso 1
  2. Paso 2
  3. Paso 3

## ⚠️ Notas para el Reviewer

### Puntos de Atención
<!-- Indica áreas específicas donde quieres feedback -->
- [ ] Lógica de negocio en archivo X
- [ ] Performance de query en función Y
- [ ] Diseño de componente Z

### Decisiones de Diseño
<!-- Explica decisiones técnicas importantes -->
1. **Decisión 1**: Razón
2. **Decisión 2**: Razón

### Limitaciones Conocidas
<!-- Si hay limitaciones temporales o conocidas -->
- Limitación 1: Razón y plan para resolver
- Limitación 2: Razón y plan para resolver

## 📚 Referencias

### Issues Relacionados
- #123 - Descripción
- #456 - Descripción

### Documentación
- [Link a spec](url)
- [Link a diseño](url)
- [Link a documentación técnica](url)

### Recursos Útiles
- [Tutorial utilizado](url)
- [Librería documentación](url)

---

## Checklist para el Reviewer

- [ ] 👀 Código revisado y aprobado
- [ ] ✅ Tests pasan localmente
- [ ] 📱 Probado en staging/development
- [ ] 📖 Documentación adecuada
- [ ] 🔒 Aspectos de seguridad verificados
- [ ] ⚡ Performance verificada
- [ ] 🚀 Listo para deploy