// validations/userSchema.js
// Define as regras de validação para criação e atualização de usuários/contas.
// Usa a biblioteca Zod para descrever os schemas e validar os dados recebidos.

const { z } = require('zod');

// Função auxiliar que valida matematicamente um CPF brasileiro.
// Remove pontuação, verifica tamanho, sequências inválidas e os dois dígitos verificadores.
function cpfValido(cpf) {
  // Remove qualquer ponto ou traço do CPF (ex: "123.456.789-09" → "12345678909")
  const numeros = cpf.replace(/[.\-]/g, '');

  // CPF deve ter exatamente 11 dígitos
  if (numeros.length !== 11) return false;

  // Rejeita sequências repetidas como "11111111111", que passariam no cálculo
  if (/^(\d)\1+$/.test(numeros)) return false;

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[10])) return false;

  return true;
}

// Schema para criação de conta — todos os campos são obrigatórios
const createAccountSchema = z.object({
  // Nome completo: mínimo 3 caracteres, apenas letras e espaços
  fullName: z
    .string({ required_error: 'Nome completo é obrigatório.' })
    .min(3, 'Nome deve ter ao menos 3 caracteres.')
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome não pode conter caracteres especiais ou números.'),

  // CPF: aceita com ou sem formatação, valida matematicamente
  cpf: z
    .string({ required_error: 'CPF é obrigatório.' })
    .refine(cpfValido, { message: 'CPF inválido.' }),

  // E-mail: formato padrão de e-mail
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.'),

  // Telefone: somente dígitos, entre 10 e 11 caracteres (com ou sem o 9)
  phone: z
    .string({ required_error: 'Telefone é obrigatório.' })
    .regex(/^\d{10,11}$/, 'Telefone inválido. Use apenas números (10 ou 11 dígitos).'),

  // Senha: mínimo 6 caracteres
  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(6, 'Senha deve ter ao menos 6 caracteres.'),
});

// Schema para atualização — todos os campos são opcionais, mas ao menos um deve ser enviado
const updateAccountSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Nome deve ter ao menos 3 caracteres.')
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome não pode conter caracteres especiais.')
      .optional(),

    email: z.string().email('E-mail inválido.').optional(),

    phone: z
      .string()
      .regex(/^\d{10,11}$/, 'Telefone inválido.')
      .optional(),
  })
  // Garante que ao menos um campo foi enviado para atualizar
  .refine((data) => data.fullName || data.email || data.phone, {
    message: 'Informe ao menos um campo para atualizar: fullName, email ou phone.',
  });

// Schema para login
const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.'),

  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(1, 'Senha é obrigatória.'),
});

module.exports = { createAccountSchema, updateAccountSchema, loginSchema };
