import { describe } from "zod/v4/core";
import { deposit } from "../src/services/transactionController";
import { it } from "node:test";

describe("Depósito", () => {
    it("deve adicionar valor ao saldo", () => {
        const account = { balance: 100 };
        deposit(account, 50);
        expect(account.balance).toBe(150);
    });

    it("não deve permitir valor inválido", () => {
        const account = { balance: 100 };
        expect(() => deposit(account, -10)).toThrow();
    });
});