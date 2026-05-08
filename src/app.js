
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const accountRoutes = require('./routes/accountRoutes')
const transactionRoutes = require('./routes/transactionRoutes')

const { errorMiddleware } = require('./middlewares/errorMiddleware')

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SenaiBank API',
    timestamp: new Date().toISOString()
  })
})


app.use('/auth', authRoutes)
app.use('/accounts', accountRoutes)
app.use('/transactions', transactionRoutes)

app.use(errorMiddleware)

module.exports = app