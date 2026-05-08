const { Router } = require('express')
const accountController = require('../controllers/accountController')

const router = Router()

router.get('/', accountController.listAccounts)

router.get('/:accountNumber', accountController.getAccountDetails)

module.exports = router