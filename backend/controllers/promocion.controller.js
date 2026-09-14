import { Promocion } from "../models/promocion.model.js";
import { Productos } from "../models/products.model.js";
import { ProductoPresentacion } from "../models/productoPresentacion.model.js";
import { validarPromocion } from "../services/promocion.service.js";

const datosPromocion = (body) => ({
    nombre: body.nombre,
    tipo: body.tipo,
    valor: Number(body.valor || 0),
    fechaInicio: body.fechaInicio,
    fechaFin: body.fechaFin,
    activa: body.activa !== false,
    genero: body.genero || "TODOS",
    prioridad: Number(body.prioridad || 0)
});

const asignarProductos = async (promocion, productIds) => {
    if (!Array.isArray(productIds)) return;
    const productos = await Productos.findAll({ where: { id: productIds } });
    await promocion.setProductos(productos);
};

const asignarPresentaciones = async (promocion, presentationIds) => {
    if (!Array.isArray(presentationIds)) return;
    const presentaciones = await ProductoPresentacion.findAll({ where: { id: presentationIds } });
    await promocion.setPresentaciones(presentaciones);
};

export const listarPromociones = async (_req, res) => {
    const promociones = await Promocion.findAll({
        include: [{ association: "productos", required: false }, { association: "presentaciones", required: false }],
        order: [["fechaInicio", "DESC"], ["prioridad", "DESC"]]
    });
    res.json(promociones);
};

export const obtenerPromocion = async (req, res) => {
    const promocion = await Promocion.findByPk(req.params.id, {
        include: [{ association: "productos", required: false }, { association: "presentaciones", required: false }]
    });
    if (!promocion) return res.status(404).json({ message: "Promocion no encontrada" });
    res.json(promocion);
};

export const crearPromocion = async (req, res) => {
    const datos = datosPromocion(req.body);
    const error = validarPromocion(datos);
    if (error) return res.status(400).json({ message: error });
    const promocion = await Promocion.create(datos);
    await asignarProductos(promocion, req.body.productIds);
    await asignarPresentaciones(promocion, req.body.presentationIds);
    res.status(201).json(await Promocion.findByPk(promocion.id, { include: ["productos", "presentaciones"] }));
};

export const actualizarPromocion = async (req, res) => {
    const promocion = await Promocion.findByPk(req.params.id);
    if (!promocion) return res.status(404).json({ message: "Promocion no encontrada" });
    const datos = datosPromocion(req.body);
    const error = validarPromocion(datos);
    if (error) return res.status(400).json({ message: error });
    await promocion.update(datos);
    await asignarProductos(promocion, req.body.productIds);
    await asignarPresentaciones(promocion, req.body.presentationIds);
    res.json(await Promocion.findByPk(promocion.id, { include: ["productos", "presentaciones"] }));
};

export const cambiarEstadoPromocion = async (req, res) => {
    const promocion = await Promocion.findByPk(req.params.id);
    if (!promocion) return res.status(404).json({ message: "Promocion no encontrada" });
    await promocion.update({ activa: Boolean(req.body.activa) });
    res.json(promocion);
};

export const eliminarPromocion = async (req, res) => {
    const promocion = await Promocion.findByPk(req.params.id);
    if (!promocion) return res.status(404).json({ message: "Promocion no encontrada" });
    await promocion.destroy();
    res.json({ message: "Promocion eliminada" });
};