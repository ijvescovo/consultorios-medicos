document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.rol);
                    localStorage.setItem('userName', data.nombre);
                    
                    // Redirigir según el rol
                    if (data.rol === 'admin') {
                        window.location.href = 'dashboard.html';
                    } else if (data.rol === 'medico') {
                        window.location.href = 'dashboard.html';
                    } else if (data.rol === 'administrativo') {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    loginMessage.textContent = data.error || 'Error en la autenticación';
                    loginMessage.style.color = 'var(--danger)';
                }
            } catch (error) {
                console.error('Error:', error);
                loginMessage.textContent = 'Error de conexión con el servidor';
                loginMessage.style.color = 'var(--danger)';
            }
        });
    }
    
    // Cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
        });
    }
    
    // Mostrar nombre de usuario
    const userNameElement = document.getElementById('userName');
    const storedUserName = localStorage.getItem('userName');
    if (userNameElement && storedUserName) {
        userNameElement.textContent = `Bienvenido, ${storedUserName}`;
    }
});