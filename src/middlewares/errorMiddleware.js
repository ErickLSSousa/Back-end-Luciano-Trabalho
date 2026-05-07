// middlewares/errorMiddleware.js
// Middleware de erro global do Express.
// Deve ser o ÚLTIMO middleware registrado no app.js para capturar todos os erros.
// Qualquer controller que chamar next(err) vai cair aqui.

function errorMiddleware(err, req, res, next) {
  // Usa o statusCode definido pelo service/controller, ou 500 como fallback genérico
  const statusCode = err.statusCode || 500;

  // Loga o erro internamente para depuração (em produção, use um logger como Winston)
  if (statusCode === 500) {
    console.error('Erro interno:', err);
  }

  return res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor.',
  });
}

module.exports = { errorMiddleware };
