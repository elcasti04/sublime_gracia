import '../style/envios.css'

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
                        el precio de los productos</strong>.
                    </p>

                    <p>
                        En estos casos, el costo del transporte deberá
                        ser pagado <strong>por separado del valor de la
                        compra</strong>.
                    </p>

                    <p>
                        Antes de realizar el envío te informaremos el
                        valor correspondiente para que tengas claridad
                        sobre el costo total.
                    </p>

                </section>


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

            </section>

        </main>
    )
}

export default Envios
