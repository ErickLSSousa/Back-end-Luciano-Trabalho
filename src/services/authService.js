// services/authService.js
// Contém a lógica de negócio para autenticação: cadastro e login de usuários.
// Usa bcrypt para proteger senhas e JWT para gerar tokens de acesso.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('../repositories/userRepository');

const { createAccount } = require('../data/accountStore');

const {
  createAccountSchema,
  loginSchema
} = require('../validations/userSchema');

// Registra um novo usuário
async function register(body) {

  // Validação dos dados
  const parsed = createAccountSchema.safeParse(body);

  if (!parsed.success) {
    const messages = parsed.error.errors
      .map((e) => e.message)
      .join(' | ');

    const err = new Error(messages);

    err.statusCode = 400;

    throw err;
  }

  const {
    fullName,
    cpf,
    email,
    phone,
    password
  } = parsed.data;

  // Verifica se o email já existe
  const existing = userRepository.findByEmail(email);

  if (existing) {
    const err = new Error('E-mail já cadastrado.');

    err.statusCode = 409;

    throw err;
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria usuário
  const user = userRepository.create({
    id: String(Date.now()),
    fullName,
    cpf,
    email,
    phone,
    password: hashedPassword
  });

  // Cria conta bancária automaticamente
  createAccount({
    fullName,
    cpf,
    email,
    phone
  });

  // Remove senha da resposta
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

// Login
async function login(body) {

  // Validação
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    const messages = parsed.error.errors
      .map((e) => e.message)
      .join(' | ');

    const err = new Error(messages);

    err.statusCode = 400;

    throw err;
  }

  const { email, password } = parsed.data;

  // Busca usuário
  const user = userRepository.findByEmail(email);

  // Verifica senha
  const passwordMatch = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !passwordMatch) {
    const err = new Error('E-mail ou senha inválidos.');

    err.statusCode = 401;

    throw err;
  }

  // Gera token JWT
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'senaibank_secret_dev',
    { expiresIn: '1d' }
  );

  return { token };
}

module.exports = {
  register,
  login
};