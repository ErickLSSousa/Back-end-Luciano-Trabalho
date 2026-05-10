const express = require('express')
const router = express.Router()
const { transfer, getTransactions } = require('../controllers/transactionController')
const authMiddleware = require('../middlewares/authMiddleware')

// POST /transactions/transfer
router.post('/transfer', authMiddleware, transfer)

// GET /transactions/:accountNumber
router.get('/:accountNumber', authMiddleware, getTransactions)

module.exports = router