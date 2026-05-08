const authService = require('../services/authService')

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message || 'Erro interno'
    })
  }
}

const login = async (req, res) => {
  try {
    const token = await authService.login(req.body)
    res.json(token)
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message || 'Erro interno'
    })
  }
}

module.exports = {
  register,
  login
}