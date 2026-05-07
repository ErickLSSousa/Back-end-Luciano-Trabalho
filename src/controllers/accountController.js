// controllers/accountController.js
// Recebe as requisições HTTP de contas bancárias e delega ao accountService.
// handleResult centraliza o envio de resposta para evitar repetição de código.

const {
  listAccounts,
  openAccount,
  updateAccount,
  removeAccount,
  deposit,
  withdraw,
  transfer,
  getBalance,
  getStatement
} = require('../services/accountService');

// Função auxiliar: verifica se o service retornou erro ou sucesso e responde adequadamente.
// noContent = true envia status 204 (sem corpo) — usado no DELETE.
const handleResult = (res, result, noContent = false) => {
  if (result.error) {
    // Retorna o código de status específico do erro (400, 404, 409, etc.)
    return res.status(result.error.status).json({ error: result.error.message });
  }

  if (noContent) {
    // 204 No Content — resposta de sucesso sem corpo (padrão para DELETE)
    return res.status(204).send();
  }

  return res.status(200).json(result.data);
};

// GET /accounts — lista todas as contas
const getAccounts = (req, res) => res.status(200).json(listAccounts());

// POST /accounts — cria uma nova conta com os dados do body
const createAccount = (req, res) => {
  const result = openAccount(req.body);

  if (result.error) {
    return res.status(result.error.status).json({ error: result.error.message });
  }

  // 201 Created — recurso novo foi criado com sucesso
  return res.status(201).json(result.data);
};

// PUT /accounts/:accountNumber — atualiza dados pessoais da conta
const editAccount = (req, res) =>
  handleResult(res, updateAccount(req.params.accountNumber, req.body));

// DELETE /accounts/:accountNumber — remove a conta (204 sem corpo)
const deleteAccount = (req, res) =>
  handleResult(res, removeAccount(req.params.accountNumber), true);

// POST /accounts/:accountNumber/deposit — deposita um valor na conta
const createDeposit = (req, res) =>
  handleResult(res, deposit(req.params.accountNumber, req.body.amount));

// POST /accounts/:accountNumber/withdraw — saca um valor da conta
const createWithdraw = (req, res) =>
  handleResult(res, withdraw(req.params.accountNumber, req.body.amount));

// POST /accounts/transfer — transfere entre duas contas
const createTransfer = (req, res) =>
  handleResult(res, transfer(req.body));

// GET /accounts/:accountNumber/balance — retorna o saldo atual
const showBalance = (req, res) =>
  handleResult(res, getBalance(req.params.accountNumber));

// GET /accounts/:accountNumber/statement — retorna o extrato completo
const showStatement = (req, res) =>
  handleResult(res, getStatement(req.params.accountNumber));

module.exports = {
  getAccounts,
  createAccount,
  editAccount,
  deleteAccount,
  createDeposit,
  createWithdraw,
  createTransfer,
  showBalance,
  showStatement
};
