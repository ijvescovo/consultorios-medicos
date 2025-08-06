// Sistema de manejo de formularios con validación en tiempo real
// forms.js - Validación y manejo de formularios

class FormValidator {
    constructor() {
        this.forms = new Map();
        this.rules = new Map();
        this.init();
    }

    init() {
        // Inicializar formularios existentes
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeForms();
        });

        // Si ya está cargado el DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeForms();
            });
        } else {
            this.initializeForms();
        }
    }

    initializeForms() {
        // Buscar formularios con validación
        const forms = document.querySelectorAll('form[data-validate]');
        forms.forEach(form => this.registerForm(form));

        // Inicializar formulario de contacto específico
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            this.setupContactForm(contactForm);
        }
    }

    registerForm(form, rules = {}) {
        const formId = form.id || this.generateFormId();
        if (!form.id) form.id = formId;

        this.forms.set(formId, form);
        this.rules.set(formId, rules);

        // Agregar eventos de validación en tiempo real
        this.setupRealTimeValidation(form);
        this.setupSubmitHandler(form);
    }

    setupRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validar al perder el foco
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });

            // Validar mientras escribe (con debounce)
            input.addEventListener('input', this.debounce((e) => {
                if (e.target.classList.contains('error')) {
                    this.validateField(e.target);
                }
            }, 300));

            // Limpiar errores al enfocar
            input.addEventListener('focus', (e) => {
                this.clearFieldError(e.target);
            });
        });
    }

    setupSubmitHandler(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(form);
        });
    }

    setupContactForm(form) {
        const rules = {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                messages: {
                    required: 'El nombre es obligatorio',
                    minLength: 'El nombre debe tener al menos 2 caracteres',
                    pattern: 'El nombre solo puede contener letras y espacios'
                }
            },
            email: {
                required: true,
                email: true,
                messages: {
                    required: 'El email es obligatorio',
                    email: 'Ingresa un email válido'
                }
            },
            specialty: {
                required: true,
                messages: {
                    required: 'Selecciona una especialidad'
                }
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 500,
                messages: {
                    required: 'El mensaje es obligatorio',
                    minLength: 'El mensaje debe tener al menos 10 caracteres',
                    maxLength: 'El mensaje no puede exceder los 500 caracteres'
                }
            }
        };

        this.registerForm(form, rules);
        
        // Configurar contador de caracteres para el mensaje
        const messageField = form.querySelector('#message');
        if (messageField) {
            this.setupCharacterCounter(messageField, 500);
        }
    }

    setupCharacterCounter(textarea, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.innerHTML = `<span class="current">0</span>/<span class="max">${maxLength}</span>`;
        
        textarea.parentNode.appendChild(counter);

        textarea.addEventListener('input', () => {
            const current = textarea.value.length;
            const currentSpan = counter.querySelector('.current');
            currentSpan.textContent = current;
            
            counter.classList.toggle('warning', current > maxLength * 0.8);
            counter.classList.toggle('error', current > maxLength);
        });

        // Agregar estilos para el contador
        this.addCharacterCounterStyles();
    }

    addCharacterCounterStyles() {
        if (!document.querySelector('#character-counter-styles')) {
            const styles = document.createElement('style');
            styles.id = 'character-counter-styles';
            styles.textContent = `
                .character-counter {
                    text-align: right;
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                    transition: color 0.2s;
                }

                .character-counter.warning {
                    color: #f59e0b;
                }

                .character-counter.error {
                    color: #ef4444;
                }

                .field-error {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 1px #ef4444 !important;
                }

                .field-error-message {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .field-success {
                    border-color: #22c55e !important;
                    box-shadow: 0 0 0 1px #22c55e !important;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    validateField(field) {
        const form = field.closest('form');
        const formId = form.id;
        const rules = this.rules.get(formId);
        
        if (!rules || !rules[field.name]) return true;

        const fieldRules = rules[field.name];
        const value = field.value.trim();
        const errors = [];

        // Validar required
        if (fieldRules.required && !value) {
            errors.push(fieldRules.messages?.required || 'Este campo es obligatorio');
        }

        // Validar solo si hay valor o es required
        if (value || fieldRules.required) {
            // Validar minLength
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                errors.push(fieldRules.messages?.minLength || `Mínimo ${fieldRules.minLength} caracteres`);
            }

            // Validar maxLength
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors.push(fieldRules.messages?.maxLength || `Máximo ${fieldRules.maxLength} caracteres`);
            }

            // Validar email
            if (fieldRules.email && !this.isValidEmail(value)) {
                errors.push(fieldRules.messages?.email || 'Email inválido');
            }

            // Validar pattern
            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors.push(fieldRules.messages?.pattern || 'Formato inválido');
            }
        }

        if (errors.length > 0) {
            this.showFieldError(field, errors[0]);
            return false;
        } else {
            this.showFieldSuccess(field);
            return true;
        }
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('field-error');
        field.classList.remove('field-success');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    showFieldSuccess(field) {
        this.clearFieldError(field);
        
        field.classList.add('field-success');
        field.classList.remove('field-error');
    }

    clearFieldError(field) {
        field.classList.remove('field-error', 'field-success');
        
        const errorMessage = field.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleSubmit(form) {
        if (!this.validateForm(form)) {
            window.notifications?.error('Por favor corrige los errores en el formulario');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar loading
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            // Obtener datos del formulario
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Determinar el tipo de formulario y procesar
            if (form.id === 'contactForm') {
                await this.handleContactSubmit(data);
            } else {
                await this.handleGenericSubmit(form, data);
            }

            // Mostrar éxito
            window.notifications?.success('¡Formulario enviado correctamente!');
            form.reset();
            
            // Limpiar validaciones
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => this.clearFieldError(field));

        } catch (error) {
            console.error('Error al enviar formulario:', error);
            window.notifications?.error('Error al enviar el formulario. Por favor, intenta nuevamente.');
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleContactSubmit(data) {
        // Simular envío de contacto (reemplazar con API real)
        await this.simulateAPICall();
        
        // Aquí iría la llamada real a la API
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    }

    async handleGenericSubmit(form, data) {
        // Manejo genérico de formularios
        const action = form.action || '/api/submit';
        const method = form.method || 'POST';

        // Simular envío genérico
        await this.simulateAPICall();
        
        // Aquí iría la llamada real a la API
        // const response = await fetch(action, {
        //     method: method,
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    }

    // Utilidades
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    generateFormId() {
        return 'form-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    simulateAPICall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }
}

// Crear instancia global
const formValidator = new FormValidator();

export default formValidator;

// También hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.formValidator = formValidator;
}