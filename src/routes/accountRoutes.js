const { Router } = require('express')
const accountController = require('../controllers/accountController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = Router()

router.use(authMiddleware) // protege todas as rotas de /accounts

router.get('/', accountController.listAccounts)
router.get('/:accountNumber', accountController.getAccountDetails)

module.exports = router