import db from '../db/connect.js'
import { DataTypes } from 'sequelize'

export const Anuncio = db.define('anuncio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    img: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})