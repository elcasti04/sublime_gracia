import { Router } from "express";
import { createReseña, getReseñas } from '../../controllers/reseñas.controller.js'

const router = Router()

router.post('/opiniones', createReseña)
router.get('/opiniones', getReseñas)

export default router