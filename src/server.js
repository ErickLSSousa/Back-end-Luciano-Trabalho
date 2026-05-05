const http = require("http");
const { routeRequest } = require("./routes/accountRoutes");
const { sendJson } = require("./utils/http");

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      await routeRequest(req, res);
    } catch (error) {
      handleError(res, error);
    }
  });
}

function handleError(res, error) {
  const statusCode = error.statusCode || 500;

  sendJson(res, statusCode, {
    error: error.message || "Erro interno do servidor",
  });
}

const PORT = process.env.PORT || 3000;
const server = createServer();

server.listen(PORT, () => {
  console.log("✅ SenaiBank API iniciada");
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || "development"}`);
});