import '../style/contacto.css'

const Contacto = () => {

    return (
        <main className="contacto">

            <h1>Contacto</h1>

            <h2>¿Tienes dudas?</h2>

            <p>
                Puedes comunicarte con nosotros a través de correo o demás medios.
            </p>

            <div className="redes">

                <h2>Redes</h2>

                <a
                    href="https://www.facebook.com/sublimegracia"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>Facebook</span>
                    <img
                        src="/icons/icons8-facebook.gif"
                        alt="Facebook"
                    />
                </a>

                <a
                    href="https://www.instagram.com/sublimegracia"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>Instagram</span>
                    <img
                        src="/icons/icons8-instagram.gif"
                        alt="Instagram"
                    />
                </a>

                <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>WhatsApp</span>
                    <img
                        src="/icons/icons8-whatsapp.gif"
                        alt="WhatsApp"
                    />
                </a>

            </div>

            <form method="get">

                <label htmlFor="nombre">
                    Nombre
                </label>

                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Escribe tu nombre"
                    required
                />

                <label htmlFor="email">
                    Correo electrónico
                </label>

                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="ejemplo@correo.com"
                    required
                />

                <label htmlFor="mensaje">
                    Mensaje
                </label>

                <textarea
                    id="mensaje"
                    name="mensaje"
                    placeholder="Escribe tu mensaje..."
                    required
                ></textarea>

                <button type="submit">
                    Enviar mensaje
                </button>

            </form>

        </main>
    )
}

export default Contacto
