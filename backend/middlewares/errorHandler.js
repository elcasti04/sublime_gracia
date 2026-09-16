const errorHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.name === "MulterError" || error.code === "LIMIT_FILE_SIZE" || error.message === "El comprobante debe ser una imagen") {
        return res.status(400).json({
            message: error.code === "LIMIT_FILE_SIZE"
                ? "La imagen no puede superar los 5 MB"
                : error.message === "El comprobante debe ser una imagen"
                    ? error.message
                    : "La imagen enviada no es valida"
        });
    }

    if(error.name === 'SequelizeValidationError') {
        const errObj = {};
        error.errors.map(er => {
            errObj[er.path] = er.message;
        })
        return res.status(400).json(errObj);
    }

    if(error.name === 'SequelizeForeignKeyConstraintError'){
        return res.status(400).json({ 
            message: error.message,
            error: error.parent.detail
        });
    }

    if(error.name === 'SequelizeDatabaseError'){
        return res.status(400).json({ 
            message: error.message
        });
    }

    return res.status(500).json({
        message: error.message,
        error: error
    });
}

export default errorHandler;