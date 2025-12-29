const express = require('express');
const router = express.Router();
const { getDinosaurs, seedDatabase } = require('../controllers/dinoController');

// When user visits /api/dinosaurs/
router.get('/', getDinosaurs);

// When user sends POST to /api/dinosaurs/seed
router.post('/seed', seedDatabase);

module.exports = router;