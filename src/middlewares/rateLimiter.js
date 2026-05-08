const rateLimit = require('express-rate-limit')

module.exports = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: 'Muitas operações. Aguarde um momento.'
  }
})