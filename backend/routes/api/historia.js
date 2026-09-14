import { Router } from 'express'
import catchError from '../../middlewares/catchError.js'

const router = Router()

router.get('/historia', catchError(
    (req, res) => {
    res.json(
        {
            titulo: 'Nuestra Historia',
            historiap1: 'historia p1',
            historiap2: 'historia p2',
            nombre: 'sublime gracia',
            lema: 'lema',
            img1: 'imagen1',
            img2: 'imagen2',
        }
    )
}
))



export default router 