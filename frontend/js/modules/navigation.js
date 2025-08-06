// Sistema de navegación y scrolling suave
// navigation.js - Manejo de navegación, menús y scrolling

class NavigationManager {
    constructor() {
        this.activeSection = '';
        this.sections = [];
        this.navLinks = [];
        this.scrollThrottle = null;
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
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupMobileMenu();
        this.setupScrollToTop();
    }

    setupSmoothScrolling() {
        // Obtener todos los enlaces de navegación interna
        this.navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleSmoothScroll(e, link);
            });
        });
    }

    handleSmoothScroll(e, link) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Calcular offset del header si existe
            const header = document.querySelector('header, .navbar, .nav-header');
            const offset = header ? header.offsetHeight : 0;
            
            const targetPosition = targetElement.offsetTop - offset - 20; // 20px extra
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Actualizar navegación activa inmediatamente
            this.updateActiveNavigation(link);
            
            // Cerrar menú móvil si está abierto
            this.closeMobileMenu();
            
            // Actualizar URL sin recargar página
            if (history.pushState) {
                history.pushState(null, null, link.getAttribute('href'));
            }
        }
    }

    setupActiveNavigation() {
        // Obtener todas las secciones con ID
        this.sections = Array.from(document.querySelectorAll('section[id], div[id]'))
            .filter(section => {
                // Solo incluir secciones que tienen enlaces de navegación correspondientes
                return document.querySelector(`a[href="#${section.id}"]`);
            });

        if (this.sections.length === 0) return;

        // Configurar observer para detectar secciones visibles
        this.setupIntersectionObserver();
        
        // También escuchar scroll para respaldo
        window.addEventListener('scroll', this.throttle(() => {
            this.updateActiveOnScroll();
        }, 100));
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Activar cuando la sección esté en el 20% superior
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const navLink = document.querySelector(`a[href="#${sectionId}"]`);
                    if (navLink) {
                        this.updateActiveNavigation(navLink);
                    }
                }
            });
        }, options);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveOnScroll() {
        let current = '';
        const scrollY = window.pageYOffset;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // 100px offset
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        if (current && current !== this.activeSection) {
            const navLink = document.querySelector(`a[href="#${current}"]`);
            if (navLink) {
                this.updateActiveNavigation(navLink);
            }
        }
    }

    updateActiveNavigation(activeLink) {
        // Remover clase activa de todos los enlaces
        document.querySelectorAll('.nav-link, .navbar-nav a, .menu-link').forEach(link => {
            link.classList.remove('active');
            link.parentElement?.classList.remove('active');
        });

        // Agregar clase activa al enlace seleccionado
        activeLink.classList.add('active');
        activeLink.parentElement?.classList.add('active');

        // Actualizar sección activa
        const href = activeLink.getAttribute('href');
        this.activeSection = href ? href.substring(1) : '';
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle, .navbar-toggle, .mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu, .navbar-collapse, .nav-menu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu(mobileMenu, menuToggle);
            });

            // Cerrar menú al hacer clic en enlaces
            const menuLinks = mobileMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu(mobileMenu, menuToggle);
                });
            });

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                    this.closeMobileMenu(mobileMenu, menuToggle);
                }
            });

            // Cerrar menú con tecla Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMobileMenu(mobileMenu, menuToggle);
                }
            });
        }
    }

    toggleMobileMenu(menu, toggle) {
        const isOpen = menu.classList.contains('active') || menu.classList.contains('show');
        
        if (isOpen) {
            this.closeMobileMenu(menu, toggle);
        } else {
            this.openMobileMenu(menu, toggle);
        }
    }

    openMobileMenu(menu, toggle) {
        menu = menu || document.querySelector('.mobile-menu, .navbar-collapse, .nav-menu');
        toggle = toggle || document.querySelector('.menu-toggle, .navbar-toggle, .mobile-menu-btn');
        
        if (menu) {
            menu.classList.add('active', 'show');
            document.body.classList.add('menu-open');
        }
        
        if (toggle) {
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    closeMobileMenu(menu, toggle) {
        menu = menu || document.querySelector('.mobile-menu, .navbar-collapse, .nav-menu');
        toggle = toggle || document.querySelector('.menu-toggle, .navbar-toggle, .mobile-menu-btn');
        
        if (menu) {
            menu.classList.remove('active', 'show');
            document.body.classList.remove('menu-open');
        }
        
        if (toggle) {
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    setupScrollToTop() {
        // Crear botón de scroll to top si no existe
        let scrollToTopBtn = document.querySelector('.scroll-to-top');
        
        if (!scrollToTopBtn) {
            scrollToTopBtn = document.createElement('button');
            scrollToTopBtn.className = 'scroll-to-top';
            scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            scrollToTopBtn.setAttribute('aria-label', 'Volver arriba');
            document.body.appendChild(scrollToTopBtn);
            
            // Agregar estilos
            this.addScrollToTopStyles();
        }

        // Mostrar/ocultar botón basado en scroll
        window.addEventListener('scroll', this.throttle(() => {
            const shouldShow = window.pageYOffset > 300;
            scrollToTopBtn.classList.toggle('visible', shouldShow);
        }, 100));

        // Manejar clic
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    addScrollToTopStyles() {
        if (!document.querySelector('#scroll-to-top-styles')) {
            const styles = document.createElement('style');
            styles.id = 'scroll-to-top-styles';
            styles.textContent = `
                .scroll-to-top {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 3rem;
                    height: 3rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px);
                    z-index: 9999;
                }

                .scroll-to-top:hover {
                    background: #2563eb;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }

                .scroll-to-top.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .scroll-to-top {
                        bottom: 1rem;
                        right: 1rem;
                        width: 2.5rem;
                        height: 2.5rem;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Métodos públicos
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const header = document.querySelector('header, .navbar, .nav-header');
            const offset = header ? header.offsetHeight : 0;
            const targetPosition = element.offsetTop - offset - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    getCurrentSection() {
        return this.activeSection;
    }

    // Utilidades
    throttle(func, limit) {
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
}

// Crear instancia global
const navigationManager = new NavigationManager();

export default navigationManager;

// También hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.navigationManager = navigationManager;
}