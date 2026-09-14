import "../style/historia.css"

const Historia = () => {
    return (
        <section className="historia">

            <div className="historia-contenido">

                {/* TEXTO */}

                <div className="historia-texto">

                    <span className="historia-etiqueta">
                        NUESTRA HISTORIA
                    </span>

                    <h1>
                        EL PERFUME COMO
                        <br />
                        <span>IDENTIDAD</span>
                    </h1>

                    <div className="historia-descripcion">

                        <p>
                            Sublime Gracia nació de la convicción de que cada
                            fragancia cuenta una historia íntima. Desde nuestro
                            taller, trabajamos con
                            los maestros perfumistas más reconocidos para crear
                            composiciones que trascienden lo ordinario.
                        </p>

                        <p>
                            Cada extracto, cada absoluto, cada resina se
                            selecciona a mano en origen — del campo de rosas
                            de Bulgaria al bosque de oud en Camboya.
                        </p>

                    </div>

                    {/* ESTADÍSTICAS */}

                    <div className="historia-estadisticas">

                        <div className="estadistica">
                            <strong>100%</strong>
                            <span>Calidad y duración</span>
                        </div>

                        <div className="estadistica">
                            <strong>14</strong>
                            <span>Países de origen</span>
                        </div>

                        <div className="estadistica">
                            <strong>4.5★</strong>
                            <span>Valoración media</span>
                        </div>

                    </div>

                </div>

                {/* IMAGEN */}

                <div className="historia-imagen">
                    <img
                        src="https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Perfume Sublime Gracia"
                    />
                </div>

            </div>

        </section>
    )
}

export default Historia