import '../style/header.css'
import { useState } from 'react'
import Carrito from './carrito.tsx'
import { Link, useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()

    const [abierto, setAbierto] = useState(false)
    const [carritoAbierto, setCarritoAbierto] = useState(false)

    return (

        <>
            <header className="header">

                <button
                    type="button"
                    className="menu-toogle"
                    aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={abierto}
                    onClick={() => setAbierto(!abierto)}
                >
                    ☰
                </button>
                <button type="button" className="header-brand" aria-label="Sublime Gracia - Inicio" onClick={() => navigate('/')}>
                    Sublime Gracia
                </button>
                <button
                    type="button"
                    className="cart"
                    aria-label="Abrir carrito"
                    onClick={() => setCarritoAbierto(true)}
                >
                    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
                        <path d="M6 8h12l1 13H5L6 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                <ul className={abierto ? "menu-abierto" : "menu"}>


                    <li><Link to="/" onClick={() => setAbierto(false)}>Inicio</Link></li>
                    <li><Link to="/catalogo" onClick={() => setAbierto(false)}>Catálogo</Link></li>
                    <li><Link to="/envios" onClick={() => setAbierto(false)}>Envíos</Link></li>
                    <li><Link to="/contacto" onClick={() => setAbierto(false)}>Contacto</Link></li>
                </ul>


            </header>


            {carritoAbierto && (

                <div
                    className="carrito-overlay"
                    onClick={() => setCarritoAbierto(false)}
                >

                    <div
                        className="carrito-panel"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="cerrar-carrito"
                            type="button"
                            aria-label="Cerrar carrito"
                            onClick={() => setCarritoAbierto(false)}
                        >
                            ✕
                        </button>

                        <Carrito />

                    </div>

                </div>

            )}

        </>

    )
}

export default Header