const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const db = require('../database/db')
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'senaibank_secret'

// Causa mais comum do 401 no login:
// 1. bcrypt.compare recebendo undefined (campo errado no body)
// 2. JWT_SECRET diferente entre login e authMiddleware
// 3. Rota não registrada corretamente no app.js

async function register(req, res) {
  const { fullName, cpf, email, phone, password } = req.body

  if (!fullName || !cpf || !email || !phone || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] }
    })

    if (existing) {
      return res.status(409).json({ error: 'E-mail ou CPF já cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { fullName, cpf, email, phone, password: hashedPassword }
    })

    // Cria conta bancária automaticamente
    const accountNumber = String(Date.now()).slice(-8)
    await prisma.account.create({
      data: {
        accountNumber,
        balance: 0,
        userId: user.id,
        fullName: user.fullName,
        email: user.email
      }
    })

    return res.status(201).json({ message: 'Conta criada com sucesso' })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ error: 'Erro interno ao criar conta' })
  }
}

async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Não revele se é o e-mail ou a senha que está errado
      return res.status(401).json({ error: 'E-mail ou senha inválidos' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName
      },
      process.env.JWT_SECRET || 'senaibank_secret',
      { expiresIn: '7d' }
    )

    return res.status(200).json({ token })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ error: 'Erro interno ao fazer login' })
  }
}

module.exports = { register, login }