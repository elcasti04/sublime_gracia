import express from "express";

import {
    getPedidos,
    getPedido,
    actualizarEstadoPedido
} from "../../controllers/adminPedido.controller.js";

import {
    getUsers,
    createUser,
    deleteUser
} from "../../controllers/user.controller.js";

import { verifyToken } from "../../middlewares/auth.middleware.js";
import { verifyAdmin } from "../../middlewares/auth.middleware.js";

const router = express.Router();


// =========================
// PROTEGER TODAS LAS RUTAS
// =========================

router.use(verifyToken);
router.use(verifyAdmin);


// =========================
// USUARIOS
// =========================

router.get("/users", getUsers);

// router.get("/users/:id", getUser);

router.post("/users", createUser);

router.delete("/users/:id", deleteUser);


// =========================
// PEDIDOS
// =========================

// Ver todos los pedidos
router.get("/pedidos", getPedidos);

// Ver un pedido
router.get("/pedidos/:id", getPedido);

// Cambiar estado del pedido
router.put(
    "/pedidos/:id/estado",
    actualizarEstadoPedido
);


export default router;
