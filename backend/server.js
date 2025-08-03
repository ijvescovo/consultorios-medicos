require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Importar modelos y conexión a base de datos
const { sequelize, sincronizarBaseDatos } = require('./models');
const errorHandler = require('./middlewares/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth');
const pacienteRoutes = require('./routes/pacientes');
const turnoRoutes = require('./routes/turnos');
const recetaRoutes = require('./routes/recetas');
const historialRoutes = require('./routes/historial');

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/historial', historialRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Estadísticas para el dashboard
        const stats = {
            turnosHoy: 0,
            totalPacientes: 0
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor con conexión a base de datos
const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
    try {
        // Conectar a la base de datos
        const conexionExitosa = await sincronizarBaseDatos();
        
        if (!conexionExitosa) {
            console.error('❌ No se pudo conectar a la base de datos');
            process.exit(1);
        }
        
        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
            console.log(`📊 Base de datos PostgreSQL conectada`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};

// Iniciar la aplicación
iniciarServidor();