// data/accountStore.js
// Camada de armazenamento em memória para as contas bancárias.
// Usa um Map para acesso rápido pelo número da conta.
// ATENÇÃO: os dados são perdidos quando o servidor reinicia (sem banco de dados).

// Map principal: chave = accountNumber (string), valor = objeto da conta
const accounts = new Map();

// Contador automático de número de conta — começa em 1001
let nextAccountNumber = 1001;

// Retorna todas as contas como array
const getAllAccounts = () => Array.from(accounts.values());

// Busca uma conta pelo número — retorna undefined se não existir
const getAccount = (accountNumber) => accounts.get(String(accountNumber));

// Verifica se já existe uma conta com o CPF informado
const cpfExists = (cpf) => getAllAccounts().some((account) => account.cpf === cpf);

// Cria uma nova conta com saldo zerado e extrato vazio
const createAccount = ({ fullName, cpf, email, phone }) => {
  const account = {
    accountNumber: String(nextAccountNumber++), // incrementa após usar o valor atual
    fullName,
    cpf,
    email,
    phone,
    balance: 0,       // saldo inicial zero
    statement: []     // extrato começa vazio
  };

  // Armazena no Map usando o número da conta como chave
  accounts.set(account.accountNumber, account);
  return account;
};

// Remove uma conta do Map pelo número
const deleteAccount = (accountNumber) => accounts.delete(String(accountNumber));

// Limpa todo o store e reseta o contador — usado nos testes unitários
const resetStore = () => {
  accounts.clear();
  nextAccountNumber = 1001;
};

module.exports = {
  getAllAccounts,
  getAccount,
  cpfExists,
  createAccount,
  deleteAccount,
  resetStore
};
