// Sistema de animaciones y efectos visuales
// animations.js - Manejo de animaciones, contadores y efectos

class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.counters = new Map();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize();
            });
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.setupCounterAnimations();
        this.setupScrollAnimations();
        this.setupLoadingAnimations();
        this.setupHoverEffects();
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number, .counter, [data-counter]');
        
        counters.forEach(counter => {
            this.setupCounter(counter);
        });
    }

    setupCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target') || counter.textContent);
        const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
        const delay = parseInt(counter.getAttribute('data-delay')) || 0;
        
        if (isNaN(target)) return;

        // Configurar observador para este contador
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(counter)) {
                    this.animatedElements.add(counter);
                    setTimeout(() => {
                        this.animateCounter(counter, target, duration);
                    }, delay);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -10% 0px'
        });

        observer.observe(counter);
        this.observers.set(counter, observer);
    }

    animateCounter(counter, target, duration = 2000) {
        const startTime = performance.now();
        const startValue = 0;
        const increment = target - startValue;
        
        // Configurar formato
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const separator = counter.getAttribute('data-separator') === 'true';

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (increment * easeOut));
            
            // Formatear número
            let formattedValue = currentValue.toString();
            if (separator) {
                formattedValue = this.addThousandsSeparator(currentValue);
            }
            
            counter.textContent = prefix + formattedValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Asegurar valor final exacto
                let finalValue = target.toString();
                if (separator) {
                    finalValue = this.addThousandsSeparator(target);
                }
                counter.textContent = prefix + finalValue + suffix;
                
                // Marcar como completado
                counter.classList.add('counter-completed');
            }
        };

        counter.classList.add('counter-animating');
        requestAnimationFrame(animate);
    }

    setupScrollAnimations() {
        // Elementos con animaciones al hacer scroll
        const animatedElements = document.querySelectorAll('[data-animate], .fade-in, .slide-up, .slide-left, .slide-right');
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.getAttribute('data-animate') || this.getAnimationClass(element);
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        this.triggerAnimation(element, animationType);
                    }, delay);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -5% 0px'
        });

        animatedElements.forEach(element => {
            // Agregar clase inicial si no la tiene
            if (!element.classList.contains('animate-ready')) {
                element.classList.add('animate-ready');
            }
            
            scrollObserver.observe(element);
        });

        this.observers.set('scroll', scrollObserver);
        this.addScrollAnimationStyles();
    }

    getAnimationClass(element) {
        if (element.classList.contains('fade-in')) return 'fade-in';
        if (element.classList.contains('slide-up')) return 'slide-up';
        if (element.classList.contains('slide-left')) return 'slide-left';
        if (element.classList.contains('slide-right')) return 'slide-right';
        return 'fade-in'; // default
    }

    triggerAnimation(element, animationType) {
        if (this.animatedElements.has(element)) return;
        
        this.animatedElements.add(element);
        element.classList.add('animate-in', `animate-${animationType}`);
        
        // Remover clases de preparación
        element.classList.remove('animate-ready');
    }

    setupLoadingAnimations() {
        // Ocultar loading screen si existe
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1500);
        }

        // Animaciones de entrada para elementos principales
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero h1, .hero p, .hero .btn');
            heroElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('animate-in');
                }, index * 200);
            });
        }, 500);
    }

    setupHoverEffects() {
        // Efectos de hover para tarjetas y botones
        const cards = document.querySelectorAll('.card, .feature-card, .service-card');
        const buttons = document.querySelectorAll('.btn, .button');

        cards.forEach(card => {
            this.setupCardHover(card);
        });

        buttons.forEach(button => {
            this.setupButtonHover(button);
        });

        this.addHoverEffectStyles();
    }

    setupCardHover(card) {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover-lift');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover-lift');
        });
    }

    setupButtonHover(button) {
        button.addEventListener('mouseenter', () => {
            this.createRippleEffect(button);
        });
    }

    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Métodos públicos
    animateElement(element, animationType, delay = 0) {
        setTimeout(() => {
            this.triggerAnimation(element, animationType);
        }, delay);
    }

    resetAnimation(element) {
        this.animatedElements.delete(element);
        element.classList.remove('animate-in', 'animate-fade-in', 'animate-slide-up', 'animate-slide-left', 'animate-slide-right');
        element.classList.add('animate-ready');
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }

    // Utilidades
    addThousandsSeparator(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    addScrollAnimationStyles() {
        if (!document.querySelector('#scroll-animation-styles')) {
            const styles = document.createElement('style');
            styles.id = 'scroll-animation-styles';
            styles.textContent = `
                .animate-ready {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s ease;
                }

                .animate-ready.slide-left {
                    transform: translateX(-30px);
                }

                .animate-ready.slide-right {
                    transform: translateX(30px);
                }

                .animate-in {
                    opacity: 1 !important;
                    transform: translate(0, 0) !important;
                }

                .counter-animating {
                    font-weight: bold;
                    color: #3b82f6;
                }

                .counter-completed {
                    animation: counterPulse 0.5s ease;
                }

                @keyframes counterPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                .fade-out {
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }

                .animations-paused * {
                    animation-play-state: paused !important;
                    transition-duration: 0s !important;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    addHoverEffectStyles() {
        if (!document.querySelector('#hover-effect-styles')) {
            const styles = document.createElement('style');
            styles.id = 'hover-effect-styles';
            styles.textContent = `
                .hover-lift {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                }

                .ripple-effect {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                }

                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                .btn, .button {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.animatedElements.clear();
        this.counters.clear();
    }
}

// Crear instancia global
const animationManager = new AnimationManager();

export default animationManager;

// También hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.animationManager = animationManager;
}