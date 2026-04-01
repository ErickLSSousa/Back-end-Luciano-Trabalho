const http = require('http');
const { URL } = require('url');

const accounts = new Map();
let nextAccountNumber = 1001;

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const sendNoContent = (res) => {
  res.writeHead(204);
  res.end();
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('JSON inválido.'));
      }
    });

    req.on('error', reject);
  });

const getAccount = (accountNumber) => accounts.get(String(accountNumber));

const notFound = (res) => sendJson(res, 404, { error: 'Rota não encontrada.' });

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    const method = req.method;

    if (method === 'GET' && path === '/accounts') {
      return sendJson(res, 200, Array.from(accounts.values()));
    }

    if (method === 'POST' && path === '/accounts') {
      const { fullName, cpf, email, phone } = await parseBody(req);

      if (!fullName || !cpf || !email || !phone) {
        return sendJson(res, 400, { error: 'Campos obrigatórios: fullName, cpf, email, phone.' });
      }

      const cpfExists = Array.from(accounts.values()).some((account) => account.cpf === cpf);
      if (cpfExists) {
        return sendJson(res, 409, { error: 'Já existe conta para este CPF.' });
      }

      const account = {
        accountNumber: String(nextAccountNumber++),
        fullName,
        cpf,
        email,
        phone,
        balance: 0,
        statement: []
      };

      accounts.set(account.accountNumber, account);
      return sendJson(res, 201, account);
    }

    const accountMatch = path.match(/^\/accounts\/(\d+)$/);
    if (accountMatch && method === 'PUT') {
      const account = getAccount(accountMatch[1]);
      if (!account) return sendJson(res, 404, { error: 'Conta não encontrada.' });

      const { fullName, email, phone } = await parseBody(req);
      if (!fullName && !email && !phone) {
        return sendJson(res, 400, {
          error: 'Informe ao menos um campo para atualizar: fullName, email, phone.'
        });
      }

      if (fullName) account.fullName = fullName;
      if (email) account.email = email;
      if (phone) account.phone = phone;

      return sendJson(res, 200, account);
    }

    if (accountMatch && method === 'DELETE') {
      const account = getAccount(accountMatch[1]);
      if (!account) return sendJson(res, 404, { error: 'Conta não encontrada.' });

      accounts.delete(account.accountNumber);
      return sendNoContent(res);
    }

    const depositMatch = path.match(/^\/accounts\/(\d+)\/deposit$/);
    if (depositMatch && method === 'POST') {
      const account = getAccount(depositMatch[1]);
      if (!account) return sendJson(res, 404, { error: 'Conta não encontrada.' });

      const { amount } = await parseBody(req);
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        return sendJson(res, 400, { error: 'Valor de depósito inválido.' });
      }

      account.balance += value;
      account.statement.push({ type: 'DEPOSIT', amount: value, date: new Date().toISOString() });
      return sendJson(res, 200, { message: 'Depósito realizado com sucesso.', balance: account.balance });
    }

    const withdrawMatch = path.match(/^\/accounts\/(\d+)\/withdraw$/);
    if (withdrawMatch && method === 'POST') {
      const account = getAccount(withdrawMatch[1]);
      if (!account) return sendJson(res, 404, { error: 'Conta não encontrada.' });

      const { amount } = await parseBody(req);
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        return sendJson(res, 400, { error: 'Valor de saque inválido.' });
      }

      if (account.balance < value) {
        return sendJson(res, 400, { error: 'Saldo insuficiente.' });
      }

      account.balance -= value;
      account.statement.push({ type: 'WITHDRAW', amount: value, date: new Date().toISOString() });
      return sendJson(res, 200, { message: 'Saque realizado com sucesso.', balance: account.balance });
    }

    if (method === 'POST' && path === '/accounts/transfer') {
      const { fromAccountNumber, toAccountNumber, amount } = await parseBody(req);
      const from = getAccount(fromAccountNumber);
      const to = getAccount(toAccountNumber);

      if (!from || !to) {
        return sendJson(res, 404, { error: 'Conta de origem ou destino não encontrada.' });
      }

      if (from.accountNumber === to.accountNumber) {
        return sendJson(res, 400, {
          error: 'A conta de origem deve ser diferente da conta de destino.'
        });
      }

      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        return sendJson(res, 400, { error: 'Valor de transferência inválido.' });
      }

      if (from.balance < value) {
        return sendJson(res, 400, { error: 'Saldo insuficiente para transferência.' });
      }

      from.balance -= value;
      to.balance += value;
      const date = new Date().toISOString();
      from.statement.push({ type: 'TRANSFER_OUT', amount: value, toAccountNumber: to.accountNumber, date });
      to.statement.push({ type: 'TRANSFER_IN', amount: value, fromAccountNumber: from.accountNumber, date });

      return sendJson(res, 200, {
        message: 'Transferência realizada com sucesso.',
        fromBalance: from.balance,
        toBalance: to.balance
      });
    }

    const balanceMatch = path.match(/^\/accounts\/(\d+)\/balance$/);
    if (balanceMatch && method === 'GET') {
      const account = getAccount(balanceMatch[1]);
      if (!account) return sendJson(res, 404, { error: 'Conta não encontrada.' });

      return sendJson(res, 200, { accountNumber: account.accountNumber, balance: account.balance });
    }

    const statementMatch = path.match(/^\/accounts\/(\d+)\/statement$/);
    if (statementMatch && method === 'GET') {
      const account = getAccount(statementMatch[1]);
      if (!account) return sendJson(res, 404, { error: 'Conta não encontrada.' });

      return sendJson(res, 200, {
        accountNumber: account.accountNumber,
        statement: account.statement
      });
    }

    return notFound(res);
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Erro ao processar requisição.' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Senaibank API rodando na porta ${PORT}`);
});
