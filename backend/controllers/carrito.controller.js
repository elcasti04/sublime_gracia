import { randomUUID } from "crypto"

import { Cart } from "../models/cart.model.js"
import { CartItem } from "../models/cartItems.model.js"
import { Productos } from "../models/products.model.js"
import { ProductoPresentacion } from "../models/productoPresentacion.model.js"
import { obtenerPromocionesVigentes, calcularPrecioPromocional } from "../services/promocion.service.js"

    export const getCart = async (req, res) => {

        try {

            const cartId = req.headers["x-cart-id"] || req.cookies.cartId

            if (!cartId) {

                return res.status(200).json({
                    cartId: null,
                    items: []
                })

            }

            const carrito = await Cart.findByPk(cartId)

            if (!carrito) {

                return res.status(200).json({
                    cartId: null,
                    items: []
                })

            }

            const items = await CartItem.findAll({

                where: {
                    cartId
                },

                include: [
                    {
                        model: Productos,
                        as: "producto",
                        include: [{ model: ProductoPresentacion, as: "presentaciones" }]
                    },
                    {
                        model: ProductoPresentacion,
                        as: "presentacion"
                    }
                ]

            })

            const promociones = await obtenerPromocionesVigentes()
            const itemsConPrecio = items.map((item) => {
                const datos = item.toJSON()
                return {
                    ...datos,
                    presentacion: datos.presentacion,
                    calculo: datos.producto
                        ? calcularPrecioPromocional({ ...datos.producto, presentacion: datos.presentacion }, datos.quantity, promociones)
                        : null
                }
            })

            return res.status(200).json({

                cartId: cartId,

                items: itemsConPrecio

            })

        } catch (error) {

            console.error("ERROR AL OBTENER CARRITO:")
            console.error(error)

            return res.status(500).json({

                message: "Error al obtener el carrito",

                error: error.message

            })

        }

    }