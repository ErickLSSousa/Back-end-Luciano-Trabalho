const accountRepository = require('../repositories/accountRepository')

function deposit(req, res) {
  const { accountNumber, amount } = req.body
  const userId = req.userId

  const account = accountRepository.getAccountByNumber(accountNumber)

  if (!account) return res.status(404).json({ error: 'Conta não encontrada' })
  if (account.userId !== userId) return res.status(403).json({ error: 'Acesso negado' })

  account.balance += Number(amount)

  res.json({ message: 'Depósito realizado', balance: account.balance })
}

function withdraw(req, res) {
  const { accountNumber, amount } = req.body
  const userId = req.userId

  const account = accountRepository.getAccountByNumber(accountNumber)

  if (!account) return res.status(404).json({ error: 'Conta não encontrada' })
  if (account.userId !== userId) return res.status(403).json({ error: 'Acesso negado' })
  if (account.balance < amount) return res.status(400).json({ error: 'Saldo insuficiente' })

  account.balance -= Number(amount)

  res.json({ message: 'Saque realizado', balance: account.balance })
}

function transfer(req, res) {
  const { fromAccountNumber, toAccountNumber, amount } = req.body
  const userId = req.userId

  const from = accountRepository.getAccountByNumber(fromAccountNumber)
  const to = accountRepository.getAccountByNumber(toAccountNumber)

  if (!from || !to) return res.status(404).json({ error: 'Conta inválida' })
  if (from.userId !== userId) return res.status(403).json({ error: 'Acesso negado' })
  if (from.balance < amount) return res.status(400).json({ error: 'Saldo insuficiente' })

  from.balance -= Number(amount)
  to.balance += Number(amount)

  res.json({ message: 'Transferência realizada com sucesso' })
}

module.exports = {
  deposit,
  withdraw,
  transfer
}