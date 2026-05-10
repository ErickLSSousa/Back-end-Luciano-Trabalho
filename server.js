require('dotenv').config()
const app = require('./src/app')

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`✅ SenaiBank backend rodando em http://localhost:${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`)
})

// Mantém o processo vivo e loga erros não capturados
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
})