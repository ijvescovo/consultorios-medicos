// Sistema de Gestión de Consultorio Médico - Frontend
// main.js - Funcionalidad principal

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la aplicación
    initializeApp();
});

// Inicialización de la aplicación
function initializeApp() {
    // Ocultar loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);

    // Inicializar navegación suave
    initSmoothScrolling();
    
    // Inicializar contadores animados
    initCounterAnimation();
    
    // Inicializar formularios
    initForms();
    
    // Inicializar modals
    initModals();
    
    // Inicializar navegación activa
    initActiveNavigation();
}

// Navegación suave
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Actualizar navegación activa
                updateActiveNavigation(this);
            }
        });
    });
}

// Actualizar navegación activa
function updateActiveNavigation(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Navegación activa basada en scroll
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Animación de contadores
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 200;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Observador de intersección para activar animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                if (!counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    animateCounter(counter);
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Inicializar formularios
function initForms() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Manejar envío del formulario de contacto
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name') || document.getElementById('name').value,
        email: formData.get('email') || document.getElementById('email').value,
        specialty: formData.get('specialty') || document.getElementById('specialty').value,
        message: formData.get('message') || document.getElementById('message').value
    };
    
    // Validar formulario
    if (!validateContactForm(data)) {
        return;
    }
    
    // Mostrar loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Simular envío (reemplazar con llamada real a API)
        await simulateAPICall();
        
        // Mostrar mensaje de éxito
        showMessage('success', '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
        
        // Resetear formulario
        e.target.reset();
        
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showMessage('error', 'Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Validar formulario de contacto
function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Ingresa un email válido');
    }
    
    if (!data.specialty) {
        errors.push('Selecciona una especialidad');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    if (errors.length > 0) {
        showMessage('error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar mensajes
function showMessage(type, message) {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="close-message" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar estilos CSS si no existen
    if (!document.querySelector('#message-styles')) {
        const styles = document.createElement('style');
        styles.id = 'message-styles';
        styles.textContent = `
            .message {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                max-width: 400px;
                animation: slideInRight 0.3s ease-out;
            }
            
            .message.success {
                background: #f0fdf4;
                color: #166534;
                border: 1px solid #bbf7d0;
            }
            
            .message.error {
                background: #fef2f2;
                color: #991b1b;
                border: 1px solid #fecaca;
            }
            
            .message-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .close-message {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            
            .close-message:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Agregar al DOM
    document.body.appendChild(messageEl);
    
    // Auto remover después de 5 segundos
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 5000);
}

// Inicializar modals
function initModals() {
    // Cerrar modals al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Cerrar modals con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }
    });
}

// Funciones para mostrar modals
function showDemo() {
    const modal = document.getElementById('demoModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showContactForm() {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showFeatures() {
    const featuresSection = document.getElementById('servicios');
    if (featuresSection) {
        featuresSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Simular llamada a API
function simulateAPICall() {
    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

// Utilidades adicionales
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
    }
};

// Hacer disponibles las funciones globalmente
window.showDemo = showDemo;
window.showContactForm = showContactForm;
window.showFeatures = showFeatures;
window.closeModal = closeModal;
window.Utils = Utils;