import * as transactionService from "../services/accountService";
import accountRepository from "../repositories/accountRepository";

export function deposit(req, res, next) {
    try {
        const result = transactionService.deposit(
            req.body.accountId,
            req.body.amount,
            accountRepository
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
}