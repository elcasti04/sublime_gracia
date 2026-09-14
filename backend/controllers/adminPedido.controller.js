import { Pedido } from "../models/pedido.model.js";
import { PedidoItem } from "../models/pedidoItem.model.js";
import { Productos } from "../models/products.model.js";


// =========================
// OBTENER TODOS LOS PEDIDOS
// =========================

export const getPedidos = async (req, res) => {
    try {

        const pedidos = await Pedido.findAll({
            include: [
                {
                    model: PedidoItem,
                    as: "items",
                    include: [
                        {
                            model: Productos,
                            as: "producto"
                        }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json(pedidos);

    } catch (error) {

        console.error("Error al obtener pedidos:", error);

        return res.status(500).json({
            message: "Error al obtener pedidos",
            error: error.message
        });
    }
};


// =========================
// OBTENER UN PEDIDO
// =========================

export const getPedido = async (req, res) => {
    try {

        const { id } = req.params;

        const pedido = await Pedido.findByPk(id, {
            include: [
                {
                    model: PedidoItem,
                    as: "items",
                    include: [
                        {
                            model: Productos,
                            as: "producto"
                        }
                    ]
                }
            ]
        });

        if (!pedido) {
            return res.status(404).json({
                message: "Pedido no encontrado"
            });
        }

        return res.status(200).json(pedido);

    } catch (error) {

        console.error("Error al obtener pedido:", error);

        return res.status(500).json({
            message: "Error al obtener pedido",
            error: error.message
        });
    }
};


// =========================
// CONFIRMAR PEDIDO
// =========================

export const confirmarPedido = async (req, res) => {
    try {

        const { id } = req.params;

        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({
                message: "Pedido no encontrado"
            });
        }

        pedido.estado = "pagado";

        await pedido.save();

        return res.status(200).json({
            message: "Pedido confirmado correctamente",
            pedido
        });

    } catch (error) {

        console.error("Error al confirmar pedido:", error);

        return res.status(500).json({
            message: "Error al confirmar pedido",
            error: error.message
        });
    }
};


// =========================
// RECHAZAR PEDIDO
// =========================

export const rechazarPedido = async (req, res) => {
    try {

        const { id } = req.params;

        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({
                message: "Pedido no encontrado"
            });
        }

        const comentarioCancelacion = String(req.body?.comentarioCancelacion || "").trim();
        if (!comentarioCancelacion) {
            return res.status(400).json({ message: "Debes indicar el motivo del rechazo" });
        }

        pedido.estado = "rechazado";
        pedido.comentarioCancelacion = comentarioCancelacion;

        await pedido.save();

        return res.status(200).json({
            message: "Pedido rechazado correctamente",
            pedido
        });

    } catch (error) {

        console.error("Error al rechazar pedido:", error);

        return res.status(500).json({
            message: "Error al rechazar pedido",
            error: error.message
        });
    }
};


// =========================
// CANCELAR PEDIDO
// =========================

export const cancelarPedido = async (req, res) => {
    try {

        const { id } = req.params;

        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({
                message: "Pedido no encontrado"
            });
        }

        const comentarioCancelacion = String(req.body?.comentarioCancelacion || "").trim();
        if (!comentarioCancelacion) {
            return res.status(400).json({ message: "Debes indicar el motivo de la cancelación" });
        }

        pedido.estado = "cancelado";
        pedido.comentarioCancelacion = comentarioCancelacion;

        await pedido.save();

        return res.status(200).json({
            message: "Pedido cancelado correctamente",
            pedido
        });

    } catch (error) {

        console.error("Error al cancelar pedido:", error);

        return res.status(500).json({
            message: "Error al cancelar pedido",
            error: error.message
        });
    }
};

// =========================
// ACTUALIZAR ESTADO PEDIDO
// =========================

export const actualizarEstadoPedido = async (req, res) => {
    try {

        const { id } = req.params;
        const { estado } = req.body;
        const comentarioCancelacion = String(req.body?.comentarioCancelacion || "").trim();

        const estadosPermitidos = [
            "pendiente",
            "pagado",
            "preparando",
            "enviado",
            "entregado",
            "rechazado",
            "cancelado"
        ];

        if (!estado) {
            return res.status(400).json({
                message: "Debes enviar el estado"
            });
        }

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                message: "Estado no válido",
                estadosPermitidos
            });
        }

        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({
                message: "Pedido no encontrado"
            });
        }

        if (["cancelado", "rechazado"].includes(estado) && !comentarioCancelacion) {
            return res.status(400).json({ message: `Debes indicar el motivo del ${estado === "rechazado" ? "rechazo" : "cancelación"}` });
        }

        pedido.estado = estado;
        pedido.comentarioCancelacion = ["cancelado", "rechazado"].includes(estado) ? comentarioCancelacion : null;

        await pedido.save();

        return res.status(200).json({
            message: "Estado del pedido actualizado correctamente",
            pedido
        });

    } catch (error) {

        console.error(
            "Error al actualizar estado del pedido:",
            error
        );

        return res.status(500).json({
            message: "Error al actualizar estado del pedido",
            error: error.message
        });
    }
};
