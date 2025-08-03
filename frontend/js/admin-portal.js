// Admin Portal JavaScript
class AdminPortal {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.charts = {};
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Iniciando Portal de Administración...');
            
            // Esperar a que el DOM esté completamente cargado
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', resolve);
                    } else {
                        resolve();
                    }
                });
            }
            
            console.log('✅ DOM cargado, verificando autenticación...');
            await this.checkAuth();
            
            console.log('✅ Configurando event listeners...');
            this.setupEventListeners();
            
            console.log('✅ Cargando datos del dashboard...');
            this.loadDashboardData();
            
            console.log('✅ Ocultando pantalla de carga...');
            this.hideLoadingScreen();
            
            console.log('🎉 Portal de administración listo!');
        } catch (error) {
            console.error('❌ Error inicializando portal:', error);
            this.showNotification('Error inicializando el portal. Modo demo activado.', 'warning');
            this.hideLoadingScreen();
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        
        // MODO DEMO - Para testing sin base de datos
        if (!token) {
            console.log('🔧 Modo demo activado - sin autenticación');
            this.currentUser = {
                id: 1,
                email: 'admin@consultorio.com',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'admin'
            };
            
            const adminUserNameElement = document.getElementById('adminUserName');
            if (adminUserNameElement) {
                adminUserNameElement.textContent = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
            }
            return;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Token inválido');
            }

            const userData = await response.json();
            if (userData.rol !== 'admin') {
                alert('Acceso denegado. Se requieren permisos de administrador.');
                window.location.href = 'dashboard.html';
                return;
            }

            this.currentUser = userData;
            const adminUserNameElement = document.getElementById('adminUserName');
            if (adminUserNameElement) {
                adminUserNameElement.textContent = `${userData.nombre} ${userData.apellido}`;
            }

        } catch (error) {
            console.error('Error verificando autenticación:', error);
            // En lugar de redirigir, usar modo demo
            console.log('🔧 Fallback a modo demo debido a error de autenticación');
            this.currentUser = {
                id: 1,
                email: 'admin@consultorio.com',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'admin'
            };
            
            const adminUserNameElement = document.getElementById('adminUserName');
            if (adminUserNameElement) {
                adminUserNameElement.textContent = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
            }
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar);
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', this.handleGlobalSearch.bind(this));
        }

        // Forms
        const formCrearUsuario = document.getElementById('formCrearUsuario');
        if (formCrearUsuario) {
            formCrearUsuario.addEventListener('submit', this.handleCrearUsuario.bind(this));
        }

        // Filters
        this.setupFilters();

        // Config tabs
        this.setupConfigTabs();
    }

    setupFilters() {
        const searchUsuarios = document.getElementById('searchUsuarios');
        const filterRol = document.getElementById('filterRol');
        const filterEstado = document.getElementById('filterEstado');

        if (searchUsuarios) {
            searchUsuarios.addEventListener('input', 
                this.debounce(() => this.loadUsuarios(), 500));
        }

        if (filterRol) {
            filterRol.addEventListener('change', () => this.loadUsuarios());
        }

        if (filterEstado) {
            filterEstado.addEventListener('change', () => this.loadUsuarios());
        }
    }

    setupConfigTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchConfigTab(tabId);
            });
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            usuarios: 'Gestión de Usuarios',
            permisos: 'Roles y Permisos',
            auditoria: 'Auditoría y Logs',
            configuracion: 'Configuración'
        };
        document.getElementById('pageTitle').textContent = titles[section];

        this.currentSection = section;

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'usuarios':
                this.loadUsuarios();
                break;
            case 'permisos':
                this.loadRolesData();
                break;
            case 'auditoria':
                this.loadAuditoriaData();
                break;
        }
    }

    switchConfigTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    async loadDashboardData() {
        try {
            const token = localStorage.getItem('token');
            
            // Si no hay token, usar datos simulados directamente (modo demo)
            if (!token) {
                console.log('🔧 Modo demo: cargando datos simulados localmente');
                const datosSimulados = {
                    stats: {
                        totalUsuarios: 5,
                        usuariosActivos: 4,
                        usuariosNuevos: 2,
                        usuariosPorRol: {
                            admin: 1,
                            doctor: 2,
                            recepcionista: 2
                        }
                    },
                    actividadReciente: [
                        {
                            id: 1,
                            nombre: 'Administrador',
                            apellido: 'Sistema',
                            email: 'admin@consultorio.com',
                            rol: 'admin',
                            ultimo_acceso: new Date()
                        },
                        {
                            id: 2,
                            nombre: 'Dr. Juan',
                            apellido: 'Pérez',
                            email: 'doctor@consultorio.com',
                            rol: 'doctor',
                            ultimo_acceso: new Date(Date.now() - 2 * 60 * 60 * 1000)
                        }
                    ]
                };
                
                this.updateDashboardStats(datosSimulados.stats);
                this.updateActivityFeed(datosSimulados.actividadReciente);
                this.createCharts(datosSimulados.stats);
                
                console.log('✅ Dashboard demo cargado exitosamente');
                return;
            }

            console.log('Cargando datos del dashboard con token...', { token: token.substring(0, 20) + '...' });
            
            const response = await fetch('/api/admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error de servidor:', errorData);
                
                if (response.status === 401 || response.status === 403) {
                    console.log('🔧 Token inválido, fallback a modo demo');
                    // Usar datos simulados en lugar de redirigir
                    this.loadDashboardDataDemo();
                    return;
                }
                
                throw new Error(`Error ${response.status}: ${errorData}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            this.updateDashboardStats(data.stats);
            this.updateActivityFeed(data.actividadReciente);
            this.createCharts(data.stats);
            
            console.log('Dashboard cargado exitosamente');

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            console.log('🔧 Fallback a modo demo debido a error');
            this.loadDashboardDataDemo();
        }
    }

    loadDashboardDataDemo() {
        const datosDemo = {
            totalUsuarios: 5,
            usuariosActivos: 4,
            usuariosNuevos: 2,
            usuariosPorRol: {
                admin: 1,
                doctor: 2,
                recepcionista: 2
            }
        };
        
        const actividadDemo = [
            {
                id: 1,
                nombre: 'Administrador',
                apellido: 'Sistema',
                email: 'admin@consultorio.com',
                rol: 'admin',
                ultimo_acceso: new Date()
            },
            {
                id: 2,
                nombre: 'Dr. Juan',
                apellido: 'Pérez',
                email: 'doctor@consultorio.com',
                rol: 'doctor',
                ultimo_acceso: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
        ];
        
        this.updateDashboardStats(datosDemo);
        this.updateActivityFeed(actividadDemo);
        this.createCharts(datosDemo);
        
        // Mostrar mensaje de modo demo
        this.showNotification('Portal funcionando en modo demo con datos simulados', 'info');
    }

    updateDashboardStats(stats) {
        document.getElementById('totalUsuarios').textContent = stats.totalUsuarios || 0;
        document.getElementById('usuariosActivos').textContent = stats.usuariosActivos || 0;
        document.getElementById('usuariosNuevos').textContent = stats.usuariosNuevos || 0;

        // Update role counts
        document.getElementById('adminCount').textContent = stats.usuariosPorRol?.admin || 0;
        document.getElementById('doctorCount').textContent = stats.usuariosPorRol?.doctor || 0;
        document.getElementById('recepcionistaCount').textContent = stats.usuariosPorRol?.recepcionista || 0;
    }

    updateActivityFeed(actividad) {
        const container = document.getElementById('actividadReciente');
        if (!container) return;

        container.innerHTML = actividad.map(item => `
            <div class="activity-item">
                <div class="activity-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-user">${item.nombre} ${item.apellido}</div>
                    <div class="activity-action">Último acceso al sistema</div>
                    <div class="activity-time">${this.formatDateTime(item.ultimo_acceso)}</div>
                </div>
            </div>
        `).join('');
    }

    createCharts(stats) {
        this.createRolesChart(stats.usuariosPorRol);
        this.createActivityChart();
    }

    createRolesChart(usuariosPorRol) {
        const ctx = document.getElementById('rolesChart');
        if (!ctx) {
            console.warn('Canvas rolesChart no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (this.charts.roles) {
            this.charts.roles.destroy();
            this.charts.roles = null;
        }

        try {
            // Verificar que Chart.js esté disponible
            if (typeof Chart === 'undefined') {
                console.error('Chart.js no está cargado');
                return;
            }

            this.charts.roles = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Administradores', 'Doctores', 'Recepcionistas'],
                    datasets: [{
                        data: [
                            usuariosPorRol?.admin || 0,
                            usuariosPorRol?.doctor || 0,
                            usuariosPorRol?.recepcionista || 0
                        ],
                        backgroundColor: [
                            '#1e3a8a',
                            '#10b981',
                            '#f59e0b'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    layout: {
                        padding: 10
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                boxWidth: 12
                            }
                        }
                    },
                    animation: {
                        animateRotate: false,
                        animateScale: false
                    }
                }
            });
            
            console.log('✅ Gráfico de roles creado exitosamente');
        } catch (error) {
            console.error('❌ Error creando gráfico de roles:', error);
            // Mostrar un mensaje simple en lugar del gráfico
            ctx.style.display = 'none';
            const container = ctx.closest('.chart-container');
            if (container && !container.querySelector('.chart-error')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'chart-error';
                errorDiv.innerHTML = `
                    <p style="text-align: center; color: #6b7280; padding: 2rem;">
                        <i class="fas fa-chart-pie" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                        Gráfico no disponible en modo demo
                    </p>
                `;
                container.appendChild(errorDiv);
            }
        }
    }

    createActivityChart() {
        const ctx = document.getElementById('actividadChart');
        if (!ctx) return;

        try {
            if (this.charts.activity) {
                this.charts.activity.destroy();
                this.charts.activity = null;
            }

            // Datos simulados para actividad semanal
            const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const data = [12, 15, 8, 22, 18, 5, 3];

            this.charts.activity = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Accesos',
                        data: data,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    animation: {
                        duration: 0
                    }
                }
            });
            
            console.log('✅ Gráfico de actividad creado exitosamente');
        } catch (error) {
            console.error('❌ Error creando gráfico de actividad:', error);
            // Mostrar un mensaje simple en lugar del gráfico
            ctx.style.display = 'none';
            const container = ctx.closest('.chart-container');
            if (container && !container.querySelector('.chart-error')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'chart-error';
                errorDiv.innerHTML = `
                    <p style="text-align: center; color: #6b7280; padding: 2rem;">
                        <i class="fas fa-chart-line" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                        Gráfico no disponible en modo demo
                    </p>
                `;
                container.appendChild(errorDiv);
            }
        }
    }

    async loadUsuarios(page = 1) {
        try {
            const token = localStorage.getItem('token');
            
            // Si no hay token, usar datos simulados (modo demo)
            if (!token) {
                console.log('🔧 Modo demo: cargando usuarios simulados');
                const usuariosDemo = [
                    {
                        id: 1,
                        email: 'admin@consultorio.com',
                        nombre: 'Administrador',
                        apellido: 'Sistema',
                        rol: 'admin',
                        activo: true,
                        ultimo_acceso: new Date(),
                        created_at: new Date()
                    },
                    {
                        id: 2,
                        email: 'doctor@consultorio.com',
                        nombre: 'Dr. Juan',
                        apellido: 'Pérez',
                        rol: 'doctor',
                        activo: true,
                        ultimo_acceso: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        Medico: {
                            matricula: 'MP12345',
                            especialidad: 'Cardiología',
                            telefono: '+54 11 1234-5678'
                        }
                    },
                    {
                        id: 3,
                        email: 'recepcion@consultorio.com',
                        nombre: 'María',
                        apellido: 'García',
                        rol: 'recepcionista',
                        activo: true,
                        ultimo_acceso: new Date(Date.now() - 4 * 60 * 60 * 1000),
                        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
                    }
                ];
                
                this.renderUsuariosTable(usuariosDemo);
                this.renderPagination({
                    page: 1,
                    limit: 20,
                    total: usuariosDemo.length,
                    totalPages: 1
                }, 'usuariosPagination');
                return;
            }
            
            const search = document.getElementById('searchUsuarios')?.value || '';
            const rol = document.getElementById('filterRol')?.value || '';
            const estado = document.getElementById('filterEstado')?.value || 'todos';

            const params = new URLSearchParams({
                page,
                limit: 20,
                search,
                rol,
                estado
            });

            const response = await fetch(`/api/admin/usuarios?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error cargando usuarios');
            }

            const data = await response.json();
            this.renderUsuariosTable(data.usuarios);
            this.renderPagination(data.pagination, 'usuariosPagination');

        } catch (error) {
            console.error('Error cargando usuarios:', error);
            // Fallback a datos demo en caso de error
            console.log('🔧 Fallback a usuarios demo por error');
            this.loadUsuariosDemo();
        }
    }

    loadUsuariosDemo() {
        const usuariosDemo = [
            {
                id: 1,
                email: 'admin@consultorio.com',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'admin',
                activo: true,
                ultimo_acceso: new Date(),
                created_at: new Date()
            },
            {
                id: 2,
                email: 'doctor@consultorio.com',
                nombre: 'Dr. Juan',
                apellido: 'Pérez',
                rol: 'doctor',
                activo: true,
                ultimo_acceso: new Date(Date.now() - 2 * 60 * 60 * 1000),
                created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        ];
        
        this.renderUsuariosTable(usuariosDemo);
        this.showNotification('Mostrando usuarios de demostración', 'info');
    }

    renderUsuariosTable(usuarios) {
        const tbody = document.getElementById('usuariosTableBody');
        if (!tbody) return;

        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>
                    <input type="checkbox" class="user-checkbox" value="${usuario.id}">
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar-small">
                            ${(usuario.nombre.charAt(0) + usuario.apellido.charAt(0)).toUpperCase()}
                        </div>
                        <div class="user-details-small">
                            <div class="user-name-small">${usuario.nombre} ${usuario.apellido}</div>
                            <div class="user-email-small">${usuario.email}</div>
                        </div>
                    </div>
                </td>
                <td>${usuario.email}</td>
                <td>
                    <span class="role-badge role-${usuario.rol}">
                        ${this.getRoleDisplayName(usuario.rol)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${usuario.activo ? 'status-active' : 'status-inactive'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${this.formatDateTime(usuario.ultimo_acceso)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editarUsuario(${usuario.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon lock" onclick="toggleBloqueoUsuario(${usuario.id}, ${!usuario.activo})" title="${usuario.activo ? 'Bloquear' : 'Desbloquear'}">
                            <i class="fas ${usuario.activo ? 'fa-lock' : 'fa-unlock'}"></i>
                        </button>
                        <button class="btn-icon" onclick="resetearPassword(${usuario.id})" title="Resetear Contraseña">
                            <i class="fas fa-key"></i>
                        </button>
                        ${usuario.rol !== 'admin' ? `
                            <button class="btn-icon delete" onclick="eliminarUsuario(${usuario.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async handleCrearUsuario(e) {
        e.preventDefault();

        const formData = {
            nombre: document.getElementById('nuevoNombre').value,
            apellido: document.getElementById('nuevoApellido').value,
            email: document.getElementById('nuevoEmail').value,
            rol: document.getElementById('nuevoRol').value,
            password: document.getElementById('nuevoPassword').value
        };

        // Datos médicos si es doctor
        if (formData.rol === 'doctor') {
            formData.datosMedico = {
                matricula: document.getElementById('matricula').value,
                especialidad: document.getElementById('especialidad').value,
                telefono: document.getElementById('telefono').value
            };
        }

        // Permisos específicos
        const permisosCheckboxes = document.querySelectorAll('#permisosGrid input[type="checkbox"]:checked');
        formData.permisos = Array.from(permisosCheckboxes).map(cb => cb.value);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            this.showNotification('Usuario creado exitosamente', 'success');
            this.cerrarModal('modalCrearUsuario');
            this.loadUsuarios();
            this.loadDashboardData(); // Actualizar estadísticas

        } catch (error) {
            console.error('Error creando usuario:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async loadRolesData() {
        // Cargar datos de roles y permisos
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data.stats);
            }
        } catch (error) {
            console.error('Error cargando datos de roles:', error);
        }
    }

    async loadAuditoriaData() {
        try {
            const token = localStorage.getItem('token');
            
            // Si no hay token, usar datos simulados (modo demo)
            if (!token) {
                console.log('🔧 Modo demo: cargando logs simulados');
                const logsDemo = [
                    {
                        id: 1,
                        usuario: 'Administrador Sistema',
                        email: 'admin@consultorio.com',
                        accion: 'Inicio de sesión',
                        fecha: new Date()
                    },
                    {
                        id: 2,
                        usuario: 'Dr. Juan Pérez',
                        email: 'doctor@consultorio.com',
                        accion: 'Consulta de pacientes',
                        fecha: new Date(Date.now() - 30 * 60 * 1000)
                    },
                    {
                        id: 3,
                        usuario: 'María García',
                        email: 'recepcion@consultorio.com',
                        accion: 'Registro de turno',
                        fecha: new Date(Date.now() - 60 * 60 * 1000)
                    }
                ];
                
                this.renderLogsTable(logsDemo);
                return;
            }
            
            const response = await fetch('/api/admin/logs/actividad', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error cargando logs');
            }

            const data = await response.json();
            this.renderLogsTable(data.logs);

        } catch (error) {
            console.error('Error cargando auditoría:', error);
            // Fallback a datos demo
            console.log('🔧 Fallback a logs demo por error');
            this.loadAuditoriaDataDemo();
        }
    }

    loadAuditoriaDataDemo() {
        const logsDemo = [
            {
                id: 1,
                usuario: 'Administrador Sistema',
                email: 'admin@consultorio.com',
                accion: 'Acceso al portal',
                fecha: new Date()
            },
            {
                id: 2,
                usuario: 'Dr. Juan Pérez',
                email: 'doctor@consultorio.com',
                accion: 'Consulta realizada',
                fecha: new Date(Date.now() - 60 * 60 * 1000)
            }
        ];
        
        this.renderLogsTable(logsDemo);
        this.showNotification('Mostrando logs de demostración', 'info');
    }

    renderLogsTable(logs) {
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;

        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${this.formatDateTime(log.fecha)}</td>
                <td>${log.usuario}</td>
                <td>${log.accion}</td>
                <td>127.0.0.1</td>
                <td>${log.email}</td>
            </tr>
        `).join('');
    }

    // Utility functions
    getRoleDisplayName(rol) {
        const roles = {
            'admin': 'Administrador',
            'doctor': 'Doctor',
            'recepcionista': 'Recepcionista'
        };
        return roles[rol] || rol;
    }

    formatDateTime(dateString) {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return date.toLocaleString('es-AR');
    }

    showNotification(message, type = 'info') {
        // Implementar sistema de notificaciones
        alert(message); // Temporal
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1000);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('open');
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

    handleGlobalSearch(e) {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
            // Implementar búsqueda global
            console.log('Búsqueda global:', query);
        }
    }

    renderPagination(pagination, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { page, totalPages } = pagination;
        let html = '';

        // Botón anterior
        html += `<button ${page <= 1 ? 'disabled' : ''} onclick="adminPortal.loadUsuarios(${page - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // Páginas
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
            html += `<button class="${i === page ? 'active' : ''}" onclick="adminPortal.loadUsuarios(${i})">
                ${i}
            </button>`;
        }

        // Botón siguiente
        html += `<button ${page >= totalPages ? 'disabled' : ''} onclick="adminPortal.loadUsuarios(${page + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;

        container.innerHTML = html;
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Global functions for HTML onclick events
function mostrarModalCrearUsuario() {
    document.getElementById('modalCrearUsuario').style.display = 'flex';
    mostrarCamposRol(); // Reset form
}

function mostrarCamposRol() {
    const rol = document.getElementById('nuevoRol').value;
    const camposMedico = document.getElementById('camposMedico');
    const permisosGrid = document.getElementById('permisosGrid');

    // Mostrar/ocultar campos específicos
    if (camposMedico) {
        camposMedico.style.display = rol === 'doctor' ? 'block' : 'none';
    }

    // Cargar permisos por rol
    if (permisosGrid) {
        const permisosPorRol = {
            'admin': [
                'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'usuarios.ver',
                'pacientes.crear', 'pacientes.editar', 'pacientes.eliminar', 'pacientes.ver',
                'turnos.crear', 'turnos.editar', 'turnos.eliminar', 'turnos.ver',
                'historiales.crear', 'historiales.editar', 'historiales.ver',
                'recetas.crear', 'recetas.editar', 'recetas.ver',
                'reportes.ver', 'configuracion.editar'
            ],
            'doctor': [
                'pacientes.crear', 'pacientes.editar', 'pacientes.ver',
                'turnos.ver', 'turnos.editar',
                'historiales.crear', 'historiales.editar', 'historiales.ver',
                'recetas.crear', 'recetas.editar', 'recetas.ver'
            ],
            'recepcionista': [
                'pacientes.crear', 'pacientes.editar', 'pacientes.ver',
                'turnos.crear', 'turnos.editar', 'turnos.ver'
            ]
        };

        const permisos = permisosPorRol[rol] || [];
        permisosGrid.innerHTML = permisos.map(permiso => `
            <div class="permission-checkbox">
                <input type="checkbox" id="perm-${permiso}" value="${permiso}" checked>
                <label for="perm-${permiso}">${permiso}</label>
            </div>
        `).join('');
    }
}

function generarPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('nuevoPassword').value = result;
}

function editarUsuario(id) {
    console.log('Editar usuario:', id);
    // Implementar edición
}

function toggleBloqueoUsuario(id, bloquear) {
    if (confirm(`¿Está seguro de ${bloquear ? 'bloquear' : 'desbloquear'} este usuario?`)) {
        console.log(`${bloquear ? 'Bloquear' : 'Desbloquear'} usuario:`, id);
        // Implementar bloqueo/desbloqueo
    }
}

function resetearPassword(id) {
    if (confirm('¿Está seguro de resetear la contraseña de este usuario?')) {
        console.log('Resetear password:', id);
        // Implementar reseteo
    }
}

function eliminarUsuario(id) {
    if (confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
        console.log('Eliminar usuario:', id);
        // Implementar eliminación
    }
}

function exportarUsuarios() {
    console.log('Exportar usuarios');
    // Implementar exportación
}

function limpiarFiltros() {
    document.getElementById('searchUsuarios').value = '';
    document.getElementById('filterRol').value = '';
    document.getElementById('filterEstado').value = 'todos';
    adminPortal.loadUsuarios();
}

function editarPermisos(rol) {
    console.log('Editar permisos del rol:', rol);
    // Implementar edición de permisos
}

function cargarLogs() {
    adminPortal.loadAuditoriaData();
}

function crearBackup() {
    console.log('Crear backup');
    // Implementar backup
}

function programarBackup() {
    console.log('Programar backup automático');
    // Implementar programación
}

function resetearConfiguracion() {
    if (confirm('¿Está seguro de restaurar la configuración por defecto?')) {
        console.log('Resetear configuración');
        // Implementar reset
    }
}

function guardarConfiguracion() {
    console.log('Guardar configuración');
    // Implementar guardado
}

function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize admin portal
let adminPortal;
document.addEventListener('DOMContentLoaded', () => {
    adminPortal = new AdminPortal();
});
