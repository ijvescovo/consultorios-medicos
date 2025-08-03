// Script para crear usuario administrador por defecto
const { sincronizarBaseDatos, Usuario } = require('../models');

async function crearAdminPorDefecto() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sincronizarBaseDatos();
        
        // Verificar si ya existe un administrador
        const adminExistente = await Usuario.findOne({
            where: { rol: 'admin' }
        });
        
        if (adminExistente) {
            console.log('✅ Ya existe un usuario administrador:', adminExistente.email);
            return;
        }
        
        // Crear usuario administrador por defecto
        const adminData = {
            nombre: 'Administrador',
            apellido: 'Sistema',
            email: 'admin@consultorio.com',
            password: 'admin123',
            rol: 'admin',
            activo: true,
            permisos: [
                'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'usuarios.ver',
                'pacientes.crear', 'pacientes.editar', 'pacientes.eliminar', 'pacientes.ver',
                'turnos.crear', 'turnos.editar', 'turnos.eliminar', 'turnos.ver',
                'historiales.crear', 'historiales.editar', 'historiales.ver',
                'recetas.crear', 'recetas.editar', 'recetas.ver',
                'reportes.ver', 'configuracion.editar'
            ]
        };
        
        const nuevoAdmin = await Usuario.create(adminData);
        
        console.log('✅ Usuario administrador creado exitosamente:');
        console.log('   Email:', nuevoAdmin.email);
        console.log('   Contraseña: admin123');
        console.log('   Rol:', nuevoAdmin.rol);
        console.log('');
        console.log('🛡️ Puedes acceder al Portal de Administración en: http://localhost:5000/admin-portal.html');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña por defecto después del primer login');
        
    } catch (error) {
        console.error('❌ Error creando usuario administrador:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    crearAdminPorDefecto()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = crearAdminPorDefecto;
