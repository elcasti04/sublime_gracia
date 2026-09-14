import { Cart } from "./cart.model.js";
import { CartItem } from "./cartItems.model.js";
import { Productos } from "./products.model.js";
import { Pedido } from "./pedido.model.js";
import { PedidoItem } from "./pedidoItem.model.js";
import { Promocion } from "./promocion.model.js";
import { ProductoPresentacion } from "./productoPresentacion.model.js";

// =========================
// CARRITO
// =========================

Cart.hasMany(CartItem, {
    foreignKey: "cartId",
    onDelete: "CASCADE",
    as: "items"
});

CartItem.belongsTo(Cart, {
    foreignKey: "cartId",
    as: "carrito"
});

// =========================
// PRODUCTOS - CARRITO
// =========================

Productos.hasMany(CartItem, {
    foreignKey: "productId",
    as: "cartItems"
});

CartItem.belongsTo(Productos, {
    foreignKey: "productId",
    as: "producto"
});

// =========================
// PEDIDO
// =========================

Pedido.hasMany(PedidoItem, {
    foreignKey: "pedidoId",
    onDelete: "CASCADE",
    as: "items"
});

PedidoItem.belongsTo(Pedido, {
    foreignKey: "pedidoId",
    as: "pedido"
});

// =========================
// PRODUCTOS - PEDIDO
// =========================

Productos.hasMany(PedidoItem, {
    foreignKey: "productId",
    as: "pedidoItems"
});

PedidoItem.belongsTo(Productos, {
    foreignKey: "productId",
    as: "producto"
});

// =========================
// PROMOCIONES - PRODUCTOS
// =========================

Promocion.belongsToMany(Productos, {
    through: "promocionProductos",
    foreignKey: "promocionId",
    otherKey: "productoId",
    as: "productos"
});

Productos.belongsToMany(Promocion, {
    through: "promocionProductos",
    foreignKey: "productoId",
    otherKey: "promocionId",
    as: "promociones"
});

Productos.hasMany(ProductoPresentacion, {
    foreignKey: "productoId",
    as: "presentaciones",
    onDelete: "CASCADE"
});

ProductoPresentacion.belongsTo(Productos, {
    foreignKey: "productoId",
    as: "producto"
});

ProductoPresentacion.hasMany(CartItem, {
    foreignKey: "presentacionId",
    as: "cartItems"
});

CartItem.belongsTo(ProductoPresentacion, {
    foreignKey: "presentacionId",
    as: "presentacion"
});

ProductoPresentacion.hasMany(PedidoItem, {
    foreignKey: "presentacionId",
    as: "pedidoItems"
});

PedidoItem.belongsTo(ProductoPresentacion, {
    foreignKey: "presentacionId",
    as: "presentacion"
});

Promocion.belongsToMany(ProductoPresentacion, {
    through: "promocionPresentaciones",
    foreignKey: "promocionId",
    otherKey: "presentacionId",
    as: "presentaciones"
});

ProductoPresentacion.belongsToMany(Promocion, {
    through: "promocionPresentaciones",
    foreignKey: "presentacionId",
    otherKey: "promocionId",
    as: "promociones"
});