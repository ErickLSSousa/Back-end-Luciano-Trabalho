const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Causa mais comum do 404 no /deposit:
// A rota não foi registrada no app.js.
// Verifique se tem: app.use('/deposit', depositRouter)

async function deposit(req, res) {
    const { accountNumber, amount, description } = req.body

    if (!accountNumber || amount === undefined) {
        return res.status(400).json({ error: 'Número da conta e valor são obrigatórios' })
    }

    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Valor inválido. Deve ser maior que zero.' })
    }

    if (parsedAmount > 50000) {
        return res.status(400).json({ error: 'Limite máximo por depósito: R$ 50.000' })
    }

    try {
        // Verifica se a conta existe e pertence ao usuário autenticado
        const account = await prisma.account.findUnique({
            where: { accountNumber: String(accountNumber) }
        })

        if (!account) {
            return res.status(404).json({ error: 'Conta não encontrada' })
        }

        if (account.email !== req.user.email) {
            return res.status(403).json({ error: 'Você não tem permissão para depositar nesta conta' })
        }

        // Atualiza o saldo
        const updated = await prisma.account.update({
            where: { accountNumber: String(accountNumber) },
            data: { balance: { increment: parsedAmount } }
        })

        // Registra a transação
        await prisma.transaction.create({
            data: {
                type: 'DEPOSIT',
                amount: parsedAmount,
                description: description || 'Depósito',
                accountId: account.id,
                toAccountNumber: String(accountNumber),
            }
        })

        return res.status(200).json({
            message: 'Depósito realizado com sucesso',
            balance: updated.balance,
            amount: parsedAmount,
        })
    } catch (err) {
        console.error('[deposit]', err)
        return res.status(500).json({ error: 'Erro interno ao realizar depósito' })
    }
}

module.exports = { deposit }