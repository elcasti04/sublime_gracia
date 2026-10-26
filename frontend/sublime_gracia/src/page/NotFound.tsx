import { Link } from "react-router-dom";

const NotFound = () => (
    <main className="site-page not-found-page">
        <p className="eyebrow">Error 404</p>
        <h1>No encontramos esta página</h1>
        <p>Puede que el enlace haya cambiado o que la dirección esté escrita de forma incorrecta.</p>
        <Link className="site-primary-cta" to="/catalogo">Explorar catálogo</Link>
    </main>
);

export default NotFound;
