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

const handleResult = (res, result, noContent = false) => {
  if (result.error) {
    
    return res.status(result.error.status).json({ error: result.error.message });
  }

  if (noContent) {
    
    return res.status(204).send();
  }

  return res.status(200).json(result.data);
};


const getAccounts = (req, res) => {
  const accounts = listAccounts()
  return res.status(200).json({ accounts })
}
const createAccount = (req, res) => {
  const result = openAccount(req.body);

  if (result.error) {
    return res.status(result.error.status).json({ error: result.error.message });
  }

  
  return res.status(201).json(result.data);
};


const editAccount = (req, res) =>
  handleResult(res, updateAccount(req.params.accountNumber, req.body));


const deleteAccount = (req, res) =>
  handleResult(res, removeAccount(req.params.accountNumber), true);


const createDeposit = (req, res) =>
  handleResult(res, deposit(req.params.accountNumber, req.body.amount));


const createWithdraw = (req, res) =>
  handleResult(res, withdraw(req.params.accountNumber, req.body.amount));


const createTransfer = (req, res) =>
  handleResult(res, transfer(req.body));


const showBalance = (req, res) =>
  handleResult(res, getBalance(req.params.accountNumber));


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
