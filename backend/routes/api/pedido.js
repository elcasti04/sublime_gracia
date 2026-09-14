import { Router } from "express";

import { crearPedido, obtenerSeguimientoPedido } from "../../controllers/pedido.controller.js";

import {
    uploadComprobante
} from "../../middlewares/upload.middleware.js";


const router = Router();

router.get("/pedidos/:id", obtenerSeguimientoPedido);


// ==========================================
// CREAR PEDIDO
// ==========================================

router.post(
    "/pedidos",
    uploadComprobante.single("comprobante"),
    crearPedido
);


export default router;
