export function errorMiddleware(err, req, res, next) {
    return res.status(400).json({
        error: err.message || "Erro interno",
    });
}