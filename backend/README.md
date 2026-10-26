# Backend uploads

Product images and payment receipts are written under `UPLOADS_DIR` and served
at the existing `/uploads/...` URL paths. If `UPLOADS_DIR` is not set, the
backend uses its local `uploads` directory.

For Render, attach a persistent disk mounted at `/var/data` and set
`UPLOADS_DIR=/var/data/uploads` on the web service. The application creates
the `productos` and `comprobantes` directories when it starts. Keep the
database image values as `/uploads/productos/<filename>`; the public URL
continues to use the backend host.

Attaching a disk does not restore files that were already lost from an
ephemeral filesystem. Restore those original files to the persistent
`productos` directory or upload them again through the admin panel.
