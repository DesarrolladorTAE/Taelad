import { useEffect } from "react";

import "bootstrap/dist/js/bootstrap.bundle.min";

import "./assets/css/materialdesignicons.min.css";
import "./assets/scss/style.scss";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import AOS from "aos";

//routes
import Routes from "./routes/Routes";

function App() {
  useEffect(() => {
    AOS.init();
  }, []);
  return <Routes />;
}

export default App;
