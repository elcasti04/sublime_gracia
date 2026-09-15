import '../style/header.css'
import { useState } from 'react'
import Carrito from './carrito.tsx'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()

    const [abierto, setAbierto] = useState(false)
    const [carritoAbierto, setCarritoAbierto] = useState(false)

    return (

        <>
            <header className="header">

                <p
                    className="menu-toogle"
                    onClick={() => setAbierto(!abierto)}
                >
                    ☰
                </p>
                <h2 onClick={() => navigate('/')}>
                    Sublime Gracia
                </h2>

                <ul className={abierto ? "menu-abierto" : "menu"}>


                    <li onClick={() => navigate('/')}>Inicio</li>
                    <li onClick={() => navigate('/catalogo')}>Catálogo</li>
                    <li onClick={() => navigate('/contacto')}>Contacto</li>
                    <li onClick={() => {
                        navigate('/#historia')
                        document.getElementById("historia")?.scrollIntoView({behavior: "smooth"})
                        }}>Historia</li>
                    <li>
                        <p
                        className="cart"
                        onClick={() => setCarritoAbierto(true)}
                        >
                            🛍
                        </p>
                    </li>

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