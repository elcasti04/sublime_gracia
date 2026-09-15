import express from 'express'
import cors from 'cors'
import routes from '../routes/index.js'
import errorHandler from '../middlewares/errorHandler.js'
import cookieParser from 'cookie-parser'
import path from "path";
import { securityHeaders, rateLimit } from "../middlewares/security.middleware.js";

const app = express()
const originsPermitidos = ['https://sublime-gracia.netlify.app', "http://localhost:5173"]

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use(cors({
    origin: originsPermitidos,
    credentials: true
}))

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/uploads", express.static("uploads"));

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

app.use(cookieParser())


app.use('/', routes)

app.use(errorHandler)

export default app