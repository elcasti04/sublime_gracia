import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SITE_NAME = "Sublime Gracia";
const SHARE_IMAGE = "/logo.jpg";

const pageMetadata = (pathname: string) => {
    if (pathname === "/") return ["Perfumes y fragancias | Sublime Gracia", "Descubre la colección de fragancias de Sublime Gracia y encuentra tu próximo perfume."];
    if (pathname === "/catalogo") return ["Catálogo de perfumes | Sublime Gracia", "Explora fragancias, presentaciones, precios y disponibilidad de la colección Sublime Gracia."];
    if (pathname === "/carrito") return ["Tu carrito | Sublime Gracia", "Revisa los productos y el total de tu carrito antes de continuar."];
    if (pathname === "/checkout") return ["Finalizar compra | Sublime Gracia", "Revisa los datos del pedido, el pago y los costos de envío antes de confirmar."];
    if (pathname === "/contacto") return ["Contacto | Sublime Gracia", "Comunícate con Sublime Gracia para resolver tus dudas sobre productos y pedidos."];
    if (pathname === "/envios") return ["Envíos y ubicación | Sublime Gracia", "Consulta las zonas y condiciones de entrega de Sublime Gracia."];
    if (pathname === "/privacidad") return ["Privacidad | Sublime Gracia", "Borrador de la política de privacidad de Sublime Gracia."];
    if (pathname === "/terminos") return ["Términos y condiciones | Sublime Gracia", "Borrador de los términos y condiciones de compra de Sublime Gracia."];
    if (pathname === "/cookies") return ["Política de cookies | Sublime Gracia", "Conoce las cookies y preferencias de privacidad disponibles en Sublime Gracia."];
    if (pathname === "/devoluciones") return ["Cambios y devoluciones | Sublime Gracia", "Consulta el borrador de las condiciones de cambios, devoluciones y garantías."];
    if (pathname === "/casos-exito") return ["Experiencias de clientes | Sublime Gracia", "Historias y experiencias de clientes publicadas únicamente con autorización."];
    if (pathname.startsWith("/producto/")) return [`Perfume ${pathname.split("/").pop()} | Sublime Gracia`, "Consulta detalles, disponibilidad y opiniones asociadas a este producto."];
    if (pathname.startsWith("/gracias/")) return ["Pedido recibido | Sublime Gracia", "Gracias por tu pedido. Consulta su estado y los siguientes pasos."];
    if (pathname.startsWith("/seguimiento")) return ["Seguimiento de pedido | Sublime Gracia", "Consulta el estado de tu pedido de Sublime Gracia."];
    if (pathname === "/login") return ["Administración | Sublime Gracia", "Acceso administrativo de Sublime Gracia."];
    if (pathname.startsWith("/admin")) return ["Panel de administración | Sublime Gracia", "Gestión administrativa de Sublime Gracia."];
    return ["Página no encontrada | Sublime Gracia", "La página solicitada no está disponible. Explora el catálogo de Sublime Gracia."];
};

export const SeoManager = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const [title, description] = pageMetadata(pathname);
        const noIndex = pathname.startsWith("/admin") || pathname === "/login" || pathname === "/checkout" || pathname === "/carrito" || pathname.startsWith("/seguimiento") || pathname.startsWith("/gracias/") || pageMetadata(pathname)[0].startsWith("Página no encontrada");
        const origin = window.location.origin;
        const url = `${origin}${pathname}`;
        document.title = title;

        const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
            let element = document.head.querySelector<HTMLMetaElement>(selector);
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attribute, key);
                document.head.appendChild(element);
            }
            element.content = content;
        };

        setMeta('meta[name="description"]', "name", "description", description);
        setMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
        setMeta('meta[property="og:type"]', "property", "og:type", "website");
        setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
        setMeta('meta[property="og:title"]', "property", "og:title", title);
        setMeta('meta[property="og:description"]', "property", "og:description", description);
        setMeta('meta[property="og:image"]', "property", "og:image", `${origin}${SHARE_IMAGE}`);
        setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", "Logotipo de Sublime Gracia");
        setMeta('meta[property="og:url"]', "property", "og:url", url);
        setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
        setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
        setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
        setMeta('meta[name="twitter:image"]', "name", "twitter:image", `${origin}${SHARE_IMAGE}`);

        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = url;

        const existingSchema = document.getElementById("local-business-schema");
        if (pathname === "/") {
            if (!existingSchema) {
                const script = document.createElement("script");
                script.id = "local-business-schema";
                script.type = "application/ld+json";
                script.textContent = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    name: SITE_NAME,
                    url: origin,
                    image: `${origin}${SHARE_IMAGE}`,
                    address: {
                        "@type": "PostalAddress",
                        addressLocality: "San Pedro",
                        addressRegion: "Sucre",
                        addressCountry: "CO"
                    },
                    description: "Tienda de fragancias con base en San Pedro, Sucre, Colombia.",
                    areaServed: ["San Pedro, Sucre", "Corregimientos y veredas cercanas"]
                });
                document.head.appendChild(script);
            }
        }
    }, [pathname]);

    return null;
};

const labels: Record<string, string> = {
    catalogo: "Catálogo",
    producto: "Producto",
    carrito: "Carrito",
    checkout: "Finalizar compra",
    contacto: "Contacto",
    envios: "Envíos y ubicación",
    privacidad: "Privacidad",
    terminos: "Términos y condiciones",
    cookies: "Cookies",
    devoluciones: "Cambios y devoluciones",
    "casos-exito": "Experiencias de clientes",
    gracias: "Pedido recibido",
    seguimiento: "Seguimiento",
    admin: "Administración",
    promos: "Promociones y anuncios",
    colonias: "Colonias",
    login: "Acceso"
};

export const Breadcrumbs = () => {
    const { pathname } = useLocation();
    const parts = pathname.split("/").filter(Boolean);
    const breadcrumbPaths = ["/envios", "/privacidad", "/terminos", "/cookies", "/devoluciones", "/casos-exito"];
    if (!parts.length || pathname.startsWith("/admin") || pathname === "/login" ||
        (parts.length === 1 && !breadcrumbPaths.includes(pathname))) return null;

    const breadcrumbParts = pathname.startsWith("/producto/")
        ? [{ label: "Catálogo", path: "/catalogo", clickable: true }, { label: "Detalle", path: pathname, clickable: false }]
        : pathname.startsWith("/gracias/")
            ? [{ label: "Pedido recibido", path: pathname, clickable: false }]
            : parts.map((part, index) => ({
                label: labels[part] || part,
                path: `/${parts.slice(0, index + 1).join("/")}`,
                clickable: index < parts.length - 1
            }));

    return (
        <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            {breadcrumbParts.map((part, index) => {
                const isLast = index === breadcrumbParts.length - 1;
                return (
                    <span className="breadcrumb-item" key={part.path}>
                        <span aria-hidden="true">/</span>
                        {isLast || !part.clickable
                            ? <span aria-current={isLast ? "page" : undefined}>{part.label}</span>
                            : <Link to={part.path}>{part.label}</Link>}
                    </span>
                );
            })}
        </nav>
    );
};

interface AnalyticsWindow extends Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
}

interface CookiePreference {
    version: number;
    analytics: boolean;
    savedAt: string;
}

const CONSENT_KEY = "sublime-gracia-cookie-consent";

export const CookieConsent = () => {
    const { pathname } = useLocation();
    const [storageError, setStorageError] = useState("");
    const [preference, setPreference] = useState<CookiePreference | null>(() => {
        try {
            const value = localStorage.getItem(CONSENT_KEY);
            if (!value) return null;
            const parsed = JSON.parse(value) as CookiePreference;
            return parsed.version === 1 && typeof parsed.analytics === "boolean" ? parsed : null;
        } catch {
            return null;
        }
    });
    const [open, setOpen] = useState(preference === null);
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-G68JZC6VYJ";

    useEffect(() => {
        const openPreferences = () => setOpen(true);
        window.addEventListener("cookie-preferences-open", openPreferences);
        return () => window.removeEventListener("cookie-preferences-open", openPreferences);
    }, []);

    useEffect(() => {
        if (!measurementId) return;
        const analyticsWindow = window as AnalyticsWindow;
        if (!analyticsWindow.gtag) {
            analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
            analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
        }
        analyticsWindow.gtag("consent", "update", {
            analytics_storage: preference?.analytics ? "granted" : "denied"
        });
        if (!preference?.analytics) return;

        analyticsWindow.gtag("js", new Date());
        analyticsWindow.gtag("config", measurementId, { send_page_view: false });
        const scriptId = "google-analytics-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
            document.head.appendChild(script);
        }
    }, [measurementId, preference]);

    useEffect(() => {
        if (!measurementId || !preference?.analytics) return;
        const analyticsWindow = window as AnalyticsWindow;
        analyticsWindow.gtag?.("event", "page_view", {
            page_path: pathname,
            page_title: document.title,
            page_location: window.location.href
        });
    }, [measurementId, pathname, preference]);

    const savePreference = (analytics: boolean) => {
        const next = { version: 1, analytics, savedAt: new Date().toISOString() };
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
        } catch {
            setStorageError("No pudimos guardar tu preferencia en este dispositivo. Revisa la configuración del navegador y vuelve a intentarlo.");
            return;
        }
        setPreference(next);
        setOpen(false);
    };

    if (!open) return null;

    return (
        <section className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
            <div>
                <h2 id="cookie-title">Tu privacidad importa</h2>
                <p>Usamos almacenamiento necesario para recordar esta elección. Google Analytics solo se activa si aceptas cookies analíticas. Puedes cambiar tu decisión desde el pie de página.</p>
                {!measurementId && <p className="cookie-note">La analítica está desactivada hasta configurar el identificador de medición.</p>}
                {storageError && <p role="alert">{storageError}</p>}
                <Link to="/cookies">Leer la política de cookies</Link>
            </div>
            <div className="cookie-actions">
                <button type="button" onClick={() => savePreference(false)}>Rechazar opcionales</button>
                <button type="button" onClick={() => savePreference(true)} disabled={!measurementId}>Aceptar analíticas</button>
            </div>
        </section>
    );
};

export const MobileCatalogCta = () => {
    const { pathname } = useLocation();
    if (pathname === "/catalogo" || pathname.startsWith("/admin") || pathname === "/checkout" || pathname === "/login") return null;
    return <Link className="mobile-catalog-cta" to="/catalogo">Explorar catálogo</Link>;
};
