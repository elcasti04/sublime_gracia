import { Router } from 'express'
import routes from './api/index.api.js'

const router = Router()

router.use('/', routes)

export default router 