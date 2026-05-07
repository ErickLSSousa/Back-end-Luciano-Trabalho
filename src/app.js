// app.js
// Configura e exporta o app Express com todas as rotas e middlewares registrados.
// O server.js importa este app e sobe o servidor HTTP.

const express = require('express');
const cors = require('cors');

// Importa os roteadores de cada módulo
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Importa o middleware de tratamento de erros globais
const { errorMiddleware } = require('./middlewares/errorMiddleware');

// Cria a instância do app Express
const app = express();

// Middleware que permite requisições de outras origens (necessário para o front-end React)
// Em produção, troque a origem pelo domínio real do front-end
app.use(cors({ origin: '*' }));

// Middleware que lê o corpo das requisições como JSON automaticamente
app.use(express.json());

// Registra as rotas de autenticação (login e cadastro) — sem proteção JWT
app.use('/auth', authRoutes);

// Registra as rotas de contas bancárias (listar, criar, editar, excluir, saldo, extrato)
app.use('/accounts', accountRoutes);

// Registra as rotas de transações (depósito, saque, transferência) — protegidas por JWT
// O authMiddleware é aplicado dentro do próprio transactionRoutes
app.use('/transactions', transactionRoutes);

// Middleware de erro: deve ser o ÚLTIMO use() registrado no app
// Captura qualquer erro lançado pelos controllers e responde com JSON
app.use(errorMiddleware);

module.exports = app;
