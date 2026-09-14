import { Anuncio } from "../models/anuncio.model.js";

export const createAnuncio = async (req, res) => {
    try {
        const { img } = req.body;

        if (!img) {
            return res.status(400).json({
                message: "No pueden faltar datos"
            });
        }

        const anuncio = await Anuncio.create({ img });

        res.status(201).json(anuncio);

    } catch (error) {
        res.status(500).json({
            message: "Error al crear el anuncio",
            error: error.message
        });
    }
};


export const getAnuncio = async (req, res) => {
    try {
        const anuncios = await Anuncio.findAll();

        // No queremos que esto sea un error para el frontend.
        // Si no hay anuncios, simplemente devolvemos [].
        res.status(200).json(anuncios);

    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los anuncios",
            error: error.message
        });
    }
};


export const deleteAnuncio = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "No se encontró el anuncio"
            });
        }

        const eliminado = await Anuncio.destroy({
            where: { id }
        });

        if (eliminado === 0) {
            return res.status(404).json({
                message: "El anuncio no existe"
            });
        }

        res.status(200).json({
            message: "Anuncio eliminado"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar el anuncio",
            error: error.message
        });
    }
};