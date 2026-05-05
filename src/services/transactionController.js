import { z } from "zod"

export function deposit(account, amount) {
    if (amount < 0.01 || amount > 1_000_000) {
        throw new Error("Valor inválido");
    }

    account.balance += amount;
    return account;
}

export function withdraw(account, amount) {
    if (amount < 0.01 || amount > 1_000_000) {
        throw new Error("Valor inválido");
    }

    if (account.balance < amount) {
        throw new Error("Saldo insuficiente");
    }

    account.balance -= amount;
    return account;
}

export function transfer(from, to, amount) {
    withdraw(from, amount);
    deposit(to, amount);
}

export const transactionSchema = z.object({
    amount: z.number().min(0.01).max(1_000_000),
});