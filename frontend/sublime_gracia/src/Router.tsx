import { Routes, Route } from "react-router-dom";

import App from "./App";
import Catalogo from "./page/catalogo";
import Carrito from "./page/carrito";
import Checkout from "./page/Checkout";
import Admin from "./page/Admin";
import Login from "./page/Login.tsx"
import Colonias from "./page/Colonias.tsx"
import Seguimiento from "./page/Seguimiento.tsx"
import Contacto from "./page/contacto.tsx";


function Router() {

    return (

        <Routes>

            {/* INICIO */}
            <Route
                path="/"
                element={<App />}
            />


            {/* CATÁLOGO */}
            <Route
                path="/catalogo"
                element={<Catalogo />}
            />

            {/* CARRITO */}
            <Route
                path="/carrito"
                element={<Carrito />}
            />

            {/* CHECKOUT */}
            <Route
                path="/checkout"
                element={<Checkout />}
            />

            <Route
                path="/seguimiento/:id"
                element={<Seguimiento />}
            />

            <Route
                path="/seguimiento"
                element={<Seguimiento />}
            />


            {/* Contacto */}
            <Route
            path="/contacto"
            element={<Contacto />}
            />

            {/* LOGIN */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* ADMIN */}
            <Route
                path="/admin"
                element={<Admin />}
            />

            <Route
                path="/admin/colonias"
                element={<Colonias />}
            />

        </Routes>
    );
}

export default Router;
