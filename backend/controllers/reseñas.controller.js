import { Reseñas } from "../models/reseñas.model.js";


export const createReseña = async (req, res) => {
    const { nombre, opinion, calificacion } = req.body
    if(!nombre, !opinion, !calificacion){
        res.status(400).json('faltan datos')
    }

    const reseña = await Reseñas.create({
        nombre,
        opinion,
        calificacion
    })

    res.status(201).json(reseña)

}

export const getReseñas = async (req, res) => {
    const reseñas = await Reseñas.findAll()

    if(!reseñas || reseñas.length === 0){
        res.status(404).json('No se encontraron reseñas')
    }

    res.status(200).json(reseñas)

}

export const deleteReseña = async (req, res) => {
    const { id } = req.params
    const _ = await Reseñas.findByPk(id)

    if(!_){
        res.status(404).json('No se encontro la reseña')
    }

    res.status(200).json('Reseña Eliminada')
}