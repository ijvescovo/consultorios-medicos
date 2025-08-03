// Middleware de manejo de errores para Express
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error
    console.error('Error:', err.stack);

    // Error de validación de Mongoose/Sequelize
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(error => error.message).join(', ');
        error = { statusCode: 400, message };
    }

    // Error de duplicado (unique constraint)
    if (err.code === 11000 || err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Recurso duplicado';
        error = { statusCode: 400, message };
    }

    // Error de autenticación JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = { statusCode: 401, message };
    }

    // Error de token expirado
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { statusCode: 401, message };
    }

    // Error de Sequelize de validación
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(error => error.message).join(', ');
        error = { statusCode: 400, message };
    }

    // Error de conexión a base de datos
    if (err.name === 'SequelizeConnectionError') {
        const message = 'Error de conexión a la base de datos';
        error = { statusCode: 500, message };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
