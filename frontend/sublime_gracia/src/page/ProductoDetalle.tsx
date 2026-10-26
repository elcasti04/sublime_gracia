import axios from "axios";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { guardarCartId, headersCarrito } from "../utils/cartId";
import { marcarImagenNoDisponible, obtenerUrlImagen } from "../utils/imageUrl";

interface Product {
    id: number;
    nombre: string;
    marca?: string;
    genero: string;
    segmentacion: string;
    descripcion: string;
    precio: number;
    precioFinal?: number;
    img: string;
    stock?: number | null;
    presentaciones?: Array<{ id: number; mililitros: number | null; precio: number; stock: number | null; activo: boolean }>;
}

interface Review {
    id: number;
    nombre: string;
    opinion: string;
    calificacion: number;
    createdAt?: string;
}

const ProductoDetalle = () => {
    const { id } = useParams();
    const API_URL = `${import.meta.env.VITE_API_URL}/api`;
    const [producto, setProducto] = useState<Product | null>(null);
    const [reseñas, setReseñas] = useState<Review[]>([]);
    const [presentacionId, setPresentacionId] = useState<number | undefined>();
    const [nombre, setNombre] = useState("");
    const [opinion, setOpinion] = useState("");
    const [calificacion, setCalificacion] = useState("5");
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(true);

    const obtenerDatosProducto = useCallback(async () => {
        if (!id) return;
        const [productResponse, reviewsResponse] = await Promise.all([
            axios.get(`${API_URL}/catalogo/id/${encodeURIComponent(id)}`),
            axios.get(`${API_URL}/opiniones`, { params: { productoId: id } }).catch((requestError) => {
                const responseData = requestError.response?.data;
                const responseMessage = typeof responseData === "string"
                    ? responseData
                    : responseData?.message;
                if (requestError.response?.status === 404 &&
                    typeof responseMessage === "string" &&
                    responseMessage.toLocaleLowerCase("es").includes("no se encontraron reseñas")) {
                    return { data: [] };
                }
                throw requestError;
            })
        ]);
        return {
            producto: productResponse.data as Product,
            reseñas: Array.isArray(reviewsResponse.data) ? reviewsResponse.data as Review[] : []
        };
    }, [API_URL, id]);

    useEffect(() => {
        let cancelado = false;
        obtenerDatosProducto()
            .then((data) => {
                if (!data || cancelado) return;
                setProducto(data.producto);
                setReseñas(data.reseñas);
                setError("");
            })
            .catch((requestError: any) => {
                if (!cancelado) {
                    setError(requestError.response?.data?.message || "No se pudo cargar el producto.");
                    setCargando(false);
                }
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });
        return () => {
            cancelado = true;
        };
    }, [obtenerDatosProducto]);

    const cargarProducto = async () => {
        try {
            const data = await obtenerDatosProducto();
            if (!data) return;
            setProducto(data.producto);
            setReseñas(data.reseñas);
            setError("");
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "No se pudo cargar el producto.");
        } finally {
            setCargando(false);
        }
    };

    const enviarReseña = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id) return;
        if (!aceptaPrivacidad) {
            setError("Confirma que leíste la política de privacidad para publicar tu opinión.");
            return;
        }
        setError("");
        setMensaje("");
        try {
            await axios.post(`${API_URL}/opiniones`, {
                productoId: Number(id),
                nombre: nombre.trim(),
                opinion: opinion.trim(),
                calificacion: Number(calificacion),
                privacyAcknowledged: true
            });
            setNombre("");
            setOpinion("");
            setCalificacion("5");
            setMensaje("Tu opinión se publicó correctamente.");
            setCargando(true);
            await cargarProducto();
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "No se pudo publicar la opinión.");
        }
    };

    const agregarAlCarrito = async () => {
        if (!producto) return;
        try {
            const response = await axios.post(
                `${API_URL}/cart/items`,
                { productId: producto.id, presentacionId, quantity: 1 },
                { withCredentials: true, headers: headersCarrito() }
            );
            guardarCartId(response.data.cartId);
            setMensaje("Producto añadido al carrito.");
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "No se pudo agregar el producto al carrito.");
        }
    };

    if (cargando) return <main className="site-page"><p>Cargando producto...</p></main>;
    if (!producto) {
        return (
            <main className="site-page">
                <h1>Producto no disponible</h1>
                <Link className="site-primary-cta" to="/catalogo">Volver al catálogo</Link>
            </main>
        );
    }

    const presentacionesActivas = (producto.presentaciones || []).filter((presentacion) => presentacion.activo);
    const presentacion = presentacionesActivas.find((item) => item.id === presentacionId) || presentacionesActivas[0];
    const agotado = presentacion ? presentacion.stock === 0 : producto.stock === 0;

    return (
        <main className="site-page">
            <div className="product-detail">
                <img className="product-detail-image" src={obtenerUrlImagen(producto.img)} alt={`Frasco de perfume ${producto.nombre}`} onError={marcarImagenNoDisponible} />
                <section>
                    <p className="eyebrow">{producto.segmentacion} · {producto.genero}</p>
                    <h1>{producto.nombre}</h1>
                    {producto.marca && <p>Marca: {producto.marca}</p>}
                    <p>{producto.descripcion}</p>
                    {presentacionesActivas.length > 0 && (
                        <label>
                            Presentación
                            <select value={presentacion?.id ?? ""} onChange={(event) => setPresentacionId(Number(event.target.value))}>
                                {presentacionesActivas.map((item) => (
                                    <option key={item.id} value={item.id}>{item.mililitros ? `${item.mililitros} ml` : "Estándar"}</option>
                                ))}
                            </select>
                        </label>
                    )}
                    <p className="product-price">${Number(presentacion?.precio ?? producto.precioFinal ?? producto.precio).toLocaleString("es-CO")}</p>
                    {agotado
                        ? <p role="status">Agotado</p>
                        : <button className="site-primary-cta" type="button" onClick={agregarAlCarrito}>Agregar al carrito</button>}
                </section>
            </div>

            <section aria-labelledby="reviews-title">
                <h2 id="reviews-title">Opiniones sobre {producto.nombre}</h2>
                <p>Opiniones enviadas por visitantes. No se verifica si quien opina realizó una compra.</p>
                {reseñas.length === 0
                    ? <p>Aún no hay opiniones para este producto.</p>
                    : reseñas.map((reseña) => (
                        <article className="review-card" key={reseña.id}>
                            <strong>{reseña.nombre}</strong>
                            <span aria-label={`${reseña.calificacion} de 5 estrellas`}>{"★".repeat(reseña.calificacion)}{"☆".repeat(5 - reseña.calificacion)}</span>
                            {reseña.createdAt && <time dateTime={reseña.createdAt}>{new Date(reseña.createdAt).toLocaleDateString("es-CO")}</time>}
                            <p>{reseña.opinion}</p>
                        </article>
                    ))}

                <form className="product-review-form" onSubmit={enviarReseña}>
                    <h3>Compartir una opinión</h3>
                    <label htmlFor="review-name">Nombre para mostrar</label>
                    <input id="review-name" value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={80} required />
                    <label htmlFor="review-rating">Calificación</label>
                    <select id="review-rating" value={calificacion} onChange={(event) => setCalificacion(event.target.value)}>
                        {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} de 5</option>)}
                    </select>
                    <label htmlFor="review-opinion">Opinión</label>
                    <textarea id="review-opinion" value={opinion} onChange={(event) => setOpinion(event.target.value)} maxLength={1000} required />
                    <label className="policy-acknowledgment">
                        <input type="checkbox" checked={aceptaPrivacidad} onChange={(event) => setAceptaPrivacidad(event.target.checked)} required />
                        <span>He leído la <Link to="/privacidad">política de privacidad</Link> y autorizo el uso de mi nombre y opinión para mostrar esta reseña.</span>
                    </label>
                    <button type="submit" className="site-primary-cta">Publicar opinión</button>
                    {error && <p role="alert">{error}</p>}
                    {mensaje && <p role="status">{mensaje}</p>}
                </form>
            </section>
        </main>
    );
};

export default ProductoDetalle;
