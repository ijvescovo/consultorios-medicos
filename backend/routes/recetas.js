const express = require('express');
const router = express.Router();

// Placeholder para rutas de recetas
router.get('/', (req, res) => {
    res.json({ message: 'Rutas de recetas - En desarrollo' });
});

module.exports = router;
