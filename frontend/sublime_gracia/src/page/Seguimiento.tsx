import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "../style/seguimiento.css";
import { obtenerUrlImagen } from "../utils/imageUrl";
import Envios from "./envios";

type Estado = "pendiente" | "pagado" | "preparando" | "enviado" | "entregado" | "rechazado" | "cancelado";

interface PedidoItem {
    id: string;
    cantidad: number;
    precio: number;
    nombreProducto: string;
    imagenProducto?: string;
    mililitros?: number | null;
}

interface Pedido {
    id: string;
    nombre: string;
    total: number;
    estado: Estado;
    comentarioCancelacion?: string | null;
    createdAt?: string;
    items: PedidoItem[];
}

const estados: { id: Estado; titulo: string; detalle: string }[] = [
    { id: "pendiente", titulo: "Pago en revisión", detalle: "Estamos verificando tu comprobante." },
    { id: "pagado", titulo: "Pago aprobado", detalle: "Tu pedido fue confirmado." },
    { id: "preparando", titulo: "Preparando", detalle: "Estamos preparando tus productos." },
    { id: "enviado", titulo: "Enviado", detalle: "Tu pedido está en camino." },
    { id: "entregado", titulo: "Entregado", detalle: "El pedido fue entregado." }
];

const Seguimiento = () => {
    const { id: parametroId } = useParams();
    const id = parametroId || localStorage.getItem("ultimoPedidoId") || "";
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);
    const API_URL = `${import.meta.env.VITE_API_URL}/api`;

    useEffect(() => {
        const cargar = async () => {
            if (!id) {
                setError("Aún no tienes un pedido para consultar.");
                setCargando(false);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/pedidos/${id}`);
                setPedido(response.data);
                setError("");
            } catch (reason: any) {
                setError(reason.response?.data?.message || "No se pudo cargar el seguimiento");
            } finally {
                setCargando(false);
            }
        };

        cargar();
        const intervalo = window.setInterval(cargar, 15000);
        return () => window.clearInterval(intervalo);
    }, [id]);

    if (cargando) return <main className="seguimiento"><p>Cargando el estado de tu pedido...</p></main>;
    if (error || !pedido) return <main className="seguimiento"><section className="seguimiento-panel"><h1>No encontramos tu pedido</h1><p>{error}</p><Link to="/catalogo">Volver al catálogo</Link></section></main>;

    const cancelado = pedido.estado === "cancelado" || pedido.estado === "rechazado";
    const indiceActual = estados.findIndex((estado) => estado.id === pedido.estado);
    const descargarPdf = () => window.print();

    return (
        <main className="seguimiento">
            <section className="seguimiento-panel">
                <header className="seguimiento-header">
                    <div><span className="seguimiento-kicker">Seguimiento</span><h1>Pedido #{pedido.id.slice(0, 8).toUpperCase()}</h1><p>Hola, {pedido.nombre}. Aquí puedes consultar el avance de tu pedido.</p></div>
                    <div className="seguimiento-acciones">
                        <button type="button" className="seguimiento-pdf" onClick={descargarPdf}>Descargar PDF</button>
                        <Link to="/catalogo">Seguir comprando</Link>
                    </div>
                </header>

                {cancelado ? (
                    <div className="seguimiento-alerta cancelado"><strong>Pedido {pedido.estado === "rechazado" ? "rechazado" : "cancelado"}</strong><p>{pedido.comentarioCancelacion || "El pedido no continuará en proceso."}</p></div>
                ) : (
                    <div className="seguimiento-estados">
                        {estados.map((estado, index) => {
                            const activo = index <= indiceActual;
                            return <div className={`seguimiento-estado ${activo ? "activo" : ""} ${index === indiceActual ? "actual" : ""}`} key={estado.id}><span className="estado-punto">{activo ? "✓" : index + 1}</span><div><strong>{estado.titulo}</strong><p>{index === indiceActual ? estado.detalle : index < indiceActual ? "Completado" : "Pendiente"}</p></div></div>;
                        })}
                    </div>
                )}

                <div className="seguimiento-resumen"><div><span>Total</span><strong>${Number(pedido.total).toLocaleString("es-CO")}</strong></div><div><span>Fecha</span><strong>{pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString("es-CO") : "-"}</strong></div></div>
                <div className="seguimiento-productos"><h2>Productos</h2>{pedido.items?.map((item) => <div className="seguimiento-producto" key={item.id}><img src={obtenerUrlImagen(item.imagenProducto || "")} alt={item.nombreProducto} /><div><strong>{item.nombreProducto}</strong><span>{item.mililitros ? `${item.mililitros} ml` : "Presentación estándar"} · Cantidad: {item.cantidad}</span></div><strong>${Number(item.precio * item.cantidad).toLocaleString("es-CO")}</strong></div>)}</div>
            </section>
            <br />
            <hr />
            <Envios />
        </main>
    );
};

export default Seguimiento;