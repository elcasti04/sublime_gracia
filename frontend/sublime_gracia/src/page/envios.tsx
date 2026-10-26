import '../style/envios.css'
import { Link } from "react-router-dom"

const Envios = () => {

    return (
        <main className="envios">

            <section className="envios-contenido">

                <h1>Envíos y ubicación</h1>

                <p className="envios-intro">
                    En Sublime Gracia nos encontramos ubicados en
                    <strong> San Pedro, Sucre</strong>.
                    Realizamos entregas para que puedas recibir tus
                    productos de manera fácil y segura.
                </p>

                <p className="draft-notice">
                    Dirección física exacta pendiente de confirmación. La ubicación indicada es referencial.
                </p>

                <p className="draft-notice">
                    Dirección física exacta pendiente de confirmación. La ubicación indicada es referencial.
                </p>

                <p>
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=San+Pedro%2C+Sucre%2C+Colombia"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver mapa y obtener direcciones a San Pedro, Sucre
                    </a>
                </p>


                <div className="envios-tarjetas">

                    <article className="envio-card">

                        <div className="envio-icono">
                            📍
                        </div>

                        <h2>¿Dónde estamos?</h2>

                        <p>
                            Estamos ubicados en
                            <strong> San Pedro, Sucre</strong>.
                            Desde allí realizamos nuestros envíos
                            y entregas.
                        </p>

                    </article>


                    <article className="envio-card envio-gratis">

                        <div className="envio-icono">
                            🚚
                        </div>

                        <h2>Envíos gratis</h2>

                        <p>
                            Contamos con <strong>envíos gratis </strong>
                            dentro del pueblo de San Pedro, sus
                            corregimientos cercanos y veredas.
                        </p>

                    </article>


                    <article className="envio-card">

                        <div className="envio-icono">
                            📦
                        </div>

                        <h2>Otros destinos</h2>

                        <p>
                            Para destinos fuera de nuestra zona de
                            cobertura gratuita, el cliente deberá
                            asumir el costo del envío.
                        </p>

                    </article>

                </div>


                <section className="envio-importante">

                    <h2>Información importante</h2>

                    <p>
                        El valor del envío para destinos que no cuentan
                        con envío gratuito <strong>no está incluido en
                        el precio de los productos ni en el subtotal del carrito</strong>.
                    </p>

                    <p>
                        En estos casos, el costo del transporte deberá
                        ser pagado <strong>por separado del valor de la
                        compra</strong>.
                    </p>

                    <p>
                        Antes de pedir un pago adicional, te informaremos
                        el valor del transporte y el total actualizado
                        para que puedas decidir si continúas.
                    </p>

                </section>

                <p>
                    Consulta también las <Link to="/devoluciones">condiciones de cambios y devoluciones</Link> antes de completar tu compra.
                </p>


                <section className="envio-resumen">

                    <h2>En resumen</h2>

                    <div className="resumen-lista">

                        <div>
                            <span>✓</span>
                            <p>San Pedro, Sucre</p>
                        </div>

                        <div>
                            <span>✓</span>
                            <p>Corregimientos cercanos</p>
                        </div>

                        <div>
                            <span>✓</span>
                            <p>Veredas cercanas</p>
                        </div>

                        <div>
                            <span>💰</span>
                            <p>
                                Envío gratis en las zonas mencionadas
                            </p>
                        </div>

                        <div>
                            <span>📦</span>
                            <p>
                                Otros destinos: envío pagado por separado
                            </p>
                        </div>

                    </div>

                </section>
                <p>
                    Consulta también las <Link to="/devoluciones">condiciones de cambios y devoluciones</Link> antes de completar tu compra.
                </p>

            </section>

        </main>
    )
}

export default Envios
