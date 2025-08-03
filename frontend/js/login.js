// Sistema de Gestión de Consultorio Médico - Login
// login.js - Funcionalidad de autenticación

document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

// Inicialización del sistema de login
function initializeLogin() {
    // Verificar si ya hay una sesión activa
    checkCurrentAuth();
    
    // Inicializar formularios
    initLoginForm();
    initForgotPasswordForm();
    initContactForm();
    
    // Inicializar modals
    initModals();
    
    // Verificar si hay sesión guardada
    checkSavedSession();
    
    // Agregar listeners de eventos
    addEventListeners();
    
    // Agregar indicador de estado del servidor
    checkServerStatus();
}

// Verificar estado del servidor
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:5000/api/health', {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            addServerStatusIndicator('online');
        } else {
            addServerStatusIndicator('error');
        }
    } catch (error) {
        addServerStatusIndicator('offline');
        console.warn('Servidor backend no disponible:', error.message);
    }
}

// Agregar información útil cuando no hay conexión con el servidor
function showOfflineInfo() {
    const offlineInfo = document.createElement('div');
    offlineInfo.id = 'offline-info';
    offlineInfo.innerHTML = `
        <div style="
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            color: #92400e;
        ">
            <h4 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                Servidor no disponible
            </h4>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
                No se puede conectar con el servidor backend. Para usar el sistema:
            </p>
            <ol style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
                <li>Asegúrate de que el servidor backend esté ejecutándose</li>
                <li>Verifica que esté corriendo en <strong>http://localhost:5000</strong></li>
                <li>Ejecuta <code>npm start</code> en la carpeta backend</li>
            </ol>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #78716c;">
                Usuarios de prueba: admin@consultorio.com, doctor@consultorio.com, recepcion@consultorio.com
            </p>
        </div>
    `;
    
    const form = document.querySelector('.login-form');
    const existingInfo = document.getElementById('offline-info');
    
    if (existingInfo) {
        existingInfo.remove();
    }
    
    form.insertBefore(offlineInfo, form.firstChild);
}

// Agregar indicador visual del estado del servidor
function addServerStatusIndicator(status) {
    // Crear indicador si no existe
    let indicator = document.getElementById('server-status');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'server-status';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(indicator);
        
        // Agregar click para recargar estado
        indicator.addEventListener('click', () => {
            indicator.style.opacity = '0.5';
            checkServerStatus().then(() => {
                indicator.style.opacity = '1';
            });
        });
    }
    
    // Configurar según el estado
    switch (status) {
        case 'online':
            indicator.innerHTML = '<i class="fas fa-circle" style="color: #22c55e;"></i> Servidor conectado';
            indicator.style.background = 'rgba(34, 197, 94, 0.1)';
            indicator.style.border = '1px solid rgba(34, 197, 94, 0.3)';
            indicator.style.color = '#166534';
            indicator.title = 'Servidor disponible - Click para verificar';
            
            // Remover info offline si existe
            const offlineInfo = document.getElementById('offline-info');
            if (offlineInfo) {
                offlineInfo.remove();
            }
            break;
            
        case 'offline':
            indicator.innerHTML = '<i class="fas fa-circle" style="color: #ef4444;"></i> Servidor desconectado';
            indicator.style.background = 'rgba(239, 68, 68, 0.1)';
            indicator.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            indicator.style.color = '#991b1b';
            indicator.title = 'Servidor no disponible - Click para reintentar';
            
            // Mostrar información útil
            showOfflineInfo();
            break;
            
        case 'error':
            indicator.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Error de servidor';
            indicator.style.background = 'rgba(245, 158, 11, 0.1)';
            indicator.style.border = '1px solid rgba(245, 158, 11, 0.3)';
            indicator.style.color = '#92400e';
            indicator.title = 'Error en el servidor - Click para reintentar';
            break;
    }
}

// Inicializar formulario de login
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Manejar envío del formulario de login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        userType: document.getElementById('userType').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        rememberMe: document.getElementById('rememberMe').checked
    };
    
    // Validar formulario
    if (!validateLoginForm(loginData)) {
        return;
    }
    
    // Mostrar loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Llamada a la API de autenticación
        const response = await authenticateUser(loginData);
        
        if (response.success) {
            console.log('Login exitoso:', response);
            
            // Actualizar el campo userType con el tipo correcto
            const userTypeField = document.getElementById('userType');
            if (userTypeField) {
                userTypeField.value = response.user.type;
            }
            
            // Siempre guardar sesión (mejorado para debugging)
            saveSession(response.user, response.token);
            console.log('Sesión guardada');
            
            // Mostrar mensaje de éxito
            showMessage('success', `¡Bienvenido/a, ${response.user.name}!`);
            
            // Redirigir según el tipo de usuario (reducido tiempo de espera)
            console.log('Redirigiendo a dashboard para tipo:', response.user.type);
            setTimeout(() => {
                redirectUser(response.user.type, response.user);
            }, 800);
            
        } else {
            throw new Error(response.message || 'Credenciales inválidas');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        showMessage('error', error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        
        // Limpiar contraseña en caso de error
        document.getElementById('password').value = '';
        
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalHTML;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Validar formulario de login
function validateLoginForm(data) {
    const errors = [];
    
    // Nota: userType es opcional - el backend determina el rol basado en las credenciales
    
    if (!data.email) {
        errors.push('Ingresa tu email');
        highlightField('email', true);
    } else if (!isValidEmail(data.email)) {
        errors.push('Ingresa un email válido');
        highlightField('email', true);
    } else {
        highlightField('email', false);
    }
    
    if (!data.password) {
        errors.push('Ingresa tu contraseña');
        highlightField('password', true);
    } else if (data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
        highlightField('password', true);
    } else {
        highlightField('password', false);
    }
    
    if (errors.length > 0) {
        showMessage('error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// Autenticar usuario con API real
async function authenticateUser(loginData) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: loginData.email,
                password: loginData.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en la autenticación');
        }

        return {
            success: true,
            user: {
                id: data.id || 'N/A',
                name: data.nombre,
                email: data.email,
                apellido: data.apellido,
                rol: data.rol,
                type: mapRoleToType(data.rol)
            },
            token: data.token
        };

    } catch (error) {
        console.error('Error en autenticación:', error);
        
        // Si el servidor no está disponible, mostrar mensaje específico
        if (error.message.includes('fetch')) {
            throw new Error('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.');
        }
        
        throw error;
    }
}

// Mapear roles de la base de datos a tipos del frontend
function mapRoleToType(role) {
    // Verificar que role existe y es un string
    if (!role || typeof role !== 'string') {
        console.warn('Rol inválido recibido:', role);
        return 'user';
    }
    
    const roleMapping = {
        'administrador': 'admin',
        'admin': 'admin',
        'medico': 'doctor',
        'doctor': 'doctor',
        'recepcionista': 'receptionist',
        'receptionist': 'receptionist'
    };
    
    return roleMapping[role.toLowerCase()] || 'user';
}

// Redirigir usuario según tipo
function redirectUser(userType, userData) {
    console.log('redirectUser llamado con tipo:', userType, 'userData:', userData);
    
    let url = 'dashboard.html'; // Default
    
    // Si es administrador, redirigir al portal de administración
    if (userData && (userData.rol === 'admin' || userData.rol === 'administrador')) {
        url = 'admin-portal.html';
        console.log('Usuario administrador detectado, redirigiendo al portal de administración');
    } else {
        // Para otros usuarios, ir al dashboard normal
        console.log('Usuario regular, redirigiendo al dashboard normal');
    }
    
    console.log('Redirigiendo a URL:', url);
    window.location.href = url;
}

// Toggle visibilidad de contraseña
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Funcionalidad de recuperación de contraseña
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function initForgotPasswordForm() {
    const form = document.getElementById('forgotPasswordForm');
    if (form) {
        form.addEventListener('submit', handleForgotPassword);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    
    if (!email || !isValidEmail(email)) {
        showMessage('error', 'Ingresa un email válido');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Llamada a la API para recuperación de contraseña
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al enviar el enlace de recuperación');
        }
        
        showMessage('success', 'Se ha enviado un enlace de recuperación a tu email');
        document.getElementById('recoveryEmail').value = '';
        closeForgotPassword();
        
    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        
        if (error.message.includes('fetch')) {
            showMessage('error', 'No se puede conectar con el servidor. Intenta más tarde.');
        } else {
            showMessage('error', error.message);
        }
    } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
}

// Funcionalidad de solicitud de acceso
function showContact() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeContact() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleContactRequest);
    }
}

async function handleContactRequest(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        role: document.getElementById('contactRole').value,
        message: document.getElementById('contactMessage').value
    };
    
    if (!validateContactRequest(formData)) {
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Llamada a la API para solicitud de acceso
        const response = await fetch('http://localhost:5000/api/auth/request-access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al enviar la solicitud');
        }
        
        showMessage('success', 'Solicitud enviada correctamente. Te contactaremos pronto.');
        e.target.reset();
        closeContact();
        
    } catch (error) {
        console.error('Error en solicitud de acceso:', error);
        
        if (error.message.includes('fetch')) {
            showMessage('error', 'No se puede conectar con el servidor. Intenta más tarde.');
        } else {
            showMessage('error', error.message);
        }
    } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
}

function validateContactRequest(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Ingresa un email válido');
    }
    
    if (!data.role || data.role.trim().length < 3) {
        errors.push('Especifica tu cargo o especialidad');
    }
    
    if (errors.length > 0) {
        showMessage('error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// Gestión de sesión mejorada
function saveSession(user, token) {
    console.log('Guardando sesión para usuario:', user);
    console.log('Token a guardar:', token ? 'Sí' : 'No');
    
    const sessionData = {
        user: user,
        token: token,
        timestamp: Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
    };
    
    localStorage.setItem('consultorio_session', JSON.stringify(sessionData));
    console.log('Sesión guardada en localStorage');
    
    // También guardar el token en sessionStorage para uso inmediato
    sessionStorage.setItem('auth_token', token);
    console.log('Token guardado en sessionStorage');
}

function getStoredToken() {
    // Primero verificar sessionStorage
    let token = sessionStorage.getItem('auth_token');
    if (token) return token;
    
    // Si no hay, verificar localStorage
    const savedSession = localStorage.getItem('consultorio_session');
    if (savedSession) {
        try {
            const sessionData = JSON.parse(savedSession);
            if (sessionData.expiresAt > Date.now()) {
                sessionStorage.setItem('auth_token', sessionData.token);
                return sessionData.token;
            } else {
                // Sesión expirada
                clearSession();
            }
        } catch (error) {
            console.error('Error al leer sesión guardada:', error);
            clearSession();
        }
    }
    
    return null;
}

function clearSession() {
    localStorage.removeItem('consultorio_session');
    sessionStorage.removeItem('auth_token');
}

function checkSavedSession() {
    const savedSession = localStorage.getItem('consultorio_session');
    
    if (savedSession) {
        try {
            const sessionData = JSON.parse(savedSession);
            const now = Date.now();
            
            if (sessionData.expiresAt > now) {
                // Sesión válida - prellenar campos
                const emailField = document.getElementById('email');
                const userTypeField = document.getElementById('userType');
                
                if (emailField && sessionData.user.email) {
                    emailField.value = sessionData.user.email;
                }
                
                if (userTypeField && sessionData.user.type) {
                    userTypeField.value = sessionData.user.type;
                }
                
                const rememberCheckbox = document.getElementById('rememberMe');
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                }
                
                showMessage('info', 'Sesión anterior encontrada. Verifica tus datos e inicia sesión.');
            } else {
                // Sesión expirada
                clearSession();
                showMessage('info', 'Tu sesión anterior ha expirado. Inicia sesión nuevamente.');
            }
        } catch (error) {
            console.error('Error al cargar sesión guardada:', error);
            clearSession();
        }
    }
}

// Verificar si el usuario ya está autenticado
function checkCurrentAuth() {
    const token = getStoredToken();
    if (token) {
        // Verificar si el token es válido
        verifyToken(token);
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            // Usuario ya autenticado, redirigir
            showMessage('info', `Ya tienes una sesión activa como ${userData.nombre}`);
            setTimeout(() => {
                redirectUser(mapRoleToType(userData.rol), userData);
            }, 2000);
        } else {
            // Token inválido
            clearSession();
        }
    } catch (error) {
        console.error('Error al verificar token:', error);
        // Si hay error en la verificación, limpiar sesión
        clearSession();
    }
}

// Funciones de utilidad
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function highlightField(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (hasError) {
            field.classList.add('error');
            field.classList.remove('success');
        } else {
            field.classList.remove('error');
            field.classList.add('success');
        }
    }
}

function showMessage(type, message) {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
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
            
            .message.info {
                background: #eff6ff;
                color: #1e40af;
                border: 1px solid #bfdbfe;
            }
            
            .message-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .close-message {
                background: none;
                border: none;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.2s;
                padding: 0.25rem;
                border-radius: 0.25rem;
            }
            
            .close-message:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
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
    
    // Remover mensajes anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Agregar al DOM
    document.body.appendChild(messageEl);
    
    // Auto remover después de 5 segundos (excepto errores que duran más)
    const duration = type === 'error' ? 8000 : 5000;
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, duration);
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

// Agregar event listeners adicionales
function addEventListeners() {
    // Validación en tiempo real
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                highlightField('email', true);
            } else if (this.value) {
                highlightField('email', false);
            }
        });
    }
    
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            if (this.value.length >= 6) {
                highlightField('password', false);
            } else if (this.value.length > 0) {
                highlightField('password', true);
            }
        });
    }
}

// Hacer funciones disponibles globalmente
window.togglePassword = togglePassword;
window.showForgotPassword = showForgotPassword;
window.closeForgotPassword = closeForgotPassword;
window.showContact = showContact;
window.closeContact = closeContact;