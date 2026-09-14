import { Router } from 'express'
import { getAllProducts, getProductsSeg, getOneProduct, createProduct } from '../../controllers/catalogo.controller.js'
import { verifyAdmin, verifyToken } from '../../middlewares/auth.middleware.js'



const router = Router()

router.get('/catalogo', getAllProducts)
router.get('/catalogo/id/:id', getOneProduct)
router.post('/catalogo', verifyToken, verifyAdmin, createProduct)
router.get('/catalogo/categoria/:seg', getProductsSeg)


export default router 