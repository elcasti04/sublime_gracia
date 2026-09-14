import db from '../db/connect.js'
import { DataTypes } from 'sequelize'

export const Reseñas = db.define('reseñas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    opinion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})