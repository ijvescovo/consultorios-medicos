// Variables globales
let currentPage = 1;
let usersPerPage = 9;
let searchTimeout;
let currentUsers = [];

// Configuración de la API
const API_BASE = 'http://localhost:5000/api';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando gestión de usuarios');
    
    // Verificar autenticación
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar permisos de administrador
    if (!isAdmin()) {
        showAlert('No tienes permisos para acceder a esta sección', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }
    
    // Cargar datos iniciales
    loadStats();
    loadUsers();
    
    // Event listeners
    setupEventListeners();
});

// Verificar si el usuario está autenticado
function isAuthenticated() {
    const token = getToken();
    return !!token;
}

// Verificar si el usuario es administrador
function isAdmin() {
    const sessionData = localStorage.getItem('consultorio_session');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            return session.user && session.user.type === 'admin';
        } catch (error) {
            console.error('Error verificando rol:', error);
        }
    }
    return false;
}

// Obtener token de autenticación
function getToken() {
    // Buscar token en diferentes ubicaciones
    let token = sessionStorage.getItem('auth_token');
    
    if (!token) {
        const sessionData = localStorage.getItem('consultorio_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                token = session.token;
            } catch (error) {
                console.error('Error obteniendo token:', error);
            }
        }
    }
    
    return token;
}

// Configurar event listeners
function setupEventListeners() {
    // Formulario de usuario
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    
    // Formulario de contraseña
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordSubmit);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        const userModal = document.getElementById('userModal');
        const passwordModal = document.getElementById('passwordModal');
        
        if (e.target === userModal) {
            closeModal();
        }
        if (e.target === passwordModal) {
            closePasswordModal();
        }
    });
}

// Cargar estadísticas
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/usuarios/stats`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('totalUsers').textContent = stats.total || 0;
            document.getElementById('totalAdmins').textContent = stats.administradores || 0;
            document.getElementById('totalDoctors').textContent = stats.medicos || 0;
            document.getElementById('totalReceptionists').textContent = stats.recepcionistas || 0;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar usuarios
async function loadUsers() {
    try {
        showLoading();
        
        const search = document.getElementById('searchInput').value;
        const role = document.getElementById('roleFilter').value;
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: usersPerPage
        });
        
        if (search) params.append('search', search);
        if (role) params.append('rol', role);
        
        const response = await fetch(`${API_BASE}/usuarios?${params}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUsers = data.usuarios;
            displayUsers(data.usuarios);
            setupPagination(data.pagination);
            
            document.getElementById('usersCount').textContent = 
                `${data.pagination.total} usuarios encontrados`;
        } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showError('Error al cargar usuarios');
    }
}

// Mostrar loading
function showLoading() {
    document.getElementById('usersContainer').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Cargando usuarios...
        </div>
    `;
}

// Mostrar error
function showError(message) {
    document.getElementById('usersContainer').innerHTML = `
        <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Mostrar usuarios
function displayUsers(usuarios) {
    const container = document.getElementById('usersContainer');
    
    if (usuarios.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-users"></i>
                <p>No se encontraron usuarios</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="users-grid">
            ${usuarios.map(usuario => createUserCard(usuario)).join('')}
        </div>
    `;
}

// Crear tarjeta de usuario
function createUserCard(usuario) {
    const initials = `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();
    const roleClass = `role-${usuario.rol}`;
    const roleText = {
        'administrador': 'Administrador',
        'medico': 'Médico',
        'recepcionista': 'Recepcionista'
    }[usuario.rol] || usuario.rol;
    
    return `
        <div class="user-card">
            <div class="user-header">
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <h3>${usuario.nombre} ${usuario.apellido}</h3>
                    <p>${usuario.email}</p>
                    <span class="role-badge ${roleClass}">${roleText}</span>
                </div>
            </div>
            
            <div class="user-details">
                <p><strong>Último acceso:</strong> ${formatDate(usuario.ultimo_acceso)}</p>
                <p><strong>Creado:</strong> ${formatDate(usuario.created_at)}</p>
                ${usuario.Medico ? `
                    <p><strong>Matrícula:</strong> ${usuario.Medico.matricula}</p>
                    ${usuario.Medico.especialidad ? `<p><strong>Especialidad:</strong> ${usuario.Medico.especialidad}</p>` : ''}
                ` : ''}
            </div>
            
            <div class="user-actions">
                <button class="btn-sm btn-edit" onclick="editUser(${usuario.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-sm btn-password" onclick="changePassword(${usuario.id})">
                    <i class="fas fa-key"></i> Contraseña
                </button>
                <button class="btn-sm btn-delete" onclick="deleteUser(${usuario.id}, '${usuario.nombre} ${usuario.apellido}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Configurar paginación
function setupPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botón anterior
    if (pagination.page > 1) {
        html += `<button onclick="changePage(${pagination.page - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }
    
    // Números de página
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.totalPages, pagination.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === pagination.page ? 'active' : ''}" 
                        onclick="changePage(${i})">${i}</button>`;
    }
    
    // Botón siguiente
    if (pagination.page < pagination.totalPages) {
        html += `<button onclick="changePage(${pagination.page + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    container.innerHTML = html;
}

// Cambiar página
function changePage(page) {
    currentPage = page;
    loadUsers();
}

// Búsqueda con debounce
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        loadUsers();
    }, 500);
}

// Limpiar filtros
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = '';
    currentPage = 1;
    loadUsers();
}

// Mostrar modal de creación
function showCreateModal() {
    document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('submitText').textContent = 'Crear Usuario';
    document.getElementById('userId').value = '';
    document.getElementById('userForm').reset();
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('medicoFields').style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
}

// Editar usuario
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE}/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            const usuario = await response.json();
            
            document.getElementById('modalTitle').textContent = 'Editar Usuario';
            document.getElementById('submitText').textContent = 'Actualizar Usuario';
            document.getElementById('userId').value = usuario.id;
            document.getElementById('nombre').value = usuario.nombre;
            document.getElementById('apellido').value = usuario.apellido;
            document.getElementById('email').value = usuario.email;
            document.getElementById('rol').value = usuario.rol;
            document.getElementById('passwordGroup').style.display = 'none';
            document.getElementById('password').required = false;
            
            // Si es médico, llenar campos específicos
            if (usuario.rol === 'medico' && usuario.Medico) {
                document.getElementById('matricula').value = usuario.Medico.matricula || '';
                document.getElementById('especialidad').value = usuario.Medico.especialidad || '';
                document.getElementById('telefono').value = usuario.Medico.telefono || '';
                document.getElementById('direccion_consultorio').value = usuario.Medico.direccion_consultorio || '';
            }
            
            toggleMedicoFields();
            document.getElementById('userModal').style.display = 'block';
        } else {
            throw new Error('Error al cargar usuario');
        }
    } catch (error) {
        console.error('Error editando usuario:', error);
        showAlert('Error al cargar los datos del usuario', 'error');
    }
}

// Toggle campos de médico
function toggleMedicoFields() {
    const rol = document.getElementById('rol').value;
    const medicoFields = document.getElementById('medicoFields');
    const matriculaField = document.getElementById('matricula');
    
    if (rol === 'medico') {
        medicoFields.style.display = 'block';
        matriculaField.required = true;
    } else {
        medicoFields.style.display = 'none';
        matriculaField.required = false;
    }
}

// Manejar envío de formulario de usuario
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        rol: document.getElementById('rol').value
    };
    
    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;
    
    // Agregar contraseña solo en creación
    if (!isEdit) {
        userData.password = document.getElementById('password').value;
    }
    
    // Agregar campos de médico si aplica
    if (userData.rol === 'medico') {
        userData.matricula = document.getElementById('matricula').value;
        userData.especialidad = document.getElementById('especialidad').value;
        userData.telefono = document.getElementById('telefono').value;
        userData.direccion_consultorio = document.getElementById('direccion_consultorio').value;
    }
    
    try {
        const url = isEdit ? `${API_BASE}/usuarios/${userId}` : `${API_BASE}/usuarios`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert(result.message || `Usuario ${isEdit ? 'actualizado' : 'creado'} exitosamente`, 'success');
            closeModal();
            loadUsers();
            loadStats();
        } else {
            const error = await response.json();
            throw new Error(error.error || `Error ${isEdit ? 'actualizando' : 'creando'} usuario`);
        }
    } catch (error) {
        console.error('Error en formulario:', error);
        showAlert(error.message, 'error');
    }
}

// Cambiar contraseña
function changePassword(id) {
    document.getElementById('passwordUserId').value = id;
    document.getElementById('passwordForm').reset();
    document.getElementById('passwordModal').style.display = 'block';
}

// Manejar cambio de contraseña
async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userId = document.getElementById('passwordUserId').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/usuarios/${userId}/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ newPassword })
        });
        
        if (response.ok) {
            showAlert('Contraseña actualizada exitosamente', 'success');
            closePasswordModal();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error actualizando contraseña');
        }
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        showAlert(error.message, 'error');
    }
}

// Eliminar usuario
async function deleteUser(id, name) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            showAlert('Usuario eliminado exitosamente', 'success');
            loadUsers();
            loadStats();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error eliminando usuario');
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        showAlert(error.message, 'error');
    }
}

// Cerrar modal de usuario
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Cerrar modal de contraseña
function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
}

// Mostrar alerta
function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        </div>
    `;
    
    container.innerHTML = alertHtml;
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}
