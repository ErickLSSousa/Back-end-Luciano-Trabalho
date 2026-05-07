// repositories/userRepository.js
// Repositório de usuários em memória.
// Responsável por armazenar e buscar usuários cadastrados (para autenticação).
// Em um projeto real, este arquivo seria substituído por chamadas ao banco de dados.

const users = [];

const userRepository = {
  // Adiciona um novo usuário ao array e o retorna
  create(user) {
    users.push(user);
    return user;
  },

  // Busca um usuário pelo e-mail — retorna undefined se não encontrar
  findByEmail(email) {
    return users.find((u) => u.email === email);
  },
};

module.exports = userRepository;
