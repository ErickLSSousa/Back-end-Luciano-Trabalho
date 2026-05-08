const { z } = require('zod')

const normalizeCpf = (cpf) =>
  cpf.replace(/\D/g, '')

const normalizePhone = (phone) =>
  phone.replace(/\D/g, '')

const passwordStrong =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const createAccountSchema = z.object({
  fullName: z.string().min(3),

  cpf: z.string()
    .transform(normalizeCpf)
    .refine(cpf => cpf.length === 11, 'CPF inválido'),

  email: z.string().email('E-mail inválido'),

  phone: z.string()
    .transform(normalizePhone)
    .refine(p => p.length === 10 || p.length === 11, 'Telefone inválido'),

  password: z.string()
    .regex(
      passwordStrong,
      'Senha fraca: mínimo 8 caracteres, 1 letra maiúscula, número e símbolo'
    )
})
