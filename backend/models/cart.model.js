import db from '../db/connect.js'
import { DataTypes } from 'sequelize'

export const Cart = db.define('carrito', {

    id: { 
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

})