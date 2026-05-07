// tests/transaction.test.js
// Testes unitários das funções de transação usando Jest.
// Testa a lógica pura das operações financeiras de forma isolada.

// CORREÇÃO: o arquivo original importava 'describe' do zod (errado) e 'it' do node:test.
// O correto é usar apenas o Jest, que fornece describe, it e expect globalmente.

const { deposit, withdraw, transfer } = require('../src/services/accountService');
const { resetStore } = require('../src/data/accountStore');
const { openAccount } = require('../src/services/accountService');

// Função auxiliar para criar uma conta de teste dentro dos testes Jest
const makeAccount = (cpf, email) =>
  openAccount({
    fullName: 'Teste',
    cpf,
    email,
    phone: '11999999999',
    password: 'senha123'
  }).data;

// Limpa o store antes de cada teste para garantir isolamento
beforeEach(() => {
  resetStore();
});

// --- Testes de Depósito ---
describe('Depósito', () => {
  it('deve adicionar o valor ao saldo da conta', () => {
    const account = makeAccount('529.982.247-25', 'a@test.com');

    const result = deposit(account.accountNumber, 50);

    // Não deve retornar erro
    expect(result.error).toBeUndefined();

    // Saldo deve ser R$50
    expect(result.data.balance).toBe(50);
  });

  it('não deve permitir valor abaixo de R$0,01', () => {
    const account = makeAccount('529.982.247-25', 'b@test.com');

    const result = deposit(account.accountNumber, 0);

    // Deve retornar erro de validação
    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
  });

  it('não deve permitir valor acima de R$1.000.000', () => {
    const account = makeAccount('529.982.247-25', 'c@test.com');

    const result = deposit(account.accountNumber, 1_000_001);

    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
  });

  it('não deve encontrar conta inexistente', () => {
    const result = deposit('9999', 100);

    expect(result.error.status).toBe(404);
  });
});

// --- Testes de Saque ---
describe('Saque', () => {
  it('deve subtrair o valor do saldo', () => {
    const account = makeAccount('529.982.247-25', 'd@test.com');

    deposit(account.accountNumber, 200);
    const result = withdraw(account.accountNumber, 80);

    expect(result.error).toBeUndefined();
    expect(result.data.balance).toBe(120); // 200 - 80 = 120
  });

  it('não deve permitir saque com saldo insuficiente', () => {
    const account = makeAccount('529.982.247-25', 'e@test.com');

    const result = withdraw(account.accountNumber, 100);

    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
    expect(result.error.message).toMatch(/Saldo insuficiente/);
  });

  it('não deve permitir valor negativo', () => {
    const account = makeAccount('529.982.247-25', 'f@test.com');
    deposit(account.accountNumber, 500);

    const result = withdraw(account.accountNumber, -10);

    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
  });
});

// --- Testes de Transferência ---
describe('Transferência', () => {
  it('deve transferir o valor entre duas contas', () => {
    const from = makeAccount('529.982.247-25', 'g@test.com');
    const to   = makeAccount('111.444.777-35', 'h@test.com');

    deposit(from.accountNumber, 300);

    const result = transfer({
      fromAccountNumber: from.accountNumber,
      toAccountNumber: to.accountNumber,
      amount: 100
    });

    expect(result.error).toBeUndefined();
    expect(result.data.fromBalance).toBe(200); // 300 - 100
    expect(result.data.toBalance).toBe(100);
  });

  it('não deve permitir transferência para a própria conta', () => {
    const account = makeAccount('529.982.247-25', 'i@test.com');
    deposit(account.accountNumber, 200);

    const result = transfer({
      fromAccountNumber: account.accountNumber,
      toAccountNumber: account.accountNumber,
      amount: 50
    });

    expect(result.error.status).toBe(400);
  });
});
