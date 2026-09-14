import db from '../db/connect.js'
import { DataTypes } from 'sequelize'

export const User = db.define('usuario', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },

    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },

    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    contraseña: {
        type: DataTypes.STRING,
        allowNull: false
    },

    rol: {
        type: DataTypes.ENUM('usuario', 'admin'),
        defaultValue: 'usuario',
        allowNull: false
    }

})