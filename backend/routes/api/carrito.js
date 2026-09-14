import express from "express";

import { getCart } from "../../controllers/carrito.controller.js";
import {     
    createItem,
    updateItem,
    deleteItem 
} from "../../controllers/cartItem.controller.js";

const router = express.Router();

router.get("/cart", getCart);

router.post("/cart/items", createItem)

router.put("/cart/:id", updateItem)

router.delete("/cart/:id", deleteItem)

export default router;