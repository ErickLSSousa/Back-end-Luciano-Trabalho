const {
  getAllAccounts,
  getAccount,
  cpfExists,
  createAccount,
  deleteAccount
} = require('../data/accountStore');

const listAccounts = () => getAllAccounts();

const openAccount = ({ fullName, cpf, email, phone }) => {
  if (!fullName || !cpf || !email || !phone) {
    return { error: { status: 400, message: 'Campos obrigatórios: fullName, cpf, email, phone.' } };
  }

  if (cpfExists(cpf)) {
    return { error: { status: 409, message: 'Já existe conta para este CPF.' } };
  }

  return { data: createAccount({ fullName, cpf, email, phone }) };
};

const updateAccount = (accountNumber, { fullName, email, phone }) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  if (!fullName && !email && !phone) {
    return {
      error: {
        status: 400,
        message: 'Informe ao menos um campo para atualizar: fullName, email, phone.'
      }
    };
  }

  if (fullName) account.fullName = fullName;
  if (email) account.email = email;
  if (phone) account.phone = phone;

  return { data: account };
};

const removeAccount = (accountNumber) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  deleteAccount(account.accountNumber);
  return { data: null };
};

const deposit = (accountNumber, amount) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return { error: { status: 400, message: 'Valor de depósito inválido.' } };
  }

  account.balance += value;
  account.statement.push({ type: 'DEPOSIT', amount: value, date: new Date().toISOString() });

  return {
    data: {
      message: 'Depósito realizado com sucesso.',
      balance: account.balance
    }
  };
};

const withdraw = (accountNumber, amount) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return { error: { status: 400, message: 'Valor de saque inválido.' } };
  }

  if (account.balance < value) {
    return { error: { status: 400, message: 'Saldo insuficiente.' } };
  }

  account.balance -= value;
  account.statement.push({ type: 'WITHDRAW', amount: value, date: new Date().toISOString() });

  return {
    data: {
      message: 'Saque realizado com sucesso.',
      balance: account.balance
    }
  };
};

const transfer = ({ fromAccountNumber, toAccountNumber, amount }) => {
  const from = getAccount(fromAccountNumber);
  const to = getAccount(toAccountNumber);

  if (!from || !to) {
    return { error: { status: 404, message: 'Conta de origem ou destino não encontrada.' } };
  }

  if (from.accountNumber === to.accountNumber) {
    return {
      error: {
        status: 400,
        message: 'A conta de origem deve ser diferente da conta de destino.'
      }
    };
  }

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return { error: { status: 400, message: 'Valor de transferência inválido.' } };
  }

  if (from.balance < value) {
    return { error: { status: 400, message: 'Saldo insuficiente para transferência.' } };
  }

  from.balance -= value;
  to.balance += value;

  const date = new Date().toISOString();
  from.statement.push({ type: 'TRANSFER_OUT', amount: value, toAccountNumber: to.accountNumber, date });
  to.statement.push({ type: 'TRANSFER_IN', amount: value, fromAccountNumber: from.accountNumber, date });

  return {
    data: {
      message: 'Transferência realizada com sucesso.',
      fromBalance: from.balance,
      toBalance: to.balance
    }
  };
};

const getBalance = (accountNumber) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  return {
    data: {
      accountNumber: account.accountNumber,
      balance: account.balance
    }
  };
};

const getStatement = (accountNumber) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  return {
    data: {
      accountNumber: account.accountNumber,
      statement: account.statement
    }
  };
};

module.exports = {
  listAccounts,
  openAccount,
  updateAccount,
  removeAccount,
  deposit,
  withdraw,
  transfer,
  getBalance,
  getStatement
};
