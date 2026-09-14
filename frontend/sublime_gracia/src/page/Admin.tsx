import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../style/admin.css";
import { obtenerUrlImagen } from "../utils/imageUrl";

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    img: string;
}

interface PedidoItem {
    id: string;
    cantidad: number;
    productId: number;
    precio: number;
    nombreProducto?: string;
    imagenProducto?: string;
    mililitros?: number | null;
    producto?: Producto;
}

interface Pedido {
    id: string;
    nombre: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    total: number;
    estado: "pendiente" | "pagado" | "preparando" | "enviado" | "entregado" | "rechazado" | "cancelado";
    comentarioCancelacion?: string | null;
    referencia?: string;
    comprobante?: string;
    email: string;
    createdAt?: string;
    items: PedidoItem[];
}

interface Anuncio {
    id: number;
    img: string;
}

interface Promocion {
    id: number;
    nombre: string;
    tipo: "PORCENTAJE" | "MONTO" | "2X1" | "3X2";
    valor: number;
    fechaInicio: string;
    fechaFin: string;
    activa: boolean;
    genero: "TODOS" | "HOMBRE" | "MUJER";
    prioridad: number;
}

const Admin = () => {

    const navigate = useNavigate();

    // ==========================================
    // PEDIDOS
    // ==========================================

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actualizando, setActualizando] = useState<string | null>(null);
    const [motivosRechazo, setMotivosRechazo] = useState<Record<string, string>>({});

    // ==========================================
    // HISTÓRICOS
    // ==========================================

    const [verHistoricos, setVerHistoricos] = useState(false);

    // ==========================================
    // COMPROBANTE
    // ==========================================

    const [comprobanteSeleccionado, setComprobanteSeleccionado] =
        useState<string | null>(null);

    // ==========================================
    // ANUNCIOS
    // ==========================================

    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

    const [imagenSeleccionada, setImagenSeleccionada] =
        useState<File | null>(null);

    const [preview, setPreview] = useState<string>("");

    const [subiendoAnuncio, setSubiendoAnuncio] =
        useState(false);

    const [eliminandoAnuncio, setEliminandoAnuncio] =
        useState<number | null>(null);

    const API_URL = "http://localhost:3000/api";

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if ([401, 403].includes(error.response?.status)) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/", { replace: true });
                }
                return Promise.reject(error);
            }
        );

        const token = localStorage.getItem("token");
        const userValue = localStorage.getItem("user");
        let isAdmin = false;

        try {
            isAdmin = Boolean(userValue && JSON.parse(userValue).rol === "admin");
        } catch {
            isAdmin = false;
        }

        if (!token || !isAdmin) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/", { replace: true });
            return () => axios.interceptors.response.eject(interceptor);
        }

        axios.get(`${API_URL}/admin/pedidos`, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch((error) => {
            if ([401, 403].includes(error.response?.status)) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/", { replace: true });
            }
        });

        return () => axios.interceptors.response.eject(interceptor);
    }, [navigate]);

    const [promociones, setPromociones] = useState<Promocion[]>([]);
    const [promocionEditando, setPromocionEditando] = useState<number | null>(null);
    const [formPromocion, setFormPromocion] = useState({
        nombre: "",
        tipo: "PORCENTAJE" as Promocion["tipo"],
        valor: "20",
        genero: "TODOS" as Promocion["genero"],
        fechaInicio: "",
        fechaFin: "",
        prioridad: "0",
        activa: true
    });

    const obtenerPromociones = async () => {
        try {
            const response = await axios.get(`${API_URL}/promociones`);
            setPromociones(Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudieron cargar las promociones");
        }
    };

    const guardarPromocion = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formPromocion,
                valor: ["2X1", "3X2"].includes(formPromocion.tipo) ? 0 : Number(formPromocion.valor),
                prioridad: Number(formPromocion.prioridad)
            };
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = promocionEditando
                ? await axios.put(`${API_URL}/promociones/${promocionEditando}`, payload, config)
                : await axios.post(`${API_URL}/promociones`, payload, config);
            setPromociones((prev) => promocionEditando
                ? prev.map((item) => item.id === promocionEditando ? response.data : item)
                : [response.data, ...prev]);
            setPromocionEditando(null);
            setFormPromocion({ nombre: "", tipo: "PORCENTAJE", valor: "20", genero: "TODOS", fechaInicio: "", fechaFin: "", prioridad: "0", activa: true });
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo guardar la promocion");
        }
    };

    const cambiarEstadoPromocion = async (promocion: Promocion) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${API_URL}/promociones/${promocion.id}/estado`, { activa: !promocion.activa }, { headers: { Authorization: `Bearer ${token}` } });
            setPromociones((prev) => prev.map((item) => item.id === promocion.id ? { ...item, activa: !item.activa } : item));
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo cambiar el estado");
        }
    };

    const eliminarPromocion = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/promociones/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setPromociones((prev) => prev.filter((item) => item.id !== id));
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo eliminar la promocion");
        }
    };

    // ==========================================
    // OBTENER PEDIDOS
    // ==========================================

    const obtenerPedidos = async () => {

        try {

            setCargando(true);
            setError(null);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("No hay sesión de administrador");
                return;
            }

            const response = await axios.get(
                `${API_URL}/admin/pedidos`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "PEDIDOS ADMIN:",
                response.data
            );

            const datos = Array.isArray(response.data)
                ? response.data
                : response.data.pedidos || [];

            setPedidos(datos);

        } catch (error: any) {

            console.error(
                "Error al obtener pedidos:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Tu sesión expiró o el token no es válido"
                );

            } else if (error.response?.status === 403) {

                setError(
                    "No tienes permisos de administrador"
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "No se pudieron cargar los pedidos"
                );
            }

        } finally {

            setCargando(false);

        }
    };

    // ==========================================
    // SABER SI EL PEDIDO ES DE HOY
    // ==========================================

    const esPedidoDeHoy = (pedido: Pedido) => {

        if (!pedido.createdAt) {
            return false;
        }

        const fechaPedido = new Date(pedido.createdAt);
        const hoy = new Date();

        return (
            fechaPedido.getFullYear() === hoy.getFullYear() &&
            fechaPedido.getMonth() === hoy.getMonth() &&
            fechaPedido.getDate() === hoy.getDate()
        );
    };

    // ==========================================
    // PEDIDOS QUE SE MOSTRARÁN
    // ==========================================

    const pedidosMostrados = verHistoricos
        ? pedidos
        : pedidos.filter(esPedidoDeHoy);

    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    const cambiarEstado = async (
        id: string,
        estado: Pedido["estado"],
        comentarioCancelacion = ""
    ) => {

        try {

            setActualizando(id);
            setError(null);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("No hay sesión de administrador");
                return;
            }

            await axios.put(
                `${API_URL}/admin/pedidos/${id}/estado`,
                {
                    estado,
                    ...(["cancelado", "rechazado"].includes(estado) ? { comentarioCancelacion } : {})
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPedidos(prevPedidos =>
                prevPedidos.map(pedido =>
                    pedido.id === id
                        ? {
                            ...pedido,
                            estado,
                            comentarioCancelacion: ["cancelado", "rechazado"].includes(estado) ? comentarioCancelacion : null
                        }
                        : pedido
                )
            );

        } catch (error: any) {

            console.error(
                "Error al actualizar pedido:",
                error
            );

            setError(
                error.response?.data?.message ||
                "No se pudo actualizar el pedido"
            );

        } finally {

            setActualizando(null);

        }
    };

    // ==========================================
    // OBTENER ANUNCIOS
    // ==========================================

    const obtenerAnuncios = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/anuncio`
            );

            if (Array.isArray(response.data)) {

                setAnuncios(response.data);

            } else {

                setAnuncios([]);

            }

        } catch (error) {

            console.error(
                "Error al obtener anuncios:",
                error
            );

            setAnuncios([]);

        }
    };

    // ==========================================
    // SELECCIONAR IMAGEN ANUNCIO
    // ==========================================

    const seleccionarImagen = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const archivo = e.target.files?.[0];

        if (!archivo) {
            return;
        }

        if (!archivo.type.startsWith("image/")) {

            alert(
                "Selecciona un archivo de imagen válido"
            );

            return;
        }

        setImagenSeleccionada(archivo);

        const url = URL.createObjectURL(archivo);

        setPreview(url);
    };

    // ==========================================
    // AGREGAR ANUNCIO
    // ==========================================

    const agregarAnuncio = async () => {

        if (!imagenSeleccionada) {

            alert(
                "Primero selecciona una imagen"
            );

            return;
        }

        try {

            setSubiendoAnuncio(true);

            const reader = new FileReader();

            reader.onloadend = async () => {

                try {

                    const imagenBase64 = reader.result;

                    await axios.post(
                        `${API_URL}/anuncio`,
                        {
                            img: imagenBase64
                        }
                    );

                    setImagenSeleccionada(null);
                    setPreview("");

                    await obtenerAnuncios();

                    alert(
                        "Anuncio agregado correctamente"
                    );

                } catch (error: any) {

                    console.error(
                        "Error al crear anuncio:",
                        error
                    );

                    alert(
                        error.response?.data?.message ||
                        "No se pudo agregar el anuncio"
                    );

                } finally {

                    setSubiendoAnuncio(false);

                }
            };

            reader.readAsDataURL(
                imagenSeleccionada
            );

        } catch (error) {

            console.error(
                "Error procesando imagen:",
                error
            );

            setSubiendoAnuncio(false);
        }
    };

    // ==========================================
    // ELIMINAR ANUNCIO
    // ==========================================

    const eliminarAnuncio = async (
        id: number
    ) => {

        const confirmar = window.confirm(
            "¿Estás seguro de que quieres eliminar este anuncio?"
        );

        if (!confirmar) {
            return;
        }

        try {

            setEliminandoAnuncio(id);

            await axios.delete(
                `${API_URL}/anuncio/${id}`
            );

            setAnuncios(prevAnuncios =>
                prevAnuncios.filter(
                    anuncio =>
                        anuncio.id !== id
                )
            );

        } catch (error: any) {

            console.error(
                "Error al eliminar anuncio:",
                error
            );

            alert(
                error.response?.data?.message ||
                "No se pudo eliminar el anuncio"
            );

        } finally {

            setEliminandoAnuncio(null);

        }
    };

    // ==========================================
    // URL DEL COMPROBANTE
    // ==========================================

    const obtenerUrlComprobante = (
        comprobante: string
    ) => {

        if (
            comprobante.startsWith("http://") ||
            comprobante.startsWith("https://")
        ) {
            return comprobante;
        }

        if (comprobante.startsWith("/")) {
            return `http://localhost:3000${comprobante}`;
        }

        return `http://localhost:3000/uploads/comprobantes/${comprobante}`;
    };

    // ==========================================
    // FORMATEAR FECHA
    // ==========================================

    const formatearFecha = (
        fecha?: string
    ) => {

        if (!fecha) {
            return "Sin fecha";
        }

        return new Date(fecha).toLocaleString(
            "es-CO",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };

    // ==========================================
    // CARGAR AL ENTRAR
    // ==========================================

    useEffect(() => {

        obtenerPedidos();
        obtenerAnuncios();
        obtenerPromociones();

    }, []);

    // ==========================================
    // CARGANDO
    // ==========================================

    if (cargando) {

        return (

            <div className="admin">

                <div className="admin-loading">

                    <h1>
                        Panel de administración
                    </h1>

                    <p>
                        Cargando pedidos...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="admin">

            {/* =====================================
                HEADER
            ====================================== */}

            <header className="admin-header">

                <div>

                    <h1>
                        Panel de administración
                    </h1>

                    <p>
                        Gestión de pedidos y anuncios
                    </p>

                </div>

                <button
                    className="admin-refresh"
                    onClick={() => {
                        obtenerPedidos();
                        obtenerAnuncios();
                        obtenerPromociones();
                    }}
                >
                    Actualizar
                </button>

                <Link className="admin-refresh" to="/admin/colonias">
                    Colonias
                </Link>

            </header>

            {/* =====================================
                ERROR
            ====================================== */}

            {error && (

                <div className="admin-error">
                    {error}
                </div>

            )}

            {/* =====================================
                ESTADÍSTICAS
            ====================================== */}

            <section className="admin-stats">

                <div className="admin-stat">

                    <span>
                        {verHistoricos
                            ? "Total pedidos"
                            : "Pedidos de hoy"
                        }
                    </span>

                    <strong>
                        {pedidosMostrados.length}
                    </strong>

                </div>

                <div className="admin-stat">

                    <span>
                        Pendientes
                    </span>

                    <strong>
                        {
                            pedidosMostrados.filter(
                                pedido =>
                                    pedido.estado ===
                                    "pendiente"
                            ).length
                        }
                    </strong>

                </div>

                <div className="admin-stat">

                    <span>
                        Pagados
                    </span>

                    <strong>
                        {
                            pedidosMostrados.filter(
                                pedido =>
                                    pedido.estado ===
                                    "pagado"
                            ).length
                        }
                    </strong>

                </div>

                <div className="admin-stat">

                    <span>
                        Rechazados
                    </span>

                    <strong>
                        {
                            pedidosMostrados.filter(
                                pedido =>
                                    pedido.estado ===
                                    "rechazado"
                            ).length
                        }
                    </strong>

                </div>

            </section>

            <section className="admin-promociones">
                <div className="admin-title">
                    <div>
                        <h2>Promociones</h2>
                        <span>Precios dinámicos para catálogo, carrito y pedidos.</span>
                    </div>
                </div>
                <form className="promocion-form" onSubmit={guardarPromocion}>
                    <input required placeholder="Nombre" value={formPromocion.nombre} onChange={(e) => setFormPromocion({ ...formPromocion, nombre: e.target.value })} />
                    <select value={formPromocion.tipo} onChange={(e) => setFormPromocion({ ...formPromocion, tipo: e.target.value as Promocion["tipo"] })}>
                        <option value="PORCENTAJE">PORCENTAJE</option><option value="MONTO">MONTO</option><option value="2X1">2X1</option><option value="3X2">3X2</option>
                    </select>
                    {!(["2X1", "3X2"] as string[]).includes(formPromocion.tipo) && <input required type="number" min="1" value={formPromocion.valor} onChange={(e) => setFormPromocion({ ...formPromocion, valor: e.target.value })} />}
                    <select value={formPromocion.genero} onChange={(e) => setFormPromocion({ ...formPromocion, genero: e.target.value as Promocion["genero"] })}><option>TODOS</option><option>HOMBRE</option><option>MUJER</option></select>
                    <input required type="date" value={formPromocion.fechaInicio} onChange={(e) => setFormPromocion({ ...formPromocion, fechaInicio: e.target.value })} />
                    <input required type="date" value={formPromocion.fechaFin} onChange={(e) => setFormPromocion({ ...formPromocion, fechaFin: e.target.value })} />
                    <input type="number" min="0" placeholder="Prioridad" value={formPromocion.prioridad} onChange={(e) => setFormPromocion({ ...formPromocion, prioridad: e.target.value })} />
                    <button className="admin-refresh" type="submit">{promocionEditando ? "Actualizar" : "Crear"}</button>
                    {promocionEditando && <button type="button" onClick={() => setPromocionEditando(null)}>Cancelar</button>}
                </form>
                <div className="promociones-lista">
                    {promociones.map((promocion) => <article className="promocion-row" key={promocion.id}>
                        <strong>{promocion.nombre}</strong><span>{promocion.tipo}{promocion.tipo === "PORCENTAJE" ? ` ${promocion.valor}%` : ""}</span><span>{promocion.genero}</span><span>{promocion.fechaInicio} a {promocion.fechaFin}</span><span>{promocion.activa ? "ACTIVA" : "INACTIVA"}</span>
                        <button type="button" onClick={() => cambiarEstadoPromocion(promocion)}>{promocion.activa ? "Desactivar" : "Activar"}</button>
                        <button type="button" onClick={() => { setPromocionEditando(promocion.id); setFormPromocion({ nombre: promocion.nombre, tipo: promocion.tipo, valor: String(promocion.valor), genero: promocion.genero, fechaInicio: promocion.fechaInicio, fechaFin: promocion.fechaFin, prioridad: String(promocion.prioridad), activa: promocion.activa }); }}>Editar</button>
                        <button type="button" onClick={() => eliminarPromocion(promocion.id)}>Eliminar</button>
                    </article>)}
                </div>
            </section>

            {/* =====================================
                ANUNCIOS
            ====================================== */}

            <section className="admin-anuncios">

                <div className="admin-title">

                    <div>

                        <h2>
                            Anuncios
                        </h2>

                        <span>
                            Administra las imágenes que aparecen
                            en la página principal.
                        </span>

                    </div>

                </div>

                <div className="anuncio-form">

                    <label htmlFor="imagen-anuncio">
                        Seleccionar imagen
                    </label>

                    <input
                        id="imagen-anuncio"
                        type="file"
                        accept="image/*"
                        onChange={seleccionarImagen}
                    />

                    {preview && (

                        <div className="anuncio-preview">

                            <p>
                                Vista previa
                            </p>

                            <img
                                src={preview}
                                alt="Vista previa del anuncio"
                            />

                        </div>

                    )}

                    <button
                        className="btn-agregar-anuncio"
                        onClick={agregarAnuncio}
                        disabled={
                            !imagenSeleccionada ||
                            subiendoAnuncio
                        }
                    >
                        {subiendoAnuncio
                            ? "Subiendo..."
                            : "Agregar anuncio"
                        }
                    </button>

                </div>

                <div className="anuncios-admin-lista">

                    <h3>
                        Anuncios publicados
                    </h3>

                    {anuncios.length === 0 ? (

                        <div className="admin-empty">

                            <h2>
                                No hay anuncios
                            </h2>

                            <p>
                                Cuando agregues una imagen
                                aparecerá aquí.
                            </p>

                        </div>

                    ) : (

                        <div className="anuncios-grid">

                            {anuncios.map(anuncio => (

                                <div
                                    className="anuncio-admin-card"
                                    key={anuncio.id}
                                >

                                    <img
                                        src={obtenerUrlImagen(anuncio.img)}
                                        alt="Anuncio"
                                    />

                                    <button
                                        className="btn-eliminar-anuncio"
                                        onClick={() =>
                                            eliminarAnuncio(
                                                anuncio.id
                                            )
                                        }
                                        disabled={
                                            eliminandoAnuncio ===
                                            anuncio.id
                                        }
                                    >
                                        {eliminandoAnuncio ===
                                        anuncio.id
                                            ? "Eliminando..."
                                            : "Eliminar"
                                        }
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </section>

            {/* =====================================
                PEDIDOS
            ====================================== */}

            <main className="admin-pedidos">

                <div className="admin-title">

                    <div>

                        <h2>
                            {verHistoricos
                                ? "Historial de pedidos"
                                : "Pedidos de hoy"
                            }
                        </h2>

                        <span>
                            {pedidosMostrados.length} pedidos
                        </span>

                    </div>

                    {/* =================================
                        BOTÓN HISTÓRICOS
                    ================================== */}

                    <button
                        className="admin-refresh"
                        onClick={() =>
                            setVerHistoricos(
                                !verHistoricos
                            )
                        }
                    >
                        {verHistoricos
                            ? "Ver pedidos de hoy"
                            : "Ver históricos"
                        }
                    </button>

                </div>

                {pedidosMostrados.length === 0 ? (

                    <div className="admin-empty">

                        <h2>
                            {verHistoricos
                                ? "No hay pedidos registrados"
                                : "No hay pedidos de hoy"
                            }
                        </h2>

                        <p>
                            {verHistoricos
                                ? "Todavía no existen pedidos en el sistema."
                                : "Cuando un cliente realice una compra hoy aparecerá aquí."
                            }
                        </p>

                    </div>

                ) : (

                    <div className="pedidos-lista">

                        {pedidosMostrados.map(pedido => (

                            <article
                                className="pedido-card"
                                key={pedido.id}
                            >

                                {/* =================================
                                    CABECERA PEDIDO
                                ================================== */}

                                <div className="pedido-header">

                                    <div>

                                        <h3>
                                            Pedido
                                        </h3>

                                        <small>
                                            {pedido.id}
                                        </small>

                                        <small>
                                            {formatearFecha(
                                                pedido.createdAt
                                            )}
                                        </small>

                                    </div>

                                    <span
                                        className={`estado estado-${pedido.estado}`}
                                    >
                                        {pedido.estado}
                                    </span>

                                </div>

                                {/* =================================
                                    CLIENTE
                                ================================== */}

                                <div className="pedido-cliente">

                                    <p>

                                        <strong>
                                            Cliente:
                                        </strong>{" "}

                                        {pedido.nombre ||
                                            "No registrado"}

                                    </p>

                                    <p>

                                        <strong>
                                            Correo:
                                        </strong>{" "}

                                        {pedido.email}

                                    </p>

                                    <p>

                                        <strong>
                                            Teléfono:
                                        </strong>{" "}

                                        {pedido.telefono ||
                                            "No registrado"}

                                    </p>

                                    <p>

                                        <strong>
                                            Dirección:
                                        </strong>{" "}

                                        {pedido.direccion ||
                                            "No registrada"}

                                    </p>

                                    <p>

                                        <strong>
                                            Ciudad:
                                        </strong>{" "}

                                        {pedido.ciudad ||
                                            "No registrada"}

                                    </p>

                                    {pedido.referencia && (

                                        <p>

                                            <strong>
                                                Referencia:
                                            </strong>{" "}

                                            {pedido.referencia}

                                        </p>

                                    )}

                                </div>

                                {/* =================================
                                    COMPROBANTE
                                ================================== */}

                                {pedido.comprobante && (

                                    <div className="pedido-comprobante">

                                        <h4>
                                            Comprobante de pago
                                        </h4>

                                        <img
                                            src={obtenerUrlComprobante(
                                                pedido.comprobante
                                            )}
                                            alt="Comprobante de pago"
                                            className="comprobante-imagen"
                                            onClick={() =>
                                                setComprobanteSeleccionado(
                                                    obtenerUrlComprobante(
                                                        pedido.comprobante!
                                                    )
                                                )
                                            }
                                        />

                                        <p>
                                            Haz clic en la imagen
                                            para verla completa.
                                        </p>

                                    </div>

                                )}

                                {pedido.comentarioCancelacion && (
                                    <div className="pedido-cancelacion"><strong>Motivo del rechazo/cancelación:</strong> {pedido.comentarioCancelacion}</div>
                                )}

                                {/* =================================
                                    PRODUCTOS
                                ================================== */}

                                <div className="pedido-productos">

                                    <h4>
                                        Productos
                                    </h4>

                                    {pedido.items?.map(
                                        item => (

                                            <div
                                                className="pedido-producto"
                                                key={item.id}
                                            >

                                                <img
                                                    src={obtenerUrlImagen(item.imagenProducto || item.producto?.img || "")}
                                                    alt={
                                                        item.nombreProducto || item.producto?.nombre ||
                                                        "Producto"
                                                    }
                                                />

                                                <div>

                                                    <strong>

                                                        {item.nombreProducto || item.producto?.nombre || "Producto"}

                                                    </strong>

                                                    <p>

                                                        Cantidad:{" "}

                                                        {item.cantidad}

                                                    </p>

                                                    <p>

                                                        Precio: $

                                                        {Number(
                                                            item.precio ||
                                                            item.producto
                                                                ?.precio ||
                                                            0
                                                        ).toLocaleString(
                                                            "es-CO"
                                                        )}

                                                    </p>

                                                </div>

                                                <strong>

                                                    $

                                                    {(
                                                        Number(
                                                            item.precio ||
                                                            item.producto
                                                                ?.precio ||
                                                            0
                                                        ) *
                                                        Number(
                                                            item.cantidad
                                                        )
                                                    ).toLocaleString(
                                                        "es-CO"
                                                    )}

                                                </strong>

                                            </div>

                                        )
                                    )}

                                </div>

                                {/* =================================
                                    FOOTER
                                ================================== */}

                                <div className="pedido-footer">

                                    <div className="pedido-total">

                                        <span>
                                            Total
                                        </span>

                                        <strong>

                                            $

                                            {Number(
                                                pedido.total
                                            ).toLocaleString(
                                                "es-CO"
                                            )}

                                        </strong>

                                    </div>

                                    <div className="pedido-acciones">

                                        {/* PENDIENTE */}

                                        {pedido.estado ===
                                            "pendiente" && (

                                            <>

                                                <button
                                                    className="btn-confirmar"
                                                    disabled={
                                                        actualizando ===
                                                        pedido.id
                                                    }
                                                    onClick={() =>
                                                        cambiarEstado(
                                                            pedido.id,
                                                            "pagado"
                                                        )
                                                    }
                                                >

                                                    {actualizando ===
                                                    pedido.id
                                                        ? "Actualizando..."
                                                        : "Confirmar"
                                                    }

                                                </button>

                                                <button
                                                    className="btn-rechazar"
                                                    disabled={actualizando === pedido.id || !motivosRechazo[pedido.id]?.trim()}
                                                    onClick={() => cambiarEstado(pedido.id, "rechazado", motivosRechazo[pedido.id].trim())}
                                                >
                                                    Rechazar
                                                </button>

                                            </>

                                        )}

                                        {pedido.estado === "pendiente" && (
                                            <textarea
                                                className="motivo-rechazo-input"
                                                value={motivosRechazo[pedido.id] || ""}
                                                onChange={(event) => setMotivosRechazo((actuales) => ({ ...actuales, [pedido.id]: event.target.value }))}
                                                placeholder="Escribe el motivo del rechazo"
                                                rows={2}
                                                disabled={actualizando === pedido.id}
                                            />
                                        )}

                                        {pedido.estado === "pagado" && <button disabled={actualizando === pedido.id} onClick={() => cambiarEstado(pedido.id, "preparando")}>Preparando</button>}
                                        {pedido.estado === "preparando" && <button disabled={actualizando === pedido.id} onClick={() => cambiarEstado(pedido.id, "enviado")}>Marcar enviado</button>}
                                        {pedido.estado === "enviado" && <button disabled={actualizando === pedido.id} onClick={() => cambiarEstado(pedido.id, "entregado")}>Marcar entregado</button>}
                                        {!["cancelado", "rechazado", "entregado"].includes(pedido.estado) && <button className="btn-cancelar" disabled={actualizando === pedido.id} onClick={() => { const comentario = window.prompt("Indica por qué se cancela este pedido:"); if (comentario?.trim()) cambiarEstado(pedido.id, "cancelado", comentario.trim()); }}>Cancelar</button>}

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </main>

            {/* =====================================
                MODAL COMPROBANTE
            ====================================== */}

            {comprobanteSeleccionado && (

                <div
                    className="comprobante-modal"
                    onClick={() =>
                        setComprobanteSeleccionado(
                            null
                        )
                    }
                >

                    <div
                        className="comprobante-modal-contenido"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="comprobante-cerrar"
                            onClick={() =>
                                setComprobanteSeleccionado(
                                    null
                                )
                            }
                        >
                            ×
                        </button>

                        <img
                            src={
                                comprobanteSeleccionado
                            }
                            alt="Comprobante de pago"
                        />

                    </div>

                </div>

            )}

        </div>
    );
};

export default Admin;