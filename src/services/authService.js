// services/authService.js
// Contém a lógica de negócio para autenticação: cadastro e login de usuários.
// Usa bcrypt para proteger senhas e JWT para gerar tokens de acesso.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { createAccountSchema, loginSchema } = require('../validations/userSchema');
const accountRepository = require('../repositories/accountRepository');

// Registra um novo usuário após validar os dados e hashear a senha.
// Lança um erro se o e-mail já estiver em uso ou se os dados forem inválidos.
async function register(body) {
  // Valida os campos obrigatórios com o schema Zod
  // safeParse retorna { success, data } ou { success: false, error }
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    // Extrai e une as mensagens de erro de todos os campos inválidos
    const messages = parsed.error.errors.map((e) => e.message).join(' | ');
    const err = new Error(messages);
    err.statusCode = 400;
    throw err;
  }

  const { fullName, cpf, email, phone, password } = parsed.data;

  // Verifica se o e-mail já está cadastrado para evitar duplicidade
  const existing = userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('E-mail já cadastrado.');
    err.statusCode = 409; // 409 Conflict
    throw err;
  }

  // Gera o hash da senha com custo 10 (recomendado para equilíbrio entre segurança e performance)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Salva o usuário sem a senha em texto puro
  const user = userRepository.create({
  id: String(Date.now()),
  fullName,
  cpf,
  email,
  phone,
  password: hashedPassword,
});

accountRepository.create({
  id: String(Date.now() + 1),
  userId: user.id,
  agency: '0001',
  accountNumber: String(
    Math.floor(10000 + Math.random() * 90000)
  ),
  balance: 0,
  statement: [],
});

const { password: _, ...userWithoutPassword } = user;
return userWithoutPassword;

  // Retorna o usuário sem expor a senha na resposta
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Autentica um usuário e retorna um token JWT válido por 1 dia.
// Lança erro genérico para não revelar se o e-mail existe ou não (segurança).
async function login(body) {
  // Valida os campos de login
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => e.message).join(' | ');
    const err = new Error(messages);
    err.statusCode = 400;
    throw err;
  }

  const { email, password } = parsed.data;

  // Busca o usuário pelo e-mail
  const user = userRepository.findByEmail(email);

  // Compara a senha informada com o hash armazenado
  // Mesmo que o usuário não exista, bcrypt.compare roda para evitar timing attacks
  const passwordMatch = user
    ? await bcrypt.compare(password, user.password)
    : false;

  // Mensagem genérica para não indicar se o e-mail existe ou não
  if (!user || !passwordMatch) {
    const err = new Error('E-mail ou senha inválidos.');
    err.statusCode = 401;
    throw err;
  }

  // Gera o token JWT com o ID do usuário como payload
  // JWT_SECRET deve estar no .env — nunca em código fonte
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'senaibank_secret_dev',
    { expiresIn: '1d' } // expira em 1 dia
  );

  return { token };
}

module.exports = { register, login };
