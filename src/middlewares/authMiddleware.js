import jwt from "jsonwebtoken";
import { error } from "node:console";

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não informado" });
    }

    const [, token] = authHeader.split(" ");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido"});
    }
}