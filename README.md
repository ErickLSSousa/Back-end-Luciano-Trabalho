# Senaibank API

API REST simples para gestão de contas bancárias da fintech **Senaibank**.

## Funcionalidades

- Listar contas bancárias
- Criar conta bancária com validação de campos obrigatórios
- Atualizar dados do titular
- Excluir conta bancária
- Depositar
- Sacar
- Transferir entre contas
- Consultar saldo
- Emitir extrato

## Requisitos

- Node.js 18+

## Executar

```bash
npm install
npm run dev
```

Servidor padrão: `http://localhost:3000`

## Endpoints

### Contas

- `GET /accounts`
- `POST /accounts`
- `PUT /accounts/:accountNumber`
- `DELETE /accounts/:accountNumber`

### Operações

- `POST /accounts/:accountNumber/deposit`
- `POST /accounts/:accountNumber/withdraw`
- `POST /accounts/transfer`
- `GET /accounts/:accountNumber/balance`
- `GET /accounts/:accountNumber/statement`

### Exemplo de criação

```json
{
  "fullName": "Maria Oliveira",
  "cpf": "12345678901",
  "email": "maria@email.com",
  "phone": "11999999999"
}
```

## Observações

- Persistência em memória (reiniciar a API limpa os dados).
- Campos obrigatórios para criação: `fullName`, `cpf`, `email`, `phone`.
