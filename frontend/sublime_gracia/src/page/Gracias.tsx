import { Link, useParams } from "react-router-dom";

const Gracias = () => {
    const { id } = useParams();
    return (
        <main className="site-page">
            <p className="eyebrow">Pedido recibido</p>
            <h1>Gracias por tu pedido</h1>
            <p>Recibimos tu solicitud. Puedes consultar su estado desde la página de seguimiento.</p>
            {id && <p className="order-reference">Número de pedido: <strong>{id}</strong></p>}
            <Link className="site-primary-cta" to={id ? `/seguimiento/${id}` : "/seguimiento"}>Ver seguimiento</Link>
            <Link className="text-link" to="/catalogo">Volver al catálogo</Link>
        </main>
    );
};

export default Gracias;
