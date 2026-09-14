import { useEffect, useState } from "react";
import axios from "axios";
import "../style/anuncio.css";
import { obtenerUrlImagen } from "../utils/imageUrl";

interface Anuncio {
    id: number;
    img: string;
}

const Anuncios = () => {

    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

    useEffect(() => {

        const obtenerAnuncios = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:3000/api/anuncio"
                );

                setAnuncios(response.data);

            } catch (error) {

                console.error("Error al obtener anuncios:", error);

                // Si no hay anuncios o ocurre algún error,
                // no mostramos nada.
                setAnuncios([]);
            }
        };

        obtenerAnuncios();

    }, []);

    // Si no hay anuncios, no renderizamos nada
    if (anuncios.length === 0) {
        return null;
    }

    return (
        <section className="anuncios">

            {anuncios.map((anuncio) => (
                <div className="anuncio" key={anuncio.id}>

                    <img
                        src={obtenerUrlImagen(anuncio.img)}
                        alt="Anuncio"
                    />

                </div>
            ))}

        </section>
    );
};

export default Anuncios;