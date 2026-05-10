const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function transfer(req, res) {
  const { fromAccountNumber, toAccountNumber, amount, description } = req.body

  if (!fromAccountNumber || !toAccountNumber || amount === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: fromAccountNumber, toAccountNumber, amount' })
  }

  const parsedAmount = parseFloat(amount)

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Valor inválido. Deve ser maior que zero.' })
  }

  if (String(fromAccountNumber) === String(toAccountNumber)) {
    return res.status(400).json({ error: 'Conta de origem e destino não podem ser iguais' })
  }

  try {
    const fromAccount = await prisma.account.findUnique({
      where: { accountNumber: String(fromAccountNumber) }
    })

    if (!fromAccount) {
      return res.status(404).json({ error: 'Conta de origem não encontrada' })
    }

    if (fromAccount.email !== req.user.email) {
      return res.status(403).json({ error: 'Você não tem permissão para usar esta conta' })
    }

    if (Number(fromAccount.balance) < parsedAmount) {
      return res.status(400).json({ error: 'Saldo insuficiente' })
    }

    const toAccount = await prisma.account.findUnique({
      where: { accountNumber: String(toAccountNumber) }
    })

    if (!toAccount) {
      return res.status(404).json({ error: 'Conta de destino não encontrada' })
    }

    // Executa as duas operações em uma transação atômica
    await prisma.$transaction([
      prisma.account.update({
        where: { accountNumber: String(fromAccountNumber) },
        data: { balance: { decrement: parsedAmount } }
      }),
      prisma.account.update({
        where: { accountNumber: String(toAccountNumber) },
        data: { balance: { increment: parsedAmount } }
      }),
      prisma.transaction.create({
        data: {
          type: 'TRANSFER_OUT',
          amount: parsedAmount,
          description: description || 'Transferência',
          accountId: fromAccount.id,
          toAccountNumber: String(toAccountNumber),
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'TRANSFER_IN',
          amount: parsedAmount,
          description: description || 'Transferência recebida',
          accountId: toAccount.id,
          fromAccountNumber: String(fromAccountNumber),
        }
      }),
    ])

    return res.status(200).json({ message: 'Transferência realizada com sucesso' })
  } catch (err) {
    console.error('[transfer]', err)
    return res.status(500).json({ error: 'Erro interno ao realizar transferência' })
  }
}

async function getTransactions(req, res) {
  const { accountNumber } = req.params

  try {
    const account = await prisma.account.findUnique({
      where: { accountNumber: String(accountNumber) }
    })

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (account.email !== req.user.email) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return res.status(200).json({ transactions })
  } catch (err) {
    console.error('[getTransactions]', err)
    return res.status(500).json({ error: 'Erro interno ao buscar transações' })
  }
}

module.exports = { transfer, getTransactions }