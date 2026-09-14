import { Router } from "express";

import {
    createAnuncio,
    getAnuncio,
    deleteAnuncio
} from '../../controllers/anuncio.controller.js';

const router = Router();

router.post('/anuncio', createAnuncio);

router.get('/anuncio', getAnuncio);

router.delete('/anuncio/:id', deleteAnuncio);

export default router;