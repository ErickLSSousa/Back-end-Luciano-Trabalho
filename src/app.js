const express = require('express')
const cors = require('cors')

const authRouter = require('./routes/authRoutes')
const accountRouter = require('./routes/accountRoutes')
const depositRouter = require('./routes/depositRoutes')
const transactionRouter = require('./routes/transactionRoutes')

const app = express()

// ─── Middlewares globais ────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Log de requisições (útil para debugar 404/401) ─────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// ─── Rotas ──────────────────────────────────────────────────
// Causa do 404 no /deposit: a linha abaixo estava faltando ou
// estava como '/deposits' (com 's') enquanto o frontend chamava '/deposit'
app.use('/auth', authRouter)
app.use('/accounts', accountRouter)
app.use('/deposit', depositRouter)
app.use('/transactions', transactionRouter)

// ─── Rota de health check ───────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 404 para rotas não encontradas ─────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  })
})

// ─── Handler global de erros ────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERRO GLOBAL]', err)
  res.status(500).json({ error: 'Erro interno no servidor' })
})

module.exports = app