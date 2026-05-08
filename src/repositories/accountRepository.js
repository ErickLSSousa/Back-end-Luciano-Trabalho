const accounts = []

function createAccount(account) {
  accounts.push(account)
  return account
}

function getAccountsByUserId(userId) {
  return accounts.filter(account => account.userId === userId)
}

function getAccountByNumber(accountNumber) {
  return accounts.find(
    account => account.accountNumber === accountNumber
  )
}

module.exports = {
  createAccount,
  getAccountsByUserId,
  getAccountByNumber
}