const express = require('express');
const router = express.Router();

// Placeholder para rutas de pacientes
// Estas rutas se implementarán cuando se conecte con el frontend

router.get('/', (req, res) => {
    res.json({ message: 'Rutas de pacientes - En desarrollo' });
});

module.exports = router;
