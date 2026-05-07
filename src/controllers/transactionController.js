// controllers/transactionController.js
// Recebe as requisições HTTP de transações financeiras e delega ao accountService.
// Este controller é protegido pelo authMiddleware — só aceita requisições com token JWT válido.

const {
  deposit,
  withdraw,
  transfer
} = require('../services/accountService');

// Função auxiliar compartilhada para enviar resposta de erro ou sucesso
const handleResult = (res, result) => {
  if (result.error) {
    return res.status(result.error.status).json({ error: result.error.message });
  }
  return res.status(200).json(result.data);
};

// POST /transactions/deposit
// Body esperado: { accountNumber: "1001", amount: 500 }
const depositHandler = (req, res) => {
  // accountNumber vem no body junto com o amount
  const { accountNumber, amount } = req.body;
  return handleResult(res, deposit(accountNumber, amount));
};

// POST /transactions/withdraw
// Body esperado: { accountNumber: "1001", amount: 200 }
const withdrawHandler = (req, res) => {
  const { accountNumber, amount } = req.body;
  return handleResult(res, withdraw(accountNumber, amount));
};

// POST /transactions/transfer
// Body esperado: { fromAccountNumber: "1001", toAccountNumber: "1002", amount: 100 }
const transferHandler = (req, res) => {
  return handleResult(res, transfer(req.body));
};

module.exports = {
  deposit: depositHandler,
  withdraw: withdrawHandler,
  transfer: transferHandler
};
