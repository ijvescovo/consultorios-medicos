document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard cargando...');
    
    // Obtener token desde diferentes ubicaciones posibles
    let token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
    console.log('Token inicial:', token ? 'Encontrado' : 'No encontrado');
    
    // Si no hay token, intentar obtenerlo de la sesión completa
    if (!token) {
        const sessionData = localStorage.getItem('consultorio_session');
        console.log('Datos de sesión:', sessionData ? 'Encontrados' : 'No encontrados');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                token = session.token;
                console.log('Token obtenido de sesión:', token ? 'Sí' : 'No');
            } catch (error) {
                console.error('Error al parsear sesión:', error);
            }
        }
    }
    
    if (!token) {
        console.log('No hay token válido, redirigiendo a login');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Token válido encontrado, continuando con dashboard');
    
    // Obtener información del usuario
    let userData = null;
    const sessionData = localStorage.getItem('consultorio_session');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            userData = session.user;
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
        }
    }
    
    // Mostrar nombre del usuario en la interfaz
    if (userData) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `${userData.name} (${userData.type})`;
        }
        
        // Mostrar menú de administración solo para administradores
        const adminSection = document.getElementById('adminSection');
        const adminMenu = document.getElementById('adminMenu');
        
        if (userData.type === 'admin') {
            console.log('Usuario administrador - mostrando menú de administración');
            if (adminSection) adminSection.style.display = 'block';
            if (adminMenu) adminMenu.style.display = 'block';
        } else {
            console.log('Usuario no administrador - ocultando menú de administración');
            if (adminSection) adminSection.style.display = 'none';
            if (adminMenu) adminMenu.style.display = 'none';
        }
    }
    
    // Configurar FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridDay',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth'
        },
        events: async (fetchInfo, successCallback, failureCallback) => {
            try {
                const response = await fetch(`http://localhost:5000/api/turnos?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const turnos = await response.json();
                
                const events = turnos.map(turno => ({
                    id: turno.id,
                    title: `${turno.paciente_nombre} - ${turno.motivo}`,
                    start: turno.fecha_hora,
                    extendedProps: {
                        pacienteId: turno.paciente_id,
                        medicoId: turno.medico_id
                    }
                }));
                
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },
        eventClick: function(info) {
            const pacienteId = info.event.extendedProps.pacienteId;
            window.location.href = `paciente-detalle.html?id=${pacienteId}`;
        }
    });
    
    calendar.render();
    
    // Obtener estadísticas
    try {
        const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('todayAppointments').textContent = stats.turnosHoy;
            document.getElementById('totalPatients').textContent = stats.totalPacientes;
        }
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
    }
    
    // Obtener pacientes recientes
    try {
        const patientsResponse = await fetch('http://localhost:5000/api/pacientes/recientes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (patientsResponse.ok) {
            const pacientes = await patientsResponse.json();
            const container = document.getElementById('recentPatients');
            
            pacientes.forEach(paciente => {
                const pacienteCard = document.createElement('div');
                pacienteCard.className = 'patient-card';
                pacienteCard.innerHTML = `
                    <h3>${paciente.nombre}</h3>
                    <p>DNI: ${paciente.dni}</p>
                    <p>Obra Social: ${paciente.obra_social}</p>
                    <a href="paciente-detalle.html?id=${paciente.id}">Ver Detalles</a>
                `;
                container.appendChild(pacienteCard);
            });
        }
    } catch (error) {
        console.error('Error al obtener pacientes recientes:', error);
    }
    
    // Configurar accesos rápidos
    document.getElementById('quickNewPatient').addEventListener('click', () => {
        window.location.href = 'pacientes.html?new=true';
    });
    
    document.getElementById('quickNewAppointment').addEventListener('click', () => {
        window.location.href = 'turnos.html?new=true';
    });
    
    document.getElementById('quickNewPrescription').addEventListener('click', () => {
        window.location.href = 'recetas.html?new=true';
    });
    
    document.getElementById('quickImportPAMI').addEventListener('click', () => {
        // Lógica para importar desde PAMI
        alert('Funcionalidad de importación desde PAMI');
    });
    
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Limpiar todas las sesiones
            localStorage.removeItem('consultorio_session');
            localStorage.removeItem('token');
            sessionStorage.removeItem('auth_token');
            
            // Redirigir al login
            window.location.href = 'login.html';
        });
    }
});