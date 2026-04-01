const http = require('http');
const { URL } = require('url');
const { routeRequest } = require('./routes/accountRoutes');
const { sendJson } = require('./utils/http');

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    await routeRequest(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Erro ao processar requisição.' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Senaibank API rodando na porta ${PORT}`);
});
