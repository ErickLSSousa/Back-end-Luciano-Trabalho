// tests/accountService.test.js
// Testes unitários do accountService usando o módulo nativo node:test.
// Cada teste isola o estado resetando o store antes de rodar (beforeEach).

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

// Função auxiliar que cria uma conta com dados padrão.
// Aceita overrides para personalizar campos específicos sem repetir código.
const createSampleAccount = (overrides = {}) =>
  openAccount({
    fullName: 'Usuário Teste',
    cpf: '529.982.247-25', // CPF matematicamente válido
    email: 'teste@email.com',
    phone: '11999999999',
    password: 'senha123',
    ...overrides
  });

// Antes de cada teste, limpa o store para garantir isolamento entre testes
test.beforeEach(() => {
  resetStore();
});

// --- Testes de Conta ---

test('deve criar conta e listá-la', () => {
  const result = createSampleAccount();

  // Não deve ter retornado erro
  assert.equal(result.error, undefined);

  // Primeira conta criada deve ter número 1001
  assert.equal(result.data.accountNumber, '1001');

  // Deve aparecer na listagem
  assert.equal(listAccounts().length, 1);
});

test('não deve permitir CPF duplicado', () => {
  createSampleAccount();

  // Tenta criar segunda conta com o mesmo CPF
  const result = createSampleAccount({
    fullName: 'Outra Pessoa',
    email: 'outra@email.com',
    phone: '11888887777'
  });

  // Deve retornar erro 409 Conflict
  assert.equal(result.error.status, 409);
  assert.match(result.error.message, /CPF/);
});

test('não deve permitir CPF inválido', () => {
  const result = createSampleAccount({ cpf: '111.111.111-11' });

  // CPF com todos os dígitos iguais é inválido
  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /CPF/);
});

test('não deve permitir e-mail inválido', () => {
  const result = createSampleAccount({ email: 'email-invalido' });

  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /E-mail/);
});

// --- Testes de Transações ---

test('deve depositar, sacar e consultar saldo corretamente', () => {
  const account = createSampleAccount().data;

  // Deposita R$500
  const depositResult = deposit(account.accountNumber, 500);
  assert.equal(depositResult.error, undefined);

  // Saca R$200
  const withdrawResult = withdraw(account.accountNumber, 200);
  assert.equal(withdrawResult.error, undefined);

  // Saldo deve ser R$300 (500 - 200)
  const balance = getBalance(account.accountNumber);
  assert.equal(balance.data.balance, 300);
});

test('não deve permitir saque com saldo insuficiente', () => {
  const account = createSampleAccount().data;

  // Tenta sacar R$50 sem ter saldo
  const result = withdraw(account.accountNumber, 50);

  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /Saldo insuficiente/);
});

test('não deve permitir depósito com valor abaixo do mínimo', () => {
  const account = createSampleAccount().data;

  // Valor 0 está abaixo do mínimo de R$0,01
  const result = deposit(account.accountNumber, 0);

  assert.equal(result.error.status, 400);
});

test('não deve permitir depósito acima do limite', () => {
  const account = createSampleAccount().data;

  // R$1.000.001 está acima do limite de R$1.000.000
  const result = deposit(account.accountNumber, 1_000_001);

  assert.equal(result.error.status, 400);
});

test('deve transferir entre contas e registrar no extrato', () => {
  // Cria duas contas com CPFs diferentes
  const from = createSampleAccount({ cpf: '529.982.247-25' }).data;
  const to = createSampleAccount({
    fullName: 'Destino',
    cpf: '111.444.777-35', // outro CPF matematicamente válido
    email: 'destino@email.com',
    phone: '11777776666'
  }).data;

  // Deposita R$250 na conta de origem
  deposit(from.accountNumber, 250);

  // Transfere R$100 da origem para o destino
  const transferResult = transfer({
    fromAccountNumber: from.accountNumber,
    toAccountNumber: to.accountNumber,
    amount: 100
  });

  assert.equal(transferResult.error, undefined);

  // Saldo da origem deve ser R$150 (250 - 100)
  assert.equal(transferResult.data.fromBalance, 150);

  // Saldo do destino deve ser R$100
  assert.equal(transferResult.data.toBalance, 100);

  // Extrato da origem deve ter um registro TRANSFER_OUT
  const fromStatement = getStatement(from.accountNumber).data.statement;
  assert.equal(fromStatement.at(-1).type, 'TRANSFER_OUT');

  // Extrato do destino deve ter um registro TRANSFER_IN
  const toStatement = getStatement(to.accountNumber).data.statement;
  assert.equal(toStatement.at(-1).type, 'TRANSFER_IN');
});

test('não deve permitir transferência para a própria conta', () => {
  const account = createSampleAccount().data;
  deposit(account.accountNumber, 200);

  const result = transfer({
    fromAccountNumber: account.accountNumber,
    toAccountNumber: account.accountNumber,
    amount: 50
  });

  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /diferente/);
});
