// routes/transactionRoutes.js
// Define as rotas de transações financeiras: depósito, saque e transferência.
// Todas as rotas aqui são PROTEGIDAS — o authMiddleware exige um token JWT válido.

const { Router } = require('express');
const { deposit, withdraw, transfer } = require('../controllers/transactionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();

// Aplica o authMiddleware em TODAS as rotas deste router
// Qualquer requisição sem token válido receberá 401 antes de chegar no controller
router.use(authMiddleware);

// POST /transactions/deposit — realiza um depósito
// Body esperado: { accountNumber: "1001", amount: 500 }
router.post('/deposit', deposit);

// POST /transactions/withdraw — realiza um saque
// Body esperado: { accountNumber: "1001", amount: 200 }
router.post('/withdraw', withdraw);

// POST /transactions/transfer — realiza uma transferência entre contas
// Body esperado: { fromAccountNumber: "1001", toAccountNumber: "1002", amount: 100 }
router.post('/transfer', transfer);

module.exports = router;
