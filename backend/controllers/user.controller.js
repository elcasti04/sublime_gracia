import { User } from "../models/user.js"
import bcrypt from "bcrypt"


// ========================================
// OBTENER USUARIOS
// ========================================

export const getUsers = async (req, res) => {

    try {

        const users = await User.findAll({
            attributes: {
                exclude: ['contraseña']
            }
        })

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: 'No hay usuarios'
            })
        }

        res.status(200).json(users)

    } catch (error) {

        console.error('ERROR AL OBTENER USUARIOS:', error)

        res.status(500).json({
            message: 'Error al obtener usuarios',
            error: error.message
        })
    }
}


// ========================================
// CREAR USUARIO
// ========================================

export const createUser = async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            correo,
            contraseña,
            rol
        } = req.body


        if (
            !nombre ||
            !apellido ||
            !correo ||
            !contraseña
        ) {
            return res.status(400).json({
                message: 'Faltan datos'
            })
        }


        const userExist = await User.findOne({
            where: { correo }
        })


        if (userExist) {
            return res.status(400).json({
                message: 'Este correo ya está registrado'
            })
        }


        const hashedPassword = await bcrypt.hash(
            contraseña,
            15
        )


        const user = await User.create({

            nombre,

            apellido,

            correo,

            contraseña: hashedPassword,

            rol: rol === 'admin'
                ? 'admin'
                : 'usuario'

        })


        res.status(201).json({

            message: 'Usuario creado',

            user: {

                id: user.id,

                nombre: user.nombre,

                apellido: user.apellido,

                correo: user.correo,

                rol: user.rol

            }

        })

    } catch (error) {

        console.error('ERROR AL CREAR USUARIO:', error)

        res.status(500).json({

            message: 'Error al crear usuario',

            error: error.message

        })
    }
}


// ========================================
// ELIMINAR USUARIO
// ========================================

export const deleteUser = async (req, res) => {

    try {

        const { id } = req.params

        const user = await User.findByPk(id)


        if (!user) {

            return res.status(404).json({

                message: 'Usuario no encontrado'

            })
        }


        await user.destroy()


        res.status(200).json({

            message: 'Usuario eliminado'

        })

    } catch (error) {

        console.error('ERROR AL ELIMINAR USUARIO:', error)

        res.status(500).json({

            message: 'Error al eliminar usuario',

            error: error.message

        })
    }
}
