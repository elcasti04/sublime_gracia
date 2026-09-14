
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const Login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            return res.status(400).json({
                message: "Correo y contraseña son obligatorios"
            });
        }

        const user = await User.findOne({
            where: { correo }
        });

        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const correctPassword = await bcrypt.compare(
            contraseña,
            user.contraseña
        );

        if (!correctPassword) {
            return res.status(401).json({
                message: "Credenciales incorrectas"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                correo: user.correo,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
                algorithm: "HS256"
            }
        );

        return res.status(200).json({
            message: "Login exitoso",
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error("Error en Login:", error);

        return res.status(500).json({
            message: "Error en el login",
            error: error.message
        });
    }
};
