---
name: 🔧 Mejora de Rendimiento
about: Reportar problemas de rendimiento o sugerir optimizaciones
title: '[PERFORMANCE] '
labels: ['performance', 'triage']
assignees: ''
---

## 🐌 Problema de Rendimiento

Describe claramente el problema de rendimiento que has observado.

## 📊 Métricas Observadas

### Tiempo de Carga/Respuesta
- **Tiempo actual**: [ej. 5 segundos]
- **Tiempo esperado**: [ej. 2 segundos]
- **Navegador**: [Chrome/Firefox/Safari]
- **Conexión**: [Fibra/4G/3G/etc.]

### Recursos del Sistema
- **Uso de CPU**: [ej. 80%]
- **Uso de memoria**: [ej. 2GB]
- **Tamaño de respuesta**: [ej. 5MB]

## 🔄 Pasos para Reproducir

1. Ve a '...'
2. Haz clic en '...'
3. Espera que cargue '...'
4. Observa la lentitud en '...'

## 🌐 Entorno

- **OS**: [ej. macOS 12, Windows 11]
- **Navegador**: [ej. Chrome 91.0.4472.124]
- **Dispositivo**: [ej. MacBook Pro M1, iPhone 12]
- **Conexión**: [ej. WiFi 100Mbps, 4G]

## 📈 Herramientas Utilizadas

- [ ] Chrome DevTools (Performance tab)
- [ ] Chrome DevTools (Network tab)
- [ ] Lighthouse
- [ ] WebPageTest
- [ ] Otro: _______________

### Resultados de Lighthouse (si aplica)
- **Performance Score**: [ej. 45/100]
- **First Contentful Paint**: [ej. 3.2s]
- **Largest Contentful Paint**: [ej. 5.8s]
- **Time to Interactive**: [ej. 6.1s]

## 💡 Optimizaciones Sugeridas

### Frontend
- [ ] Optimizar imágenes (WebP, lazy loading)
- [ ] Minificar CSS/JS
- [ ] Implementar code splitting
- [ ] Usar CDN
- [ ] Optimizar fonts
- [ ] Reducir bundle size

### Backend
- [ ] Optimizar consultas SQL
- [ ] Implementar caché
- [ ] Comprimir respuestas (gzip)
- [ ] Optimizar algoritmos
- [ ] Usar índices de base de datos
- [ ] Implementar paginación

### Base de Datos
- [ ] Agregar índices
- [ ] Optimizar consultas
- [ ] Normalizar/desnormalizar datos
- [ ] Particionar tablas
- [ ] Connection pooling

## 📊 Impacto

### Usuarios Afectados
- [ ] Todos los usuarios
- [ ] Solo usuarios en dispositivos lentos
- [ ] Solo usuarios con conexión lenta
- [ ] Usuarios específicos: _______________

### Criticidad
- [ ] 🔥 Crítico (afecta funcionalidad principal)
- [ ] 🟡 Alto (degrada experiencia significativamente)
- [ ] 🟢 Medio (molesto pero usable)
- [ ] 🔵 Bajo (optimización menor)

## 🔍 Análisis Técnico

### Posibles Causas
- [ ] Consultas SQL lentas
- [ ] Imágenes no optimizadas
- [ ] JavaScript bloqueante
- [ ] CSS no optimizado
- [ ] Demasiadas requests HTTP
- [ ] Falta de caché
- [ ] Algoritmo ineficiente
- [ ] Otro: _______________

### Recursos del Navegador
```
// Pega aquí información de Chrome DevTools Network/Performance
```

## 📱 Testing

### Diferentes Dispositivos
- [ ] Desktop (Chrome)
- [ ] Mobile (Chrome)
- [ ] Tablet
- [ ] Conexión lenta (3G)

### Resultados Esperados Post-Optimización
- **Tiempo de carga objetivo**: [ej. <2 segundos]
- **Score de Lighthouse objetivo**: [ej. >80]
- **Tamaño de bundle objetivo**: [ej. <1MB]

## ➕ Información Adicional

### Screenshots/Videos
Agrega capturas de pantalla del problema o herramientas de análisis.

### Enlaces Útiles
- Profile/trace de Chrome DevTools
- Lighthouse report
- WebPageTest results

### Contexto Adicional
Cualquier información adicional que pueda ayudar a entender el problema.