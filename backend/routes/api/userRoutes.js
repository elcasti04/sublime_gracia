import express from "express"

import {
    getUsers,
    // getUser,
    createUser,
    deleteUser
} from "../../controllers/user.controller.js"

const router = express.Router()


// Obtener todos los usuarios
router.get("/users", getUsers)


// Obtener un usuario
// router.get("/users:id", getUser)


// Crear usuario
router.post("/users", createUser)


// Eliminar usuario
router.delete("/users:id", deleteUser)


export default router
