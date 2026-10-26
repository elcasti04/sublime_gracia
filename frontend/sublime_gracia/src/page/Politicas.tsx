import { useLocation } from "react-router-dom";

const pages: Record<string, { title: string; intro: string; sections: Array<[string, string]> }> = {
    privacidad: {
        title: "Política de privacidad",
        intro: "BORRADOR PARA REVISIÓN. Antes de publicarlo como definitivo, completar la identidad y datos de contacto del responsable y validar las prácticas reales de almacenamiento y proveedores.",
        sections: [
            ["Datos que solicita el sitio", "Para tramitar pedidos se solicitan nombre, correo, teléfono, dirección y ciudad de entrega, además del comprobante de pago. Para publicar una opinión se solicitan nombre para mostrar, calificación y texto. El sitio no dispone actualmente de formulario de contacto web."],
            ["Finalidades", "Los datos de pedido se usan para gestionar la compra, pago, entrega y atención relacionada. Las opiniones se muestran en la página del producto indicado. [CONFIRMAR Y COMPLETAR FINALIDADES Y BASES LEGALES]."],
            ["Almacenamiento y conservación", "[COMPLETAR: sistemas, proveedores, ubicación y periodos reales de conservación; no publicar este borrador sin validación]."],
            ["Derechos y contacto", "Para consultas o solicitudes sobre datos personales, contactar al responsable: [COMPLETAR NOMBRE LEGAL Y CANAL DE CONTACTO]."],
            ["Analítica", "Google Analytics (ID de medición G-G68JZC6VYJ) solo se carga si aceptas analíticas en el banner."]
        ]
    },
    terminos: {
        title: "Términos y condiciones",
        intro: "BORRADOR PARA REVISIÓN. Completar datos del vendedor, proceso contractual, garantías y condiciones aplicables antes de tratar esta página como documento legal definitivo.",
        sections: [
            ["Productos y precios", "El precio visible corresponde a los productos y promociones vigentes mostrados en el sitio. Revisa el total antes de confirmar. [VALIDAR vigencia, impuestos y tratamiento de promociones]."],
            ["Envíos", "El sitio informa que algunos destinos tienen costo de transporte separado. El importe y el total final deben comunicarse y aceptarse antes de solicitar cualquier pago adicional. No hagas un pago adicional hasta conocer y aceptar el total actualizado."],
            ["Pedidos y pagos", "La recepción de un pedido no significa por sí sola que el pago haya sido verificado. El estado se consulta en la página de seguimiento."],
            ["Garantías y reclamaciones", "[COMPLETAR con condiciones reales y derechos legales aplicables; no inventar exclusiones]."],
            ["Vendedor y contacto", "[COMPLETAR nombre legal, identificación, domicilio de notificaciones y correo de contacto]."]
        ]
    },
    cookies: {
        title: "Política de cookies",
        intro: "El sitio guarda una preferencia local para recordar si aceptaste analíticas. Las cookies o almacenamiento estrictamente necesarios para el funcionamiento no se pueden desactivar desde este panel.",
        sections: [
            ["Analítica opcional", "Google Analytics (ID de medición G-G68JZC6VYJ) no se carga antes de la aceptación. Rechazar opcionales mantiene la analítica desactivada."],
            ["Cambiar elección", "Puedes modificar tu preferencia en cualquier momento con el enlace «Preferencias de cookies» del pie de página."],
            ["Proveedores", "[COMPLETAR detalles de Google Analytics, región, retención y transferencias internacionales cuando se configure el servicio]."]
        ]
    },
    devoluciones: {
        title: "Cambios y devoluciones",
        intro: "BORRADOR PARA REVISIÓN. No se han proporcionado plazos ni condiciones comerciales de devolución; deben completarse y validarse conforme a las normas aplicables antes de publicar.",
        sections: [
            ["Plazos y condiciones", "[DEFINIR plazos, estado del producto, productos excluidos cuando sea legalmente válido y proceso de solicitud]."],
            ["Costos", "[DEFINIR quién asume los costos de transporte en cada supuesto, sin cargos no informados]."],
            ["Garantía y reembolsos", "[DEFINIR proceso, medios y plazos reales de respuesta y reembolso]."],
            ["Solicitudes", "Contacta a Sublime Gracia mediante los canales vigentes indicados en la página de contacto. [COMPLETAR un canal de contacto válido]."]
        ]
    }
};

const Politicas = () => {
    const { pathname } = useLocation();
    const key = pathname.replace("/", "");
    const page = pages[key] || pages.privacidad;
    return (
        <main className="site-page legal-page">
            <p className="draft-notice">Borrador pendiente de validación</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            {page.sections.map(([heading, content]) => (
                <section key={heading}>
                    <h2>{heading}</h2>
                    <p>{content}</p>
                </section>
            ))}
        </main>
    );
};

export default Politicas;
