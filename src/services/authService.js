const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const accountRepository = require('../repositories/accountRepository')
const userRepository = require('../repositories/userRepository')

async function register(data) {
  const { fullName, email, password } = data

  if (!fullName || !email || !password) {
    const err = new Error('Dados obrigatórios ausentes')
    err.statusCode = 400
    throw err
  }

  const existing = userRepository.findByEmail(email)
  if (existing) {
    const err = new Error('Email já cadastrado')
    err.statusCode = 409
    throw err
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = userRepository.create({
    id: Date.now().toString(),
    fullName,
    email,
    password: hashedPassword
  })

  accountRepository.createAccount({
    accountNumber: Math.floor(Math.random() * 100000).toString(),
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    balance: 0
  })

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  }
}

async function login(data) {
  const { email, password } = data

  if (!email || !password) {
    const err = new Error('Email e senha obrigatórios')
    err.statusCode = 400
    throw err
  }

  const user = userRepository.findByEmail(email)
  if (!user) {
    const err = new Error('Credenciais inválidas')
    err.statusCode = 401
    throw err
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    const err = new Error('Credenciais inválidas')
    err.statusCode = 401
    throw err
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'senaibank_secret',
    { expiresIn: '1d' }
  )

  return { token }
}

module.exports = {
  register,
  login
}