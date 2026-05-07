// controllers/authController.js
// Recebe as requisições HTTP de autenticação e delega ao authService.
// Trata erros e envia as respostas JSON adequadas.

const authService = require('../services/authService');

// Cadastra um novo usuário
// POST /auth/register
async function register(req, res, next) {
  try {
    // Passa o body da requisição para o service validar e criar o usuário
    const user = await authService.register(req.body);

    // 201 Created — retorna o usuário criado (sem a senha)
    res.status(201).json(user);
  } catch (err) {
    // Repassa para o errorMiddleware com o statusCode definido no service
    next(err);
  }
}

// Autentica um usuário e retorna o token JWT
// POST /auth/login
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    // 200 OK — retorna o token JWT
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
