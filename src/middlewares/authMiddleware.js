// middlewares/authMiddleware.js
// Intercepta requisições e verifica se o token JWT é válido antes de permitir o acesso.
// Deve ser usado nas rotas que exigem autenticação.

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // O token deve vir no header Authorization no formato: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // 401 Unauthorized — nenhum token foi enviado
    return res.status(401).json({ error: 'Token não informado.' });
  }

  // Separa "Bearer" do token em si
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  try {
    // Verifica a assinatura e a validade do token
    // Se inválido ou expirado, lança uma exceção capturada pelo catch
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'senaibank_secret_dev'
    );

    // Armazena o ID do usuário na requisição para os próximos middlewares/controllers usarem
    req.userId = decoded.userId;

    // Passa para o próximo middleware ou controller
    next();
  } catch {
    // 401 Unauthorized — token inválido ou expirado
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = { authMiddleware };
