const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const accountRoutes = require('./routes/accountRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const pixRoutes = require('./routes/pixRoutes')

const authMiddleware = require('./middlewares/authMiddleware')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/accounts', authMiddleware, accountRoutes)
app.use('/transactions', authMiddleware, transactionRoutes)
app.use('/pix', authMiddleware, pixRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

module.exports = app