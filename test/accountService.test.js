const test = require('node:test');
const assert = require('node:assert/strict');

const {
  listAccounts,
  openAccount,
  deposit,
  withdraw,
  transfer,
  getStatement,
  getBalance
} = require('../src/services/accountService');
const { resetStore } = require('../src/data/accountStore');

const createSampleAccount = (overrides = {}) =>
  openAccount({
    fullName: 'Usuário Teste',
    cpf: '11111111111',
    email: 'teste@email.com',
    phone: '11999999999',
    ...overrides
  });

test.beforeEach(() => {
  resetStore();
});

test('deve criar conta e listar contas', () => {
  const result = createSampleAccount();

  assert.equal(result.error, undefined);
  assert.equal(result.data.accountNumber, '1001');
  assert.equal(listAccounts().length, 1);
});

test('não deve permitir CPF duplicado', () => {
  createSampleAccount();
  const result = createSampleAccount({
    fullName: 'Outra Pessoa',
    email: 'outra@email.com',
    phone: '11888887777'
  });

  assert.equal(result.error.status, 409);
  assert.match(result.error.message, /CPF/);
});

test('deve depositar, sacar e consultar saldo', () => {
  const account = createSampleAccount().data;

  const depositResult = deposit(account.accountNumber, 500);
  assert.equal(depositResult.error, undefined);

  const withdrawResult = withdraw(account.accountNumber, 200);
  assert.equal(withdrawResult.error, undefined);

  const balance = getBalance(account.accountNumber);
  assert.equal(balance.data.balance, 300);
});

test('deve bloquear saque por saldo insuficiente', () => {
  const account = createSampleAccount().data;

  const result = withdraw(account.accountNumber, 50);

  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /Saldo insuficiente/);
});

test('deve transferir entre contas e registrar extrato', () => {
  const from = createSampleAccount({ cpf: '11111111111' }).data;
  const to = createSampleAccount({
    fullName: 'Destino',
    cpf: '22222222222',
    email: 'destino@email.com',
    phone: '11777776666'
  }).data;

  deposit(from.accountNumber, 250);

  const transferResult = transfer({
    fromAccountNumber: from.accountNumber,
    toAccountNumber: to.accountNumber,
    amount: 100
  });

  assert.equal(transferResult.error, undefined);
  assert.equal(transferResult.data.fromBalance, 150);
  assert.equal(transferResult.data.toBalance, 100);

  const fromStatement = getStatement(from.accountNumber).data.statement;
  const toStatement = getStatement(to.accountNumber).data.statement;

  assert.equal(fromStatement.at(-1).type, 'TRANSFER_OUT');
  assert.equal(toStatement.at(-1).type, 'TRANSFER_IN');
});
