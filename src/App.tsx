// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AOS from "aos";

import "bootstrap/dist/js/bootstrap.bundle.min";
import "./assets/css/materialdesignicons.min.css";
import "./assets/scss/style.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import AllRoutes from "./routes/Routes";

export default function App() {
  useEffect(() => { AOS.init(); }, []);
  return (
    <BrowserRouter>
      <AllRoutes />
    </BrowserRouter>
  );
}
