// Sistema de notificaciones visuales reutilizable
// notifications.js - Manejo de notificaciones de feedback

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notifications-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notifications-container';
            this.container.className = 'notifications-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notifications-container');
        }

        // Agregar estilos CSS si no existen
        this.addStyles();
    }

    addStyles() {
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notifications-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    max-width: 400px;
                }

                .notification {
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    position: relative;
                    animation: slideInRight 0.3s ease-out;
                    transition: all 0.3s ease;
                    word-wrap: break-word;
                }

                .notification.removing {
                    animation: slideOutRight 0.3s ease-out forwards;
                }

                .notification.success {
                    background: #f0fdf4;
                    color: #166534;
                    border-left: 4px solid #22c55e;
                }

                .notification.error {
                    background: #fef2f2;
                    color: #991b1b;
                    border-left: 4px solid #ef4444;
                }

                .notification.warning {
                    background: #fffbeb;
                    color: #92400e;
                    border-left: 4px solid #f59e0b;
                }

                .notification.info {
                    background: #eff6ff;
                    color: #1e40af;
                    border-left: 4px solid #3b82f6;
                }

                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                }

                .notification-icon {
                    flex-shrink: 0;
                    font-size: 1.125rem;
                    margin-top: 0.125rem;
                }

                .notification-body {
                    flex: 1;
                }

                .notification-title {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .notification-message {
                    font-size: 0.875rem;
                    line-height: 1.4;
                }

                .notification-close {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity 0.2s;
                    font-size: 1rem;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                }

                .notification-close:hover {
                    opacity: 1;
                    background: rgba(0, 0, 0, 0.1);
                }

                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2px;
                    background: currentColor;
                    opacity: 0.3;
                    transition: width linear;
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

                @keyframes slideOutRight {
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }

                @media (max-width: 640px) {
                    .notifications-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    show(type, message, options = {}) {
        const {
            title = null,
            duration = 5000,
            persistent = false,
            id = null
        } = options;

        const notificationId = id || this.generateId();
        
        // Si ya existe una notificación con este ID, actualizarla
        if (this.notifications.has(notificationId)) {
            this.update(notificationId, type, message, { title });
            return notificationId;
        }

        const notification = this.createNotification(type, message, title, notificationId);
        this.container.appendChild(notification);
        this.notifications.set(notificationId, notification);

        // Auto-remover si no es persistente
        if (!persistent && duration > 0) {
            this.setAutoRemove(notificationId, duration);
        }

        return notificationId;
    }

    createNotification(type, message, title, id) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${icons[type] || icons.info}"></i>
                <div class="notification-body">
                    ${title ? `<div class="notification-title">${title}</div>` : ''}
                    <div class="notification-message">${message}</div>
                </div>
            </div>
            <button class="notification-close" onclick="notifications.remove('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        return notification;
    }

    update(id, type, message, options = {}) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const { title = null } = options;
        
        notification.className = `notification ${type}`;
        const body = notification.querySelector('.notification-body');
        const icon = notification.querySelector('.notification-icon');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        icon.className = `notification-icon ${icons[type] || icons.info}`;
        body.innerHTML = `
            ${title ? `<div class="notification-title">${title}</div>` : ''}
            <div class="notification-message">${message}</div>
        `;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.classList.add('removing');
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
            this.notifications.delete(id);
        }, 300);
    }

    setAutoRemove(id, duration) {
        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    clear() {
        this.notifications.forEach((_, id) => {
            this.remove(id);
        });
    }

    generateId() {
        return 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Métodos de conveniencia
    success(message, options = {}) {
        return this.show('success', message, options);
    }

    error(message, options = {}) {
        return this.show('error', message, options);
    }

    warning(message, options = {}) {
        return this.show('warning', message, options);
    }

    info(message, options = {}) {
        return this.show('info', message, options);
    }
}

// Crear instancia global
const notifications = new NotificationSystem();

// Exportar para uso modular
export default notifications;

// También hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.notifications = notifications;
}