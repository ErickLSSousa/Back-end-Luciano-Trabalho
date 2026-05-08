const accountRepository = require('../repositories/accountRepository')

function listAccounts(req, res) {
  const userId = req.userId
  const accounts = accountRepository.getAccountsByUserId(userId)
  res.json({ accounts })
}

function getAccountDetails(req, res) {
  const { accountNumber } = req.params
  const userId = req.userId

  const account = accountRepository.getAccountByNumber(accountNumber)

  if (!account) {
    return res.status(404).json({ error: 'Conta não encontrada' })
  }

  if (account.userId !== userId) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  res.json(account)
}

module.exports = {
  listAccounts,
  getAccountDetails
}