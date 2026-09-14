import crypto from "crypto"

import { Cart } from "../models/cart.model.js"
import { CartItem } from "../models/cartItems.model.js"
import { Productos } from "../models/products.model.js"
import { Pedido } from "../models/pedido.model.js"
import { PedidoItem } from "../models/pedidoItem.model.js"


// ======================================================
// CREAR PAGO
// ======================================================

export const crearPago = async (req, res) => {

    try {

        // ==================================================
        // 1. OBTENER CART ID DE LA COOKIE
        // ==================================================

        const cartId = req.cookies.cartId

        console.log("CART ID:", cartId)

        if (!cartId) {

            return res.status(400).json({
                message: "No existe un carrito"
            })

        }


        // ==================================================
        // 2. BUSCAR EL CARRITO
        // ==================================================

        const carrito = await Cart.findByPk(cartId)

        if (!carrito) {

            return res.status(404).json({
                message: "Carrito no encontrado"
            })

        }


        // ==================================================
        // 3. BUSCAR LOS PRODUCTOS DEL CARRITO
        // ==================================================

        const cartItems = await CartItem.findAll({

            where: {
                cartId
            },

            include: [
                {
                    model: Productos,
                    as: "producto"
                }
            ]

        })


        if (cartItems.length === 0) {

            return res.status(400).json({
                message: "El carrito está vacío"
            })

        }


        // ==================================================
        // 4. VALIDAR QUE TODOS TENGAN PRODUCTO
        // ==================================================

        const productosInvalidos = cartItems.some(
            item => !item.producto
        )

        if (productosInvalidos) {

            return res.status(400).json({
                message: "Uno o más productos del carrito no existen"
            })

        }


        // ==================================================
        // 5. CALCULAR TOTAL
        // ==================================================

        const total = cartItems.reduce(
            (acumulado, item) => {

                const precio = Number(
                    item.producto.precio
                )

                const cantidad = Number(
                    item.quantity
                )

                return acumulado + (precio * cantidad)

            },
            0
        )


        if (!Number.isFinite(total) || total <= 0) {

            return res.status(400).json({
                message: "El total del pedido no es válido"
            })

        }


        // ==================================================
        // 6. CONVERTIR A CENTAVOS
        // ==================================================
        //
        // Wompi trabaja el monto en centavos.
        //
        // Ejemplo:
        //
        // $15.000 COP
        //
        // 15000 * 100 = 1500000
        //
        // ==================================================

        const amountInCents = Math.round(total * 100)


        // ==================================================
        // 7. CREAR PEDIDO
        // ==================================================

        const pedido = await Pedido.create({

            cartId: cartId,

            total: total,

            estado: "pendiente"

        })


        // ==================================================
        // 8. CREAR LOS ITEMS DEL PEDIDO
        // ==================================================

        for (const item of cartItems) {

            await PedidoItem.create({

                pedidoId: pedido.id,

                productId: item.productId,

                cantidad: Number(item.quantity),

                precio: Number(item.producto.precio)

            })

        }


        // ==================================================
        // 9. VALIDAR LLAVES DE WOMPI
        // ==================================================

        const publicKey =
            process.env.WOMPI_PUBLIC_KEY

        const integritySecret =
            process.env.WOMPI_INTEGRITY_SECRET


        if (!publicKey) {

            return res.status(500).json({
                message: "WOMPI_PUBLIC_KEY no está configurada"
            })

        }


        if (!integritySecret) {

            return res.status(500).json({
                message: "WOMPI_INTEGRITY_SECRET no está configurada"
            })

        }


        // ==================================================
        // 10. CREAR REFERENCIA ÚNICA
        // ==================================================

        const referencia =
            `PEDIDO-${pedido.id}-${Date.now()}`


        // ==================================================
        // 11. CREAR FIRMA DE INTEGRIDAD
        // ==================================================
        //
        // Wompi:
        //
        // referencia
        // +
        // amountInCents
        // +
        // COP
        // +
        // secreto de integridad
        //
        // Después SHA-256
        //
        // ==================================================

        const cadenaFirma =
            `${referencia}${amountInCents}COP${integritySecret}`


        const firmaIntegridad =
            crypto
                .createHash("sha256")
                .update(cadenaFirma)
                .digest("hex")


        console.log("REFERENCIA:", referencia)

        console.log(
            "MONTO CENTAVOS:",
            amountInCents
        )

        console.log(
            "FIRMA GENERADA:",
            firmaIntegridad
        )


        // ==================================================
        // 12. URL DE RETORNO
        // ==================================================

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173"


        const redirectUrl =
            `${frontendUrl}/pago/resultado`


        // ==================================================
        // 13. CREAR URL DEL CHECKOUT DE WOMPI
        // ==================================================

        const checkoutUrl =
            `https://checkout.wompi.co/p/` +
            `?public-key=${encodeURIComponent(publicKey)}` +
            `&currency=COP` +
            `&amount-in-cents=${amountInCents}` +
            `&reference=${encodeURIComponent(referencia)}` +
            `&signature:integrity=${encodeURIComponent(firmaIntegridad)}` +
            `&redirect-url=${encodeURIComponent(redirectUrl)}`


        // ==================================================
        // 14. GUARDAR REFERENCIA DEL PAGO
        // ==================================================

        await pedido.update({

            referenciaPago: referencia

        })


        // ==================================================
        // 15. RESPONDER AL FRONTEND
        // ==================================================

        return res.status(200).json({

            message: "Pago creado correctamente",

            pedidoId: pedido.id,

            total: total,

            amountInCents: amountInCents,

            referencia: referencia,

            checkoutUrl: checkoutUrl

        })


    } catch (error) {

        console.error(
            "================================="
        )

        console.error(
            "ERROR AL CREAR PAGO"
        )

        console.error(error)

        console.error(
            "================================="
        )


        return res.status(500).json({

            message: "Error al crear el pago",

            error: error.message

        })

    }

}
