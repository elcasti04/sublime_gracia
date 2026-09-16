import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../style/carrito.css";
import { obtenerUrlImagen } from "../utils/imageUrl";
import { guardarCartId, headersCarrito } from "../utils/cartId";

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    img: string;
    stock?: number | null;
    activo?: boolean;
    presentaciones?: Presentacion[];
}

interface Presentacion {
    id: number;
    mililitros: number | null;
    precio: number;
    activo: boolean;
    stock: number | null;
}

interface Calculo {
    precioOriginal: number;
    precioFinal: number;
    descuento: number;
    totalFinal: number;
    tienePromocion: boolean;
    promocion?: { nombre: string; tipo: string } | null;
}

interface CartItem {
    id: number;
    quantity: number;
    cartId: string;
    productId: number;
    producto: Producto;
    calculo?: Calculo | null;
    presentacion?: Presentacion | null;
}

const Carrito = () => {

    const navigate = useNavigate();

    const [items, setItems] = useState<CartItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    const ultimoPedidoId = localStorage.getItem("ultimoPedidoId");

    // =========================
    // OBTENER CARRITO
    // =========================

    useEffect(() => {
        obtenerCarrito();
    }, []);

    const obtenerCarrito = async () => {

        try {

            const res = await axios.get(
                `${API_URL}/api/cart`,
                {
                    withCredentials: true,
                    headers: headersCarrito()
                }
            );

            console.log("CARRITO:", res.data);

            guardarCartId(res.data.cartId);

            setItems(
                Array.isArray(res.data.items)
                    ? res.data.items
                    : []
            );

        } catch (error: any) {

            console.error(
                "Error al obtener carrito:",
                error
            );

            setError(
                error.response?.data?.message ||
                "No se pudo cargar el carrito"
            );

        } finally {

            setCargando(false);

        }
    };

    // =========================
    // AUMENTAR CANTIDAD
    // =========================

    const aumentarCantidad = async (
        cartItem: CartItem
    ) => {

        try {

            const nuevaCantidad =
                cartItem.quantity + 1;

            await axios.put(
                `${API_URL}/api/cart/${cartItem.id}`,
                {
                    quantity: nuevaCantidad
                },
                {
                    withCredentials: true,
                    headers: headersCarrito()
                }
            );

            await obtenerCarrito();

        } catch (error) {

            console.error(
                "Error al aumentar cantidad:",
                error
            );

        }
    };

    // =========================
    // DISMINUIR CANTIDAD
    // =========================

    const disminuirCantidad = async (
        cartItem: CartItem
    ) => {

        if (cartItem.quantity <= 1) {

            await eliminarDelCarrito(
                cartItem.id
            );

            return;
        }

        try {

            const nuevaCantidad =
                cartItem.quantity - 1;

            await axios.put(
                `${API_URL}/api/cart/${cartItem.id}`,
                {
                    quantity: nuevaCantidad
                },
                {
                    withCredentials: true,
                    headers: headersCarrito()
                }
            );

            await obtenerCarrito();

        } catch (error) {

            console.error(
                "Error al disminuir cantidad:",
                error
            );

        }
    };

    const cambiarPresentacion = async (cartItem: CartItem, presentacionId: string) => {
        try {
            await axios.put(`${API_URL}/api/cart/${cartItem.id}`, { quantity: cartItem.quantity, presentacionId: Number(presentacionId) }, { withCredentials: true, headers: headersCarrito() });
            await obtenerCarrito();
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo cambiar la presentación");
        }
    };

    // =========================
    // ELIMINAR PRODUCTO
    // =========================

    const eliminarDelCarrito = async (
        id: number
    ) => {

        try {

            await axios.delete(
                `${API_URL}/api/cart/${id}`,
                {
                    withCredentials: true,
                    headers: headersCarrito()
                }
            );

            setItems(prevItems =>
                prevItems.filter(
                    item => item.id !== id
                )
            );

        } catch (error: any) {

            console.error(
                "Error al eliminar:",
                error
            );

            setError(
                error.response?.data?.message ||
                "No se pudo eliminar el producto"
            );

        }
    };

    // =========================
    // CALCULAR TOTAL
    // =========================

    const total = items.reduce(
        (acumulado, cartItem) => {

            if (!cartItem.producto) {
                return acumulado;
            }

            return acumulado + Number(cartItem.calculo?.totalFinal ?? Number(cartItem.producto.precio) * Number(cartItem.quantity));

        },
        0
    );

    // =========================
    // COMPRAR
    // =========================

    const comprar = () => {

        if (items.length === 0) {

            setError(
                "No puedes comprar porque el carrito está vacío"
            );

            return;
        }

        setError(null);

        console.log(
            "YENDO AL CHECKOUT..."
        );

        /*
         * Ya no hacemos POST /api/pagos aquí.
         *
         * El cliente primero debe ir al Checkout,
         * llenar sus datos, realizar el pago por
         * Nequi y subir el comprobante.
         */

        window.location.href = "/checkout";
    };

    // =========================
    // CARGANDO
    // =========================

    if (cargando) {

        return (
            <div className="carrito">

                <h1>
                    Mi carrito
                </h1>

                <p>
                    Cargando...
                </p>

            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (

        <div className="carrito">

            <h1>
                Mi carrito
            </h1>

            <button
                type="button"
                className="ver-seguimiento"
                onClick={() => navigate(ultimoPedidoId ? `/seguimiento/${ultimoPedidoId}` : "/seguimiento")}
            >
                Ver estado de mi pedido
            </button>

            {error && (

                <p className="error">
                    {error}
                </p>

            )}

            {items.length === 0 ? (

                // =========================
                // CARRITO VACÍO
                // =========================

                <div className="carrito-vacio">

                    <h2>
                        Tu carrito está vacío
                    </h2>

                    <p>
                        Agrega una fragancia desde
                        el catálogo.
                    </p>

                </div>

            ) : (

                <>

                    {/* =========================
                        PRODUCTOS
                    ========================= */}

                    <div className="carrito-productos">

                        {items.map(cartItem => {

                            const producto =
                                cartItem.producto;

                            /*
                             * Si el backend no devuelve
                             * el producto relacionado,
                             * evitamos errores.
                             */

                            if (!producto) {
                                return null;
                            }

                                            const subtotal = Number(cartItem.calculo?.totalFinal ?? Number(producto.precio) * Number(cartItem.quantity));

                            return (

                                <article
                                    className="carrito-item"
                                    key={cartItem.id}
                                >

                                    {/* IMAGEN */}

                                    <img
                                        src={obtenerUrlImagen(producto.img)}
                                        alt={
                                            producto.nombre
                                        }
                                    />

                                    {/* INFORMACIÓN */}

                                    <div className="carrito-info">

                                        <h2>
                                            {
                                                producto.nombre
                                            }
                                        </h2>

                                        {producto.presentaciones && producto.presentaciones.length > 0 && (
                                            <select value={cartItem.presentacion?.id ?? ""} onChange={(event) => cambiarPresentacion(cartItem, event.target.value)}>
                                                {producto.presentaciones.filter((presentacion) => presentacion.activo).map((presentacion) => <option key={presentacion.id} value={presentacion.id}>{presentacion.mililitros ? `${presentacion.mililitros} ml` : "Estándar"}</option>)}
                                            </select>
                                        )}

                                        <p className="precio">
                                            {cartItem.calculo?.tienePromocion && (
                                                <span className="precio-original">
                                                    ${Number(cartItem.calculo.precioOriginal).toLocaleString("es-CO")} 
                                                </span>
                                            )}
                                            ${Number(cartItem.calculo?.precioFinal ?? producto.precio).toLocaleString("es-CO")}
                                            {cartItem.calculo?.promocion?.tipo === "2X1" && <small> 2x1</small>}
                                            {cartItem.calculo?.promocion?.tipo === "3X2" && <small> 3x2</small>}
                                        </p>

                                        {/* CANTIDAD */}

                                        <div className="cantidad">

                                            <button
                                                type="button"
                                                disabled={cartItem.producto.stock !== null && cartItem.producto.stock !== undefined && cartItem.quantity >= cartItem.producto.stock}
                                                onClick={() =>
                                                    disminuirCantidad(
                                                        cartItem
                                                    )
                                                }
                                            >
                                                −
                                            </button>

                                            <span>
                                                {
                                                    cartItem.quantity
                                                }
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aumentarCantidad(
                                                        cartItem
                                                    )
                                                }
                                            >
                                                +
                                            </button>

                                        </div>

                                        {/* ELIMINAR */}

                                        <button
                                            type="button"
                                            className="eliminar"
                                            onClick={() =>
                                                eliminarDelCarrito(
                                                    cartItem.id
                                                )
                                            }
                                        >
                                            Eliminar
                                        </button>

                                    </div>

                                    {/* SUBTOTAL */}

                                    <p className="subtotal">

                                        $

                                        {subtotal.toLocaleString(
                                            "es-CO"
                                        )}

                                    </p>

                                </article>

                            );
                        })}

                    </div>

                    {/* =========================
                        TOTAL
                    ========================= */}

                    <div className="carrito-total">

                        <h2>
                            Total
                        </h2>

                        <p>

                            $

                            {total.toLocaleString(
                                "es-CO"
                            )}

                        </p>

                    </div>

                    {/* =========================
                        COMPRAR
                    ========================= */}

                    <button
                        type="button"
                        className="comprar"
                        onClick={comprar}
                    >
                        Comprar
                    </button>

                </>

            )}

        </div>
    );
};

export default Carrito;
