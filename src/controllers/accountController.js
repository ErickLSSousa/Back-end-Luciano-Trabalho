const accountRepository = require('../repositories/accountRepository')

async function listAccounts(req, res) {
  try {
    const userId = req.userId
    console.log('[listAccounts] userId:', userId, typeof userId)
    const accounts = await accountRepository.getAccountsByUserId(userId)
    console.log('[listAccounts] accounts:', accounts)
    res.json({ accounts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar contas' })
  }
}

async function getAccountDetails(req, res) {
  try {
    const { accountNumber } = req.params
    const userId = req.userId

    const account = await accountRepository.getAccountByNumber(accountNumber)

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (account.userId !== Number(userId)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    res.json(account)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar conta' })
  }
}

module.exports = {
  listAccounts,
  getAccountDetails
}