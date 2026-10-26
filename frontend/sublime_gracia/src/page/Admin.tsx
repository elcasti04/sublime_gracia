import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../style/admin.css";
import { marcarImagenNoDisponible, obtenerUrlImagen } from "../utils/imageUrl";

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

type DashboardPeriod = "7" | "30" | "90" | "all";
type DashboardMetric = "units" | "revenue";

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
    const [periodoDashboard, setPeriodoDashboard] = useState<DashboardPeriod>("30");
    const [metricaDashboard, setMetricaDashboard] = useState<DashboardMetric>("units");
    const [limiteDashboard, setLimiteDashboard] = useState(5);
    const [fechaActual] = useState(() => Date.now());

    // ==========================================
    // COMPROBANTE
    // ==========================================

    const [comprobanteSeleccionado, setComprobanteSeleccionado] =
        useState<string | null>(null);

    const API_URL = `${import.meta.env.VITE_API_URL}/api`;

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

    const productosMasVendidos = useMemo(() => {
        const fechaLimite = fechaActual - Number(periodoDashboard) * 24 * 60 * 60 * 1000;
        const ventasPorProducto = new Map<number, {
            productId: number;
            nombre: string;
            unidades: number;
            ingresos: number;
        }>();
        const estadosContabilizados: Pedido["estado"][] = ["pagado", "preparando", "enviado", "entregado"];

        pedidos.forEach((pedido) => {
            if (!estadosContabilizados.includes(pedido.estado)) return;
            if (periodoDashboard !== "all") {
                const fechaPedido = pedido.createdAt ? new Date(pedido.createdAt).getTime() : NaN;
                if (!Number.isFinite(fechaPedido) || fechaPedido < fechaLimite) return;
            }

            pedido.items?.forEach((item) => {
                const productId = Number(item.productId);
                const unidades = Number(item.cantidad);
                if (!Number.isInteger(productId) || !Number.isFinite(unidades) || unidades <= 0) return;

                const producto = ventasPorProducto.get(productId) || {
                    productId,
                    nombre: item.nombreProducto || item.producto?.nombre || `Producto ${productId}`,
                    unidades: 0,
                    ingresos: 0
                };
                producto.unidades += unidades;
                producto.ingresos += Number(item.precio || 0) * unidades;
                ventasPorProducto.set(productId, producto);
            });
        });

        return Array.from(ventasPorProducto.values())
            .sort((a, b) => {
                const diferencia = metricaDashboard === "units"
                    ? b.unidades - a.unidades
                    : b.ingresos - a.ingresos;
                return diferencia || a.nombre.localeCompare(b.nombre, "es");
            })
            .slice(0, limiteDashboard);
    }, [pedidos, periodoDashboard, metricaDashboard, limiteDashboard, fechaActual]);

    const maximoMetricaDashboard = Math.max(
        ...productosMasVendidos.map((producto) =>
            metricaDashboard === "units" ? producto.unidades : producto.ingresos
        ),
        0
    );

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
    // URL DEL COMPROBANTE
    // ==========================================

    const obtenerUrlComprobante = (
        comprobante: string
    ) => {

        const comprobanteNormalizado = comprobante.replace(/^https\/\//i, "https://");

        if (
            comprobanteNormalizado.startsWith("http://") ||
            comprobanteNormalizado.startsWith("https://")
        ) {
            return comprobanteNormalizado;
        }

        const apiOrigin = API_URL.replace(/\/api\/?$/, "");

        if (comprobante.startsWith("/")) {
            return `${apiOrigin}${comprobante}`;
        }

        return `${apiOrigin}/uploads/comprobantes/${comprobante}`;
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
                        Gestión de pedidos
                    </p>

                </div>

                <button
                    className="admin-refresh"
                    onClick={obtenerPedidos}
                >
                    Actualizar
                </button>

                <Link className="admin-refresh" to="/admin/colonias">
                    Colonias
                </Link>
                <Link className="admin-refresh" to="/admin/promos">
                    Prom. & Anuncios
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

            <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
                <div className="admin-dashboard-header">
                    <div>
                        <h2 id="admin-dashboard-title">Productos más vendidos</h2>
                        <p>Ventas de pedidos pagados o en proceso de entrega. Los gráficos se actualizan al cambiar filtros o actualizar los pedidos.</p>
                    </div>
                    <div className="admin-dashboard-controls">
                        <label>
                            Periodo
                            <select
                                value={periodoDashboard}
                                onChange={(event) => setPeriodoDashboard(event.target.value as DashboardPeriod)}
                            >
                                <option value="7">Últimos 7 días</option>
                                <option value="30">Últimos 30 días</option>
                                <option value="90">Últimos 90 días</option>
                                <option value="all">Todo el historial</option>
                            </select>
                        </label>
                        <label>
                            Mostrar
                            <select
                                value={limiteDashboard}
                                onChange={(event) => setLimiteDashboard(Number(event.target.value))}
                            >
                                <option value={5}>Top 5</option>
                                <option value={10}>Top 10</option>
                                <option value={15}>Top 15</option>
                            </select>
                        </label>
                        <label>
                            Métrica
                            <select
                                value={metricaDashboard}
                                onChange={(event) => setMetricaDashboard(event.target.value as DashboardMetric)}
                            >
                                <option value="units">Unidades vendidas</option>
                                <option value="revenue">Ingresos</option>
                            </select>
                        </label>
                    </div>
                </div>

                {productosMasVendidos.length === 0 ? (
                    <p className="admin-dashboard-empty">
                        No hay ventas confirmadas en este periodo. Los pedidos pendientes, rechazados y cancelados no se incluyen.
                    </p>
                ) : (
                    <ol className="admin-sales-chart">
                        {productosMasVendidos.map((producto, index) => {
                            const valor = metricaDashboard === "units" ? producto.unidades : producto.ingresos;
                            const ancho = maximoMetricaDashboard > 0 ? (valor / maximoMetricaDashboard) * 100 : 0;
                            const valorFormateado = metricaDashboard === "units"
                                ? `${producto.unidades.toLocaleString("es-CO")} ${producto.unidades === 1 ? "unidad" : "unidades"}`
                                : `$${producto.ingresos.toLocaleString("es-CO")}`;

                            return (
                                <li className="admin-sales-row" key={producto.productId}>
                                    <div className="admin-sales-label">
                                        <span className="admin-sales-rank">{index + 1}</span>
                                        <strong title={producto.nombre}>{producto.nombre}</strong>
                                        <span>{valorFormateado}</span>
                                    </div>
                                    <div
                                        className="admin-sales-track"
                                        role="progressbar"
                                        aria-label={`${producto.nombre}: ${valorFormateado}`}
                                        aria-valuemin={0}
                                        aria-valuemax={maximoMetricaDashboard}
                                        aria-valuenow={valor}
                                    >
                                        <div className="admin-sales-bar" style={{ width: `${ancho}%` }} />
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
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
                                                    onError={marcarImagenNoDisponible}
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