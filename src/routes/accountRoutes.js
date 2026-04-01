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
const { sendJson } = require('../utils/http');

const notFound = (res) => sendJson(res, 404, { error: 'Rota não encontrada.' });

const routeRequest = async (req, res, path) => {
  const method = req.method;

  if (method === 'GET' && path === '/accounts') return getAccounts(req, res);
  if (method === 'POST' && path === '/accounts') return createAccount(req, res);
  if (method === 'POST' && path === '/accounts/transfer') return createTransfer(req, res);

  const accountMatch = path.match(/^\/accounts\/(\d+)$/);
  if (accountMatch && method === 'PUT') return editAccount(req, res, accountMatch[1]);
  if (accountMatch && method === 'DELETE') return deleteAccount(req, res, accountMatch[1]);

  const depositMatch = path.match(/^\/accounts\/(\d+)\/deposit$/);
  if (depositMatch && method === 'POST') return createDeposit(req, res, depositMatch[1]);

  const withdrawMatch = path.match(/^\/accounts\/(\d+)\/withdraw$/);
  if (withdrawMatch && method === 'POST') return createWithdraw(req, res, withdrawMatch[1]);

  const balanceMatch = path.match(/^\/accounts\/(\d+)\/balance$/);
  if (balanceMatch && method === 'GET') return showBalance(req, res, balanceMatch[1]);

  const statementMatch = path.match(/^\/accounts\/(\d+)\/statement$/);
  if (statementMatch && method === 'GET') return showStatement(req, res, statementMatch[1]);

  return notFound(res);
};

module.exports = {
  routeRequest
};
