// validations/transactionSchema.js
// Define as regras de validação para operações financeiras (depósito, saque, transferência).
// Conforme o requisito do projeto: valores entre R$0,01 e R$1.000.000,00.

const { z } = require('zod');

// Schema para depósito e saque — exige apenas o valor da operação
const transactionSchema = z.object({
  // amount deve ser um número entre 0.01 e 1.000.000
  // invalid_type_error é exibido quando o valor não é numérico
  amount: z
    .number({
      required_error: 'O campo amount é obrigatório.',
      invalid_type_error: 'O campo amount deve ser um número.',
    })
    .min(0.01, 'Valor mínimo permitido é R$0,01.')
    .max(1_000_000, 'Valor máximo permitido é R$1.000.000,00.'),
});

// Schema para transferência — exige origem, destino e valor
const transferSchema = z.object({
  // Número da conta de origem
  fromAccountNumber: z
    .string({ required_error: 'Conta de origem é obrigatória.' })
    .min(1, 'Conta de origem inválida.'),

  // Número da conta de destino
  toAccountNumber: z
    .string({ required_error: 'Conta de destino é obrigatória.' })
    .min(1, 'Conta de destino inválida.'),

  // Valor a transferir, mesmas regras do transactionSchema
  amount: z
    .number({
      required_error: 'O campo amount é obrigatório.',
      invalid_type_error: 'O campo amount deve ser um número.',
    })
    .min(0.01, 'Valor mínimo permitido é R$0,01.')
    .max(1_000_000, 'Valor máximo permitido é R$1.000.000,00.'),
});

module.exports = { transactionSchema, transferSchema };
