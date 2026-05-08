const { Router } = require('express')

const router = Router()

router.post('/send', (req, res) => {
  res.json({ message: 'PIX enviado' })
})

router.post('/receive', (req, res) => {
  res.json({ message: 'PIX recebido' })
})

router.get('/history', (req, res) => {
  res.json({ history: [] })
})

router.post('/approximation', (req, res) => {
  res.json({ message: 'PIX por aproximação realizado' })
})

module.exports = router