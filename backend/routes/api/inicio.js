import { Router } from 'express'

const router = Router()

router.get('/inicio', (req, res) => {
    res.send('Inicio')
})

export default router