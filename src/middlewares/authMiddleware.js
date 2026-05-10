const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token mal formatado' })
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'senaibank_secret')

    console.log('[auth] decoded:', decoded)

    req.userId = decoded.userId  // ✅ token assina com { userId: user.id }
    req.user = decoded

    next()
  } catch (error) {
    console.log('[auth] erro:', error.message)
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

module.exports = authMiddleware