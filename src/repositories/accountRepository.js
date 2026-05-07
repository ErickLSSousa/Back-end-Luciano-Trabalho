// repositories/accountRepository.js
// Repositório de contas bancárias em memória.
// Fornece operações básicas de persistência: criar, buscar e remover contas.
// Em um projeto real, seria substituído por chamadas ao banco de dados.

const accounts = [];

const accountRepository = {
  // Cria uma nova conta e a adiciona ao array
  create(account) {
    accounts.push(account);
    return account;
  },

  // Retorna todas as contas de um usuário específico pelo userId
  findByUser(userId) {
    return accounts.filter((a) => a.userId === userId);
  },

  // Busca uma conta pelo seu id único
  findById(id) {
    return accounts.find((a) => a.id === id);
  },

  // Remove uma conta pelo id — usa splice para remover do array sem deixar buracos
  remove(id) {
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) accounts.splice(index, 1);
  },
};

module.exports = accountRepository;
