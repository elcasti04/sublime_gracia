import "../style/footer.css"
import { useNavigate } from "react-router-dom"

const Footer = () => {
    const navigate = useNavigate()
    return (
        <footer className="footer">

            <div className="footer-contenido">

                <div className="footer-marca">
                    <h2>
                        SUBLIME <span>GRACIA</span>
                    </h2>

                    <p>
                        El arte de una fragancia.
                        <br />
                        Una historia escrita en el aire.
                    </p>
                </div>


                <div className="footer-seccion">
                    <h3>Explorar</h3>

                    <a href="/">Inicio</a>
                    <a href="/catalogo">Catálogo</a>
                    <a href="/#historia">Historia</a>
                </div>


                <div className="footer-seccion">
                    <h3>Atención</h3>

                    <a href="/contacto">Contacto</a>
                    <a href={localStorage.getItem("ultimoPedidoId") ? `/seguimiento/${localStorage.getItem("ultimoPedidoId")}` : "/seguimiento"}>Envíos</a>
                </div>


                <div className="footer-seccion">
                    <h3>Seguimos conectados</h3>

                    <p>
                        Descubre nuevas fragancias
                        <br />
                        y novedades de nuestra colección.
                    </p>

                    <div className="footer-redes">
                        <a href="#">Instagram</a>
                        <a href="#">Facebook</a>
                    </div>
                </div>

            </div>


            <div className="footer-linea"></div>


            <div className="footer-bottom">

                <p>
                    © 2026 Sublime Gracia. Todos los derechos reservados.
                </p>

                <p 
                style={{cursor:'pointer'}}
                onClick={() => navigate('/login')}>
                    Administracion
                </p>

            </div>

        </footer>
    )
}

export default Footer