const accounts = new Map();
let nextAccountNumber = 1001;

const getAllAccounts = () => Array.from(accounts.values());

const getAccount = (accountNumber) => accounts.get(String(accountNumber));

const cpfExists = (cpf) => getAllAccounts().some((account) => account.cpf === cpf);

const createAccount = ({ fullName, cpf, email, phone }) => {
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
  return account;
};

const deleteAccount = (accountNumber) => accounts.delete(String(accountNumber));

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
