const express = require('express')
const router = express.Router()
const { deposit } = require('../controllers/depositController')
const authMiddleware = require('../middlewares/authMiddleware')

// POST /deposit
// Requer token JWT válido no header: Authorization: Bearer <token>
router.post('/', authMiddleware, deposit)

module.exports = router