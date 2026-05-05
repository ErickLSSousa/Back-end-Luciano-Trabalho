import * as authService from "../services/authService";
import userRepository from "../repositories/userRepositry";

export async function register(req, res, next) {
    try {
        const user = await authService.register(req.body, userRepository);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const token = await authService.login(
            req.body.email,
            req.body.password,
            userRepository
        );

        res.json({ token });
    } catch (err) {
        next(err)
    }
}