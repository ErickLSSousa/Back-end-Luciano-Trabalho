// routes/accountRoutes.js
// Define todas as rotas relacionadas a contas bancárias.
// Usa o Router do Express — cada rota aponta para um controller específico.

const { Router } = require('express');
const {
  getAccounts,
  createAccount,
  editAccount,
  deleteAccount,
  createDeposit,
  createWithdraw,
  createTransfer,
  showBalance,
  showStatement
} = require('../controllers/accountController');

const router = Router();

// GET /accounts — lista todas as contas bancárias
router.get('/', getAccounts);

// POST /accounts — cria uma nova conta bancária
router.post('/', createAccount);

// PUT /accounts/:accountNumber — atualiza dados pessoais de uma conta
router.put('/:accountNumber', editAccount);

// DELETE /accounts/:accountNumber — remove uma conta bancária
router.delete('/:accountNumber', deleteAccount);

// POST /accounts/:accountNumber/deposit — realiza um depósito na conta
router.post('/:accountNumber/deposit', createDeposit);

// POST /accounts/:accountNumber/withdraw — realiza um saque da conta
router.post('/:accountNumber/withdraw', createWithdraw);

// POST /accounts/transfer — transfere entre duas contas
// ATENÇÃO: esta rota deve ficar ANTES de /:accountNumber para não ser capturada como ID
router.post('/transfer', createTransfer);

// GET /accounts/:accountNumber/balance — consulta o saldo da conta
router.get('/:accountNumber/balance', showBalance);

// GET /accounts/:accountNumber/statement — consulta o extrato da conta
router.get('/:accountNumber/statement', showStatement);

module.exports = router;
