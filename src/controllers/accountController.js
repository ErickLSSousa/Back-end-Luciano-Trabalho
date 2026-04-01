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
const { sendJson, sendNoContent } = require('../utils/http');
const { parseBody } = require('../utils/parseBody');

const handleResult = (res, result, noContent = false) => {
  if (result.error) {
    return sendJson(res, result.error.status, { error: result.error.message });
  }

  if (noContent) {
    return sendNoContent(res);
  }

  return sendJson(res, 200, result.data);
};

const getAccounts = (req, res) => sendJson(res, 200, listAccounts());

const createAccount = async (req, res) => {
  const body = await parseBody(req);
  const result = openAccount(body);

  if (result.error) {
    return sendJson(res, result.error.status, { error: result.error.message });
  }

  return sendJson(res, 201, result.data);
};

const editAccount = async (req, res, accountNumber) => {
  const body = await parseBody(req);
  return handleResult(res, updateAccount(accountNumber, body));
};

const deleteAccount = (req, res, accountNumber) =>
  handleResult(res, removeAccount(accountNumber), true);

const createDeposit = async (req, res, accountNumber) => {
  const { amount } = await parseBody(req);
  return handleResult(res, deposit(accountNumber, amount));
};

const createWithdraw = async (req, res, accountNumber) => {
  const { amount } = await parseBody(req);
  return handleResult(res, withdraw(accountNumber, amount));
};

const createTransfer = async (req, res) => {
  const body = await parseBody(req);
  return handleResult(res, transfer(body));
};

const showBalance = (req, res, accountNumber) => handleResult(res, getBalance(accountNumber));

const showStatement = (req, res, accountNumber) => handleResult(res, getStatement(accountNumber));

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
