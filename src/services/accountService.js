// services/accountService.js
// Contém toda a lógica de negócio relacionada a contas bancárias e transações.
// Cada função retorna { data } em caso de sucesso ou { error: { status, message } } em caso de falha.

const {
  getAllAccounts,
  getAccount,
  cpfExists,
  createAccount,
  deleteAccount
} = require('../data/accountStore');

const { createAccountSchema, updateAccountSchema } = require('../validations/userSchema');
const { transactionSchema, transferSchema } = require('../validations/transactionSchema');

// Retorna todas as contas cadastradas
const listAccounts = () => getAllAccounts();

// Cria uma nova conta após validar os campos com o schema Zod
const openAccount = (body) => {
  // safeParse valida sem lançar exceção — retorna success/error
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(' | ');
    return { error: { status: 400, message } };
  }

  const { fullName, cpf, email, phone } = parsed.data;

  // CPF duplicado não é permitido
  if (cpfExists(cpf)) {
    return { error: { status: 409, message: 'Já existe conta para este CPF.' } };
  }

  return { data: createAccount({ fullName, cpf, email, phone }) };
};

// Atualiza os dados pessoais de uma conta existente
const updateAccount = (accountNumber, body) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  // Valida os campos enviados — ao menos um deve estar presente
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(' | ');
    return { error: { status: 400, message } };
  }

  const { fullName, email, phone } = parsed.data;

  // Atualiza apenas os campos que foram enviados
  if (fullName) account.fullName = fullName;
  if (email) account.email = email;
  if (phone) account.phone = phone;

  return { data: account };
};

// Remove uma conta pelo número
const removeAccount = (accountNumber) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  deleteAccount(account.accountNumber);
  return { data: null };
};

// Realiza um depósito na conta informada
const deposit = (accountNumber, amount) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  // Converte para número antes de validar (o body pode vir como string)
  const parsed = transactionSchema.safeParse({ amount: Number(amount) });
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(' | ');
    return { error: { status: 400, message } };
  }

  const value = parsed.data.amount;

  // Adiciona o valor ao saldo e registra no extrato
  account.balance += value;
  account.statement.push({
    type: 'DEPOSIT',
    amount: value,
    date: new Date().toISOString()
  });

  return {
    data: {
      message: 'Depósito realizado com sucesso.',
      balance: account.balance
    }
  };
};

// Realiza um saque da conta informada
const withdraw = (accountNumber, amount) => {
  const account = getAccount(accountNumber);
  if (!account) {
    return { error: { status: 404, message: 'Conta não encontrada.' } };
  }

  const parsed = transactionSchema.safeParse({ amount: Number(amount) });
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(' | ');
    return { error: { status: 400, message } };
  }

  const value = parsed.data.amount;

  // Verifica se há saldo suficiente antes de debitar
  if (account.balance < value) {
    return { error: { status: 400, message: 'Saldo insuficiente.' } };
  }

  account.balance -= value;
  account.statement.push({
    type: 'WITHDRAW',
    amount: value,
    date: new Date().toISOString()
  });

  return {
    data: {
      message: 'Saque realizado com sucesso.',
      balance: account.balance
    }
  };
};

// Transfere um valor entre duas contas diferentes
const transfer = (body) => {
  // Valida origem, destino e valor com o transferSchema
  const parsed = transferSchema.safeParse({
    fromAccountNumber: body.fromAccountNumber,
    toAccountNumber: body.toAccountNumber,
    amount: Number(body.amount)
  });
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(' | ');
    return { error: { status: 400, message } };
  }

  const { fromAccountNumber, toAccountNumber, amount } = parsed.data;

  const from = getAccount(fromAccountNumber);
  const to = getAccount(toAccountNumber);

  if (!from || !to) {
    return { error: { status: 404, message: 'Conta de origem ou destino não encontrada.' } };
  }

  // Impede transferência para a própria conta
  if (from.accountNumber === to.accountNumber) {
    return {
      error: {
        status: 400,
        message: 'Conta de origem deve ser diferente da conta de destino.'
      }
    };
  }

  if (from.balance < amount) {
    return { error: { status: 400, message: 'Saldo insuficiente para transferência.' } };
  }

  const date = new Date().toISOString();

  // Débita da origem e credita no destino
  from.balance -= amount;
  to.balance += amount;

  // Registra a saída no extrato da conta de origem
  from.statement.push({
    type: 'TRANSFER_OUT',
    amount,
    toAccountNumber: to.accountNumber,
    date
  });

  // Registra a entrada no extrato da conta de destino
  to.statement.push({
    type: 'TRANSFER_IN',
    amount,
    fromAccountNumber: from.accountNumber,
    date
  });

  return {
    data: {
      message: 'Transferência realizada com sucesso.',
      fromBalance: from.balance,
      toBalance: to.balance
    }
  };
};

// Retorna o saldo atual da conta
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

// Retorna o extrato completo (histórico de transações) da conta
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
