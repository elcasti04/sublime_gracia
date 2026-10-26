import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { guardarCartId, headersCarrito } from "../utils/cartId";
import { marcarImagenNoDisponible, obtenerUrlImagen } from "../utils/imageUrl";

interface Presentacion {
    id?: number;
    precio: number;
    precioFinal?: number;
    stock?: number | null;
    activo: boolean;
    tienePromocion?: boolean;
    porcentajeDescuento?: number;
}

interface Producto {
    id: number;
    nombre: string;
    genero?: string;
    segmentacion?: string;
    descripcion?: string;
    precio: number;
    precioFinal?: number;
    img: string;
    stock?: number | null;
    activo?: boolean;
    tienePromocion?: boolean;
    porcentajeDescuento?: number;
    presentaciones?: Presentacion[];
}

const FeaturedProducts = () => {
    const API_URL = `${import.meta.env.VITE_API_URL}/api`;
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [productoAgregando, setProductoAgregando] = useState<number | null>(null);

    useEffect(() => {
        let cancelado = false;

        axios.get(`${API_URL}/catalogo`, { params: { pagina: 1 } })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : response.data?.productos;
                if (!Array.isArray(data)) {
                    throw new Error(response.data?.message || "No se pudo cargar la colección.");
                }
                if (!cancelado) setProductos(data.slice(0, 4));
            })
            .catch((reason: unknown) => {
                if (!cancelado) {
                    const responseMessage = axios.isAxiosError(reason) ? reason.response?.data?.message : undefined;
                    const networkMessage = axios.isAxiosError(reason) && reason.request
                        ? "No fue posible conectar con la tienda. Intenta nuevamente o explora el catálogo completo."
                        : undefined;
                    setError(responseMessage || networkMessage || (reason instanceof Error ? reason.message : "No se pudo cargar la colección."));
                }
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [API_URL]);

    const agregarAlCarrito = async (producto: Producto) => {
        if (productoAgregando !== null) return;
        const presentacion = producto.presentaciones?.find((item) => item.activo);
        setProductoAgregando(producto.id);
        try {
            const response = await axios.post(
                `${API_URL}/cart/items`,
                { productId: producto.id, presentacionId: presentacion?.id, quantity: 1 },
                { withCredentials: true, headers: headersCarrito() }
            );
            guardarCartId(response.data.cartId);
            setError("");
            setMensaje(`${producto.nombre} se añadió al carrito.`);
        } catch (reason: unknown) {
            const responseMessage = axios.isAxiosError(reason) ? reason.response?.data?.message : undefined;
            setError(responseMessage || "No se pudo agregar el producto al carrito.");
            setMensaje("");
        } finally {
            setProductoAgregando(null);
        }
    };

    return (
        <section className="home-featured" aria-labelledby="home-featured-title">
            <div className="home-section-heading">
                <span className="home-eyebrow">Nuestra colección</span>
                <h2 id="home-featured-title">Fragancias para recordar</h2>
                <p>Descubre aromas seleccionados para acompañar cada momento.</p>
            </div>

            {mensaje && (
                <p className="home-cart-message" role="status" aria-live="polite">
                    {mensaje} <Link to="/carrito">Ver carrito</Link>
                </p>
            )}
            {error && <p className="home-featured-error" role="status">{error}</p>}
            {cargando && <p className="home-featured-state" role="status">Cargando fragancias...</p>}
            {!cargando && !error && productos.length === 0 && (
                <p className="home-featured-state">Pronto encontrarás nuevas fragancias en nuestra colección.</p>
            )}

            {productos.length > 0 && (
                <div className="home-product-grid">
                    {productos.map((producto) => {
                        const presentacion = producto.presentaciones?.find((item) => item.activo);
                        const precio = presentacion?.precio ?? producto.precio;
                        const precioFinal = presentacion?.precioFinal ?? producto.precioFinal ?? precio;
                        const tienePromocion = presentacion?.tienePromocion ?? producto.tienePromocion ?? false;
                        const agotado = presentacion
                            ? presentacion.stock === 0
                            : producto.stock === 0;

                        return (
                            <article className="home-product-card" key={producto.id}>
                                <Link className="home-product-photo" to={`/producto/${producto.id}`} aria-label={`Ver ${producto.nombre}`}>
                                    <img src={obtenerUrlImagen(producto.img)} alt={producto.nombre} loading="lazy" onError={marcarImagenNoDisponible} />
                                    {tienePromocion && <span className="home-product-badge">Oferta</span>}
                                </Link>
                                <div className="home-product-info">
                                    <span className="home-product-meta">
                                        {[producto.genero, producto.segmentacion].filter(Boolean).join(" · ") || "Fragancia"}
                                    </span>
                                    <h3><Link to={`/producto/${producto.id}`}>{producto.nombre}</Link></h3>
                                    {producto.descripcion && <p>{producto.descripcion}</p>}
                                    <div className="home-product-purchase">
                                        <div className="home-product-price">
                                            {tienePromocion && <del>${Number(precio).toLocaleString("es-CO")}</del>}
                                            <strong>${Number(precioFinal).toLocaleString("es-CO")}</strong>
                                            {tienePromocion && (presentacion?.porcentajeDescuento ?? producto.porcentajeDescuento) != null && (
                                                <small>{Math.round(presentacion?.porcentajeDescuento ?? producto.porcentajeDescuento ?? 0)}% menos</small>
                                            )}
                                        </div>
                                        {agotado ? (
                                            <span className="home-product-unavailable">Agotado</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => agregarAlCarrito(producto)}
                                                disabled={productoAgregando !== null}
                                            >
                                                {productoAgregando === producto.id ? "Agregando..." : "Agregar al carrito"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <Link className="home-all-products" to="/catalogo">Explorar toda la colección <span aria-hidden="true">→</span></Link>
        </section>
    );
};

export default FeaturedProducts;
