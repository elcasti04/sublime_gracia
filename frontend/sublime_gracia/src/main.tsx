
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";


import Router from "./Router";
import Header from "./page/header";
import Footer from "./page/footer";

createRoot(document.getElementById("root")!).render(

    <StrictMode>

        <BrowserRouter>

            <Header />

            <Router />

            <Footer />

        </BrowserRouter>

    </StrictMode>

);
