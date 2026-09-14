const API_ORIGIN = import.meta.env.VITE_API_URL;

export const obtenerUrlImagen = (imagen: string) => {
    if (!imagen || /^(data:|https?:|blob:|\/\/)/.test(imagen)) return imagen;
    return `${API_ORIGIN}/${imagen.replace(/^\/+/, "")}`;
};