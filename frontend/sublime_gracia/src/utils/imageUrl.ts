import type { SyntheticEvent } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim()
    .replace(/\/api\/?$/i, "")
    .replace(/\/+$/, "");

export const IMAGEN_NO_DISPONIBLE = "/image-unavailable.svg";

export const obtenerUrlImagen = (imagen: string | null | undefined): string => {
    const ruta = typeof imagen === "string" ? imagen.trim() : "";
    if (!ruta) return IMAGEN_NO_DISPONIBLE;
    if (/^(data:|https?:|blob:|\/\/)/i.test(ruta)) return ruta;

    const rutaNormalizada = ruta
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .replace(/^(?:api\/)+uploads\//i, "uploads/");

    return API_BASE_URL
        ? `${API_BASE_URL}/${rutaNormalizada}`
        : `/${rutaNormalizada}`;
};

export const marcarImagenNoDisponible = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.dataset.fallback === "true") return;

    image.dataset.fallback = "true";
    image.src = IMAGEN_NO_DISPONIBLE;
};