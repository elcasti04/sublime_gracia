
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
        console.error("JWT_SECRET ausente o demasiado corto");
        return res.status(500).json({ message: "Autenticacion no disponible" });
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.warn("JWT_SECRET deberia tener al menos 32 caracteres en produccion");
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Token requerido"
        });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            message: "Formato de token inválido"
        });
    }

    const token = partes[1];

    if (!token || token.length > 4096) {
        return res.status(401).json({
            message: "Token invalido"
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"]
        });

        if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.rol) {
            return res.status(401).json({ message: "Token invalido" });
        }

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token inválido o expirado"
        });

    }
};

export const verifyAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: 'Usuario no autenticado'
        })
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            message: 'Acceso denegado. Solo administradores'
        })
    }

    next()
}
