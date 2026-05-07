// server.js
// Ponto de entrada da aplicação.
// Importa o app configurado e sobe o servidor HTTP na porta definida.

const app = require('./app');

// Porta do servidor: usa variável de ambiente ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// Inicia o servidor e exibe informações no console
app.listen(PORT, () => {
  console.log('✅ SenaiBank API iniciada');
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
