const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createAccount(account) {
  return prisma.account.create({ data: account })
}

async function getAccountsByUserId(userId) {
  const result = await prisma.account.findMany({
    where: { userId: Number(userId) }
  })
  console.log('[repo] userId:', userId, '| contas:', result)
  return result
}

async function getAccountByNumber(accountNumber) {
  return prisma.account.findUnique({
    where: { accountNumber }
  })
}

module.exports = {
  createAccount,
  getAccountsByUserId,
  getAccountByNumber
}