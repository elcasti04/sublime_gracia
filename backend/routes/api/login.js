import { Login } from "../../controllers/login.controller.js";
import { Router } from 'express'
import { rateLimit } from '../../middlewares/security.middleware.js'

const router = Router()

router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), Login)


export default router 