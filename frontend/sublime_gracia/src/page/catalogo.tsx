import axios from "axios"
import { useEffect, useState } from "react"
import '../style/catalogo.css'
import { obtenerUrlImagen } from "../utils/imageUrl"

interface Item {
    id: number
    nombre: string
    genero: string
    segmentacion: string
    descripcion: string
    precio: number
    img: string
    stock?: number | null
    activo?: boolean
    precioOriginal?: number
    precioFinal?: number
    descuento?: number
    porcentajeDescuento?: number
    tienePromocion?: boolean
    promocion?: { nombre: string; tipo: string } | null
    presentaciones?: Presentacion[]
}

interface Presentacion {
    id: number
    mililitros: number | null
    precio: number
    precioFinal?: number
    stock: number | null
    activo: boolean
    tienePromocion?: boolean
    porcentajeDescuento?: number
}

const Catalogo = () => {

    const [items, setItems] = useState<Item[]>([])
    const [todosLosItems, setTodosLosItems] = useState<Item[]>([])
    const [error, setError] = useState<string | null>(null)
    const [categoria, setCategoria] = useState("todo")
    const [genero, setGenero] = useState("todos")
    const [presentacionSeleccionada, setPresentacionSeleccionada] = useState<Record<number, number>>({})

    const API_URL = "http://localhost:3000/api"

    useEffect(() => {

        axios.get(`${API_URL}/catalogo`)
            .then((res) => {
                setItems(res.data)
                setTodosLosItems(res.data)
            })
            .catch((error) => {
                setError(error.message)
            })

    }, [])

    const aplicarFiltros = (nuevaCategoria: string, nuevoGenero: string) => {
        const productosFiltrados = todosLosItems.filter((item) => {
            const coincideCategoria = nuevaCategoria === "todo" || item.segmentacion === nuevaCategoria
            const generoProducto = item.genero.trim().toUpperCase()
            const coincideGenero = nuevoGenero === "todos" || generoProducto === nuevoGenero
            return coincideCategoria && coincideGenero
        })

        setItems(productosFiltrados)
    }

    const obtenerCategoria = (seg: string) => {
        setCategoria(seg)
        aplicarFiltros(seg, genero)
    }

    const obtenerGenero = (nuevoGenero: string) => {
        setGenero(nuevoGenero)
        aplicarFiltros(categoria, nuevoGenero)
    }

const agregarAlCarrito = async (productId: number, presentacionId?: number) => {

    try {

        const res = await axios.post(
            `${API_URL}/cart/items`,
            {
                productId: productId,
                presentacionId,
                quantity: 1
            },
            {
                withCredentials: true
            }
        )

        console.log(res.data)

        setError(null)

    } catch (error: any) {

        console.error(error)

        setError(
            error.response?.data?.message ||
            "No se pudo agregar el producto al carrito"
        )
    }
}

    const categorias = [
        ...new Set(
            todosLosItems.map((item) => item.segmentacion)
        )
    ]

    return (
        <div className="catalogo">
                
            <h1>Nuestras Fragancias</h1>

            <div className="categorias">

                <button
                    className={`categoria ${categoria === "todo" ? "activa" : ""}`}
                    onClick={() => obtenerCategoria("todo")}
                >
                    Todos
                </button>

                {categorias.map((cat) => (
                    <button
                        key={cat}
                        className={`categoria ${categoria === cat ? "activa" : ""}`}
                        onClick={() => obtenerCategoria(cat)}
                    >
                        {cat}
                    </button>
                ))}

            </div>

            <div className="categorias filtros-genero">
                <button
                    className={`categoria ${genero === "todos" ? "activa" : ""}`}
                    onClick={() => obtenerGenero("todos")}
                >
                    Todos los géneros
                </button>

                {(["HOMBRE", "MUJER", "UNISEX"] as const).map((opcion) => (
                    <button
                        key={opcion}
                        className={`categoria ${genero === opcion ? "activa" : ""}`}
                        onClick={() => obtenerGenero(opcion)}
                    >
                        {opcion}
                    </button>
                ))}
            </div>
            
            {error && (
                <p className="error">{error}</p>
            )}

            <div className="productos">
        
                {items.map((item) => (
                
                    <article className="producto" key={item.id}>
                    
                        <div
                            className="producto-imagen"
                            style={{
                                backgroundImage: `url(${obtenerUrlImagen(item.img)})`
                            }}
                        >
                        
                            <span className="etiqueta">
                                Destacado
                            </span>
                        
                            <span className="segmento">
                                {item.segmentacion}
                            </span>
                        
                        </div>
                        
                        <div className="producto-info">
                        
                            <p className="tipo">
                                {item.genero} · 30 ML
                            </p>
                        
                            <h2>
                                {item.nombre}
                            </h2>
                        
                            <p className="descripcion">
                                {item.descripcion}
                            </p>
                        
                            <div className="producto-presentaciones">
                                {(item.presentaciones || []).filter((presentacion) => presentacion.activo).map((presentacion) => (
                                    <button
                                        type="button"
                                        key={presentacion.id}
                                        className={presentacionSeleccionada[item.id] === presentacion.id ? "presentacion-activa" : ""}
                                        onClick={() => setPresentacionSeleccionada((actual) => ({ ...actual, [item.id]: presentacion.id }))}
                                    >
                                        {presentacion.mililitros ? `${presentacion.mililitros} ml` : "Estándar"}
                                    </button>
                                ))}
                            </div>

                            <div className="producto-footer">
                        
                                <div className="precio">
                                    {(() => {
                                        const presentacion = (item.presentaciones || []).find((itemPresentacion) => itemPresentacion.id === presentacionSeleccionada[item.id]) || (item.presentaciones || []).find((itemPresentacion) => itemPresentacion.activo);
                                        const precio = presentacion?.precio ?? item.precio;
                                        const precioFinal = presentacion?.precioFinal ?? presentacion?.precio ?? item.precioFinal ?? item.precio;
                                        const tienePromocion = presentacion?.tienePromocion ?? item.tienePromocion;
                                        return tienePromocion ? (
                                        <>
                                            <span className="precio-original">
                                                ${Number(precio).toLocaleString("es-CO")}
                                            </span>
                                            <span className="precio-promocional">
                                                ${Number(precioFinal).toLocaleString("es-CO")}
                                            </span>
                                            <small>{Math.round(presentacion?.porcentajeDescuento ?? item.porcentajeDescuento ?? 0)}% OFF</small>
                                        </>
                                        ) : `$${Number(precioFinal).toLocaleString("es-CO")}`;
                                    })()}
                                </div>
                        
                                {(() => {
                                    const presentacion = (item.presentaciones || []).find((itemPresentacion) => itemPresentacion.id === presentacionSeleccionada[item.id]) || (item.presentaciones || []).find((itemPresentacion) => itemPresentacion.activo);
                                    return (presentacion?.stock === 0 || (!presentacion && item.stock === 0)) ? (
                                    <span className="agotado">Agotado</span>
                                ) : (
                                    <button
                                        className="detalles"
                                        type="button"
                                        onClick={() => agregarAlCarrito(item.id, presentacion?.id)}>
                                        Agregar
                                    </button>
                                );
                                })()}
                                
                                
                        
                            </div>
                        
                        </div>
                        
                    </article>

                ))}

            </div>
            
        </div>
    )
}

export default Catalogo