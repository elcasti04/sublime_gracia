import express from 'express'

import {
    crearPago
} from '../../controllers/pago.controller.js'

const router = express.Router()

router.post('/pagos', crearPago)

export default router
