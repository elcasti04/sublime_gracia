const API_ORIGIN = "http://localhost:3000";

export const obtenerUrlImagen = (imagen: string) => {
    if (!imagen || /^(data:|https?:|blob:|\/\/)/.test(imagen)) return imagen;
    return `${API_ORIGIN}/${imagen.replace(/^\/+/, "")}`;
};