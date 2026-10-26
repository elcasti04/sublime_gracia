import '../style/contacto.css'

const Contacto = () => {
    return (
        <main className="contacto">

            <h1>Contacto</h1>

            <h2>¿Tienes dudas?</h2>

            <p>
                Puedes escribirnos por nuestras redes. Plazo de respuesta: [DEFINIR Y CONFIRMAR UN PLAZO REAL ANTES DE PUBLICAR].
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

            </div>

            <p className="contact-form-notice" role="note">
                El formulario web no está disponible por ahora. No introduzcas datos personales aquí; contáctanos desde Instagram o Facebook.
            </p>

        </main>
    )
}

export default Contacto
