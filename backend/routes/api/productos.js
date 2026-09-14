import express from "express";
import {
    listarProductosPublicos,
    listarProductosAdmin,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    cambiarEstadoProducto,
    eliminarProducto
} from "../../controllers/producto.controller.js";
import { verifyAdmin, verifyToken } from "../../middlewares/auth.middleware.js";
import { uploadImagenProducto } from "../../middlewares/upload.middleware.js";

const router = express.Router();
const admin = [verifyToken, verifyAdmin];

router.get("/productos", listarProductosPublicos);
router.get("/admin/productos", ...admin, listarProductosAdmin);
router.get("/productos/:id", obtenerProducto);
router.post("/productos", ...admin, uploadImagenProducto.single("imagen"), crearProducto);
router.put("/productos/:id", ...admin, uploadImagenProducto.single("imagen"), actualizarProducto);
router.patch("/productos/:id/estado", ...admin, cambiarEstadoProducto);
router.delete("/productos/:id", ...admin, eliminarProducto);

export default router;
