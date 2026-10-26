import multer from "multer";
import path from "path";
import { uploadsRoot } from "../utils/uploadStorage.js";
import { productImageFormats } from "../utils/productImageFormats.js";


// ==========================================
// CONFIGURACIÓN DEL ALMACENAMIENTO
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, path.join(uploadsRoot, "comprobantes"));

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const nombreArchivo =
            `comprobante-${Date.now()}${extension}`;

        cb(null, nombreArchivo);

    }

});


// ==========================================
// VALIDAR ARCHIVO
// ==========================================

const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "El comprobante debe ser una imagen"
            ),
            false
        );

    }

};

const filtroImagenProducto = (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (productImageFormats[extension] === file.mimetype) return cb(null, true);

    const error = new Error("Formato no permitido. Usa una imagen PNG, JPG, JPEG, JFIF, GIF, WEBP o AVIF.");
    error.code = "INVALID_PRODUCT_IMAGE";
    cb(error, false);
};


// ==========================================
// MULTER
// ==========================================

export const uploadComprobante = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});

export const uploadImagenProducto = multer({
    storage: multer.memoryStorage(),
    fileFilter: filtroImagenProducto,
    limits: { fileSize: 5 * 1024 * 1024 }
});
