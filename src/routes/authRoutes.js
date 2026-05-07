// routes/authRoutes.js
// Define as rotas de autenticação: cadastro e login.
// Estas rotas são públicas — não exigem token JWT.

const { Router } = require('express');
const { register, login } = require('../controllers/authController');

const router = Router();

// POST /auth/register — cadastra um novo usuário
router.post('/register', register);

// POST /auth/login — autentica e retorna o token JWT
router.post('/login', login);

module.exports = router;
