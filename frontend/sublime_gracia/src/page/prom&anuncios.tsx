import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { obtenerUrlImagen } from "../utils/imageUrl";
import { Link } from "react-router-dom";

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

const PromAnuncios = () => {
    const API_URL = `${import.meta.env.VITE_API_URL}/api`;
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [subiendoAnuncio, setSubiendoAnuncio] = useState(false);
    const [eliminandoAnuncio, setEliminandoAnuncio] = useState<number | null>(null);

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

    const obtenerAnuncios = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/anuncio`);
            setAnuncios(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al obtener anuncios:", error);
            setAnuncios([]);
        }
    }, [API_URL]);

    useEffect(() => {
        let cancelado = false;

        const cargarAnuncios = async () => {
            try {
                const response = await axios.get(`${API_URL}/anuncio`);
                if (!cancelado) {
                    setAnuncios(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error) {
                console.error("Error al obtener anuncios:", error);
                if (!cancelado) {
                    setAnuncios([]);
                }
            }
        };

        const cargarPromociones = async () => {
            try {
                const response = await axios.get(`${API_URL}/promociones`);
                if (!cancelado) {
                    setPromociones(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error: any) {
                if (!cancelado) {
                    setError(error.response?.data?.message || "No se pudieron cargar las promociones");
                }
            }
        };

        void cargarAnuncios();
        void cargarPromociones();

        return () => {
            cancelado = true;
        };
    }, [API_URL, refreshKey]);

    const guardarPromocion = async (event: FormEvent<HTMLFormElement>) => {
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
            setFormPromocion({
                nombre: "",
                tipo: "PORCENTAJE",
                valor: "20",
                genero: "TODOS",
                fechaInicio: "",
                fechaFin: "",
                prioridad: "0",
                activa: true
            });
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo guardar la promocion");
        }
    };

    const cambiarEstadoPromocion = async (promocion: Promocion) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${API_URL}/promociones/${promocion.id}/estado`,
                { activa: !promocion.activa },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPromociones((prev) => prev.map((item) =>
                item.id === promocion.id ? { ...item, activa: !item.activa } : item
            ));
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo cambiar el estado");
        }
    };

    const eliminarPromocion = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/promociones/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPromociones((prev) => prev.filter((item) => item.id !== id));
        } catch (error: any) {
            setError(error.response?.data?.message || "No se pudo eliminar la promocion");
        }
    };

    const seleccionarImagen = (event: ChangeEvent<HTMLInputElement>) => {
        const archivo = event.target.files?.[0];
        if (!archivo) {
            return;
        }
        if (!archivo.type.startsWith("image/")) {
            alert("Selecciona un archivo de imagen válido");
            return;
        }
        setImagenSeleccionada(archivo);
        setPreview(URL.createObjectURL(archivo));
    };

    const agregarAnuncio = async () => {
        if (!imagenSeleccionada) {
            alert("Primero selecciona una imagen");
            return;
        }

        try {
            setSubiendoAnuncio(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await axios.post(`${API_URL}/anuncio`, { img: reader.result });
                    setImagenSeleccionada(null);
                    setPreview("");
                    await obtenerAnuncios();
                    alert("Anuncio agregado correctamente");
                } catch (error: any) {
                    console.error("Error al crear anuncio:", error);
                    alert(error.response?.data?.message || "No se pudo agregar el anuncio");
                } finally {
                    setSubiendoAnuncio(false);
                }
            };
            reader.readAsDataURL(imagenSeleccionada);
        } catch (error) {
            console.error("Error procesando imagen:", error);
            setSubiendoAnuncio(false);
        }
    };

    const eliminarAnuncio = async (id: number) => {
        const confirmar = window.confirm("¿Estás seguro de que quieres eliminar este anuncio?");
        if (!confirmar) {
            return;
        }

        try {
            setEliminandoAnuncio(id);
            await axios.delete(`${API_URL}/anuncio/${id}`);
            setAnuncios((prevAnuncios) => prevAnuncios.filter((anuncio) => anuncio.id !== id));
        } catch (error: any) {
            console.error("Error al eliminar anuncio:", error);
            alert(error.response?.data?.message || "No se pudo eliminar el anuncio");
        } finally {
            setEliminandoAnuncio(null);
        }
    };

    return (
        <div className="admin">
            <header className="admin-header">
                <div>
                    <h1>Promociones y anuncios</h1>
                    <p>Administra las promociones y las imágenes de la página principal.</p>
                </div>
                <button className="admin-refresh" type="button" onClick={() => setRefreshKey((value) => value + 1)}>
                    Actualizar
                </button>
                <Link className="admin-refresh" to="/admin">
                    Panel principal
                </Link>
            </header>

            {error && <div className="admin-error">{error}</div>}

            <section className="admin-promociones">
                <div className="admin-title">
                    <div>
                        <h2>Promociones</h2>
                        <span>Precios dinámicos para catálogo, carrito y pedidos.</span>
                    </div>
                </div>
                <form className="promocion-form" onSubmit={guardarPromocion}>
                    <input required placeholder="Nombre" value={formPromocion.nombre} onChange={(event) => setFormPromocion({ ...formPromocion, nombre: event.target.value })} />
                    <select value={formPromocion.tipo} onChange={(event) => setFormPromocion({ ...formPromocion, tipo: event.target.value as Promocion["tipo"] })}>
                        <option value="PORCENTAJE">PORCENTAJE</option><option value="MONTO">MONTO</option><option value="2X1">2X1</option><option value="3X2">3X2</option>
                    </select>
                    {!(["2X1", "3X2"] as string[]).includes(formPromocion.tipo) && <input required type="number" min="1" value={formPromocion.valor} onChange={(event) => setFormPromocion({ ...formPromocion, valor: event.target.value })} />}
                    <select value={formPromocion.genero} onChange={(event) => setFormPromocion({ ...formPromocion, genero: event.target.value as Promocion["genero"] })}><option>TODOS</option><option>HOMBRE</option><option>MUJER</option></select>
                    <input required type="date" value={formPromocion.fechaInicio} onChange={(event) => setFormPromocion({ ...formPromocion, fechaInicio: event.target.value })} />
                    <input required type="date" value={formPromocion.fechaFin} onChange={(event) => setFormPromocion({ ...formPromocion, fechaFin: event.target.value })} />
                    <input type="number" min="0" placeholder="Prioridad" value={formPromocion.prioridad} onChange={(event) => setFormPromocion({ ...formPromocion, prioridad: event.target.value })} />
                    <button className="admin-refresh" type="submit">{promocionEditando ? "Actualizar" : "Crear"}</button>
                    {promocionEditando && <button type="button" onClick={() => setPromocionEditando(null)}>Cancelar</button>}
                </form>
                <div className="promociones-lista">
                    {promociones.map((promocion) => (
                        <article className="promocion-row" key={promocion.id}>
                            <strong>{promocion.nombre}</strong>
                            <span>{promocion.tipo}{promocion.tipo === "PORCENTAJE" ? ` ${promocion.valor}%` : ""}</span>
                            <span>{promocion.genero}</span>
                            <span>{promocion.fechaInicio} a {promocion.fechaFin}</span>
                            <span>{promocion.activa ? "ACTIVA" : "INACTIVA"}</span>
                            <button type="button" onClick={() => cambiarEstadoPromocion(promocion)}>{promocion.activa ? "Desactivar" : "Activar"}</button>
                            <button type="button" onClick={() => {
                                setPromocionEditando(promocion.id);
                                setFormPromocion({
                                    nombre: promocion.nombre,
                                    tipo: promocion.tipo,
                                    valor: String(promocion.valor),
                                    genero: promocion.genero,
                                    fechaInicio: promocion.fechaInicio,
                                    fechaFin: promocion.fechaFin,
                                    prioridad: String(promocion.prioridad),
                                    activa: promocion.activa
                                });
                            }}>Editar</button>
                            <button type="button" onClick={() => eliminarPromocion(promocion.id)}>Eliminar</button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="admin-anuncios">
                <div className="admin-title">
                    <div>
                        <h2>Anuncios</h2>
                        <span>Administra las imágenes que aparecen en la página principal.</span>
                    </div>
                </div>
                <div className="anuncio-form">
                    <label htmlFor="imagen-anuncio">Seleccionar imagen</label>
                    <input id="imagen-anuncio" type="file" accept="image/*" onChange={seleccionarImagen} />
                    {preview && (
                        <div className="anuncio-preview">
                            <p>Vista previa</p>
                            <img src={preview} alt="Vista previa del anuncio" />
                        </div>
                    )}
                    <button
                        className="btn-agregar-anuncio"
                        onClick={agregarAnuncio}
                        disabled={!imagenSeleccionada || subiendoAnuncio}
                    >
                        {subiendoAnuncio ? "Subiendo..." : "Agregar anuncio"}
                    </button>
                </div>
                <div className="anuncios-admin-lista">
                    <h3>Anuncios publicados</h3>
                    {anuncios.length === 0 ? (
                        <div className="admin-empty">
                            <h2>No hay anuncios</h2>
                            <p>Cuando agregues una imagen aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div className="anuncios-grid">
                            {anuncios.map((anuncio) => (
                                <div className="anuncio-admin-card" key={anuncio.id}>
                                    <img src={obtenerUrlImagen(anuncio.img)} alt="Anuncio promocional de Sublime Gracia" />
                                    <button
                                        className="btn-eliminar-anuncio"
                                        onClick={() => eliminarAnuncio(anuncio.id)}
                                        disabled={eliminandoAnuncio === anuncio.id}
                                    >
                                        {eliminandoAnuncio === anuncio.id ? "Eliminando..." : "Eliminar"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PromAnuncios;