const accounts = new Map()
let nextAccountNumber = 1001

const getAccountsByUser = (userId) =>
  Array.from(accounts.values()).filter(acc => acc.userId === userId)

const getAccount = (accountNumber) =>
  accounts.get(String(accountNumber))

const createAccount = ({ userId, fullName, cpf, email, phone }) => {
  const account = {
    accountNumber: String(nextAccountNumber++),
    userId,
    fullName,
    cpf,
    email,
    phone,
    balance: 0,
    statement: []
  }
  accounts.set(account.accountNumber, account)
  return account
}

module.exports = {
  getAccountsByUser,
  getAccount,
  createAccount
}
