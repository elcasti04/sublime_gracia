import { Link } from "react-router-dom";

const CasosExito = () => (
    <main className="site-page">
        <p className="draft-notice">Contenido pendiente de testimonios reales y autorización de publicación</p>
        <h1>Experiencias de nuestros clientes</h1>
        <p>No publicamos testimonios inventados. Esta sección se completará cuando existan experiencias verificables y autorización de las personas que las compartan.</p>
        <Link className="site-primary-cta" to="/contacto">Contactar</Link>
    </main>
);

export default CasosExito;
