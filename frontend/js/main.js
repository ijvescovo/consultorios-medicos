// Sistema de Gestión de Consultorio Médico - Frontend
// main.js - Punto de entrada principal (modularizado)

// Importar módulos (para entornos que soporten ES6 modules)
// En producción, estos se cargarán como scripts separados para compatibilidad

class MedicalApp {
    constructor() {
        this.modules = {};
        this.initialized = false;
        this.init();
    }

    async init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            await this.initialize();
        }
    }

    async initialize() {
        if (this.initialized) return;

        console.log('🏥 Inicializando Sistema de Consultorios Médicos...');

        try {
            // Los módulos ya están cargados como scripts globales
            // En un entorno más avanzado, usaríamos import() dinámico
            
            // Verificar que los módulos estén disponibles
            this.checkModulesAvailability();
            
            // Inicializar módulos en orden
            await this.initializeModules();
            
            // Configurar funciones globales para compatibilidad
            this.setupGlobalFunctions();
            
            // Configurar manejo de errores
            this.setupErrorHandling();
            
            this.initialized = true;
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.showFallbackMessage();
        }
    }

    checkModulesAvailability() {
        const requiredModules = ['notifications', 'formValidator', 'navigationManager', 'animationManager'];
        const missingModules = [];

        requiredModules.forEach(moduleName => {
            if (!window[moduleName]) {
                missingModules.push(moduleName);
            }
        });

        if (missingModules.length > 0) {
            console.warn('⚠️ Módulos faltantes:', missingModules);
            // En un entorno de producción, podrías cargar los módulos dinámicamente aquí
        }
    }

    async initializeModules() {
        // Los módulos se auto-inicializan al cargarse
        // Aquí podemos hacer configuraciones específicas si es necesario
        
        // Configurar notificaciones
        if (window.notifications) {
            this.modules.notifications = window.notifications;
        }

        // Configurar validador de formularios
        if (window.formValidator) {
            this.modules.forms = window.formValidator;
        }

        // Configurar navegación
        if (window.navigationManager) {
            this.modules.navigation = window.navigationManager;
        }

        // Configurar animaciones
        if (window.animationManager) {
            this.modules.animations = window.animationManager;
        }

        // Inicializar funcionalidades específicas de la página
        this.initializePageSpecific();
    }

    initializePageSpecific() {
        // Funcionalidades específicas que no están en los módulos
        this.initModals();
        this.setupDemoFunctions();
    }

    setupGlobalFunctions() {
        // Mantener funciones globales para compatibilidad con HTML existente
        window.showDemo = this.showDemo.bind(this);
        window.showContactForm = this.showContactForm.bind(this);
        window.showFeatures = this.showFeatures.bind(this);
        window.closeModal = this.closeModal.bind(this);
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Error en la aplicación:', event.error);
            if (this.modules.notifications) {
                this.modules.notifications.error('Ha ocurrido un error inesperado');
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada no manejada:', event.reason);
            if (this.modules.notifications) {
                this.modules.notifications.error('Error en operación asíncrona');
            }
        });
    }

    showFallbackMessage() {
        // Mostrar mensaje de error básico si los módulos fallan
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef2f2;
            color: #991b1b;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #fecaca;
            z-index: 9999;
        `;
        message.innerHTML = '⚠️ Error al cargar la aplicación. Recarga la página.';
        document.body.appendChild(message);
    }

    // Funciones de Modal (mantenidas para compatibilidad)
    initModals() {
        // Cerrar modals al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
        
        // Cerrar modals con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
    }

    setupDemoFunctions() {
        // Funciones específicas de demostración
        // Se pueden extender aquí según necesidades específicas
    }

    // Funciones públicas para compatibilidad con HTML existente
    showDemo() {
        const modal = document.getElementById('demoModal');
        if (modal) {
            modal.classList.add('active');
        } else {
            // Si no hay modal, mostrar notificación
            if (this.modules.notifications) {
                this.modules.notifications.info('Demo disponible próximamente', {
                    title: 'Funcionalidad de Demo'
                });
            }
        }
    }

    showContactForm() {
        if (this.modules.navigation) {
            this.modules.navigation.scrollToSection('contacto');
        } else {
            // Fallback manual
            const contactSection = document.getElementById('contacto');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    showFeatures() {
        if (this.modules.navigation) {
            this.modules.navigation.scrollToSection('servicios');
        } else {
            // Fallback manual
            const featuresSection = document.getElementById('servicios');
            if (featuresSection) {
                featuresSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Métodos públicos para acceso externo
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    isInitialized() {
        return this.initialized;
    }

    // Método para reinicializar si es necesario
    async reinitialize() {
        this.initialized = false;
        await this.initialize();
    }
}

// Crear instancia global de la aplicación
const medicalApp = new MedicalApp();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.medicalApp = medicalApp;
}

// Utilidades globales para compatibilidad
const Utils = {
    // Formatear fecha
    formatDate: (date) => {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },
    
    // Formatear hora
    formatTime: (date) => {
        return new Intl.DateTimeFormat('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Debounce para eventos
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle para eventos
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Simular llamada a API
    simulateAPICall: (delay = 2000) => {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
};

// Hacer Utils disponible globalmente
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}