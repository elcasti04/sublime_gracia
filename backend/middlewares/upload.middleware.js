import multer from "multer";
import path from "path";


// ==========================================
// CONFIGURACIÓN DEL ALMACENAMIENTO
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/comprobantes");

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

const productStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/productos"),
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `producto-${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`);
    }
});


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
    storage: productStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
