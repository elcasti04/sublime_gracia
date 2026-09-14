import { Cart } from "../models/cart.model.js"
import { CartItem } from "../models/cartItems.model.js"
import { Productos } from "../models/products.model.js"
import { ProductoPresentacion } from "../models/productoPresentacion.model.js"

export const createItem = async (req, res) => {

    try {

        const { productId, presentacionId = null, quantity = 1 } = req.body

        console.log("BODY:", req.body)
        console.log("COOKIES:", req.cookies)

        if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                message: "productId es obligatorio"
            })
        }

        let cartId = req.cookies.cartId

        if (!cartId) {

            const cart = await Cart.create()

            cartId = cart.id

            const secureCookie = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production"

            res.cookie("cartId", cartId, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 30,
                path: "/",
                sameSite: secureCookie ? "none" : "lax",
                secure: secureCookie
            })
        }

        const producto = await Productos.findByPk(productId)

        if (!producto) {
            return res.status(404).json({
                message: "Producto no encontrado"
            })
        }

        if (producto.activo === false) {
            return res.status(409).json({ message: "El producto no esta disponible" })
        }

        let presentacion = null
        if (presentacionId !== null && presentacionId !== "") {
            presentacion = await ProductoPresentacion.findOne({ where: { id: presentacionId, productoId: productId, activo: true } })
            if (!presentacion) return res.status(404).json({ message: "Presentacion no encontrada" })
        }

        const stock = presentacion?.stock ?? producto.stock

        const cantidadSolicitada = Number(quantity)
        const existente = await CartItem.findOne({
            where: {
                cartId,
                productId,
                presentacionId: presentacion?.id ?? null
            }
        })
        const cantidadFinal = (existente?.quantity || 0) + cantidadSolicitada

        if (stock !== null && cantidadFinal > stock) {
            return res.status(409).json({ message: `No hay suficiente stock. Disponible: ${stock}` })
        }

        if (existente) {

            existente.quantity = cantidadFinal

            await existente.save()

            return res.status(200).json(existente)
        }

        const item = await CartItem.create({
            cartId,
            productId,
            presentacionId: presentacion?.id ?? null,
            quantity: Number(quantity)
        })

        res.status(201).json(item)

    } catch (error) {

        console.error("ERROR AL CREAR CART ITEM:", error)

        res.status(500).json({
            message: "Error al crear CartItem",
            error: error.message
        })
    }
}
export const updateItem = async (req, res) => {
    try {

        const { id } = req.params
        const { quantity, presentacionId } = req.body

        const item = await CartItem.findByPk(id)

        if (!item) {
            return res.status(404).json({
                message: "Producto del carrito no encontrado"
            })
        }

        const producto = await Productos.findByPk(item.productId)
        if (!producto || producto.activo === false) {
            return res.status(409).json({ message: "El producto no esta disponible" })
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            if (quantity <= 0) {
                await item.destroy()
                return res.status(200).json({ message: "Producto eliminado del carrito" })
            }
            return res.status(400).json({ message: "La cantidad no es valida" })
        }

        const nuevaPresentacionId = presentacionId === "" ? null : (presentacionId ?? item.presentacionId)
        const presentacion = nuevaPresentacionId
            ? await ProductoPresentacion.findOne({ where: { id: nuevaPresentacionId, productoId: item.productId, activo: true } })
            : null
        if (nuevaPresentacionId && !presentacion) return res.status(404).json({ message: "Presentacion no encontrada" })
        const stock = presentacion?.stock ?? producto.stock
        if (stock !== null && Number(quantity) > stock) {
            return res.status(409).json({ message: `No hay suficiente stock. Disponible: ${stock}` })
        }

        if (quantity <= 0) {
            await item.destroy()

            return res.status(200).json({
                message: "Producto eliminado del carrito"
            })
        }

        if (nuevaPresentacionId !== item.presentacionId) {
            const existente = await CartItem.findOne({ where: { cartId: item.cartId, productId: item.productId, presentacionId: nuevaPresentacionId } })
            if (existente) {
                existente.quantity += Number(quantity)
                await existente.save()
                await item.destroy()
                return res.status(200).json(existente)
            }
            item.presentacionId = nuevaPresentacionId
        }

        item.quantity = quantity

        await item.save()

        res.status(200).json(item)

    } catch (error) {

        console.error("ERROR AL ACTUALIZAR:", error)

        res.status(500).json({
            message: "Error al actualizar carrito",
            error: error.message
        })
    }
}


export const deleteItem = async (req, res) => {
    try {

        const { id } = req.params

        const item = await CartItem.findByPk(id)

        if (!item) {
            return res.status(404).json({
                message: "Producto del carrito no encontrado"
            })
        }

        await item.destroy()

        res.status(200).json({
            message: "Producto eliminado del carrito"
        })

    } catch (error) {

        console.error("ERROR AL ELIMINAR:", error)

        res.status(500).json({
            message: "Error al eliminar producto",
            error: error.message
        })
    }
}