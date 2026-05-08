const { Router } = require('express')
const transactionController = require('../controllers/transactionController')

const router = Router()

router.post('/deposit', transactionController.deposit)
router.post('/withdraw', transactionController.withdraw)
router.post('/transfer', transactionController.transfer)

module.exports = router