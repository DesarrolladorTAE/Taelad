import { Hero1 } from "../../../components/heros";
import HowItWork from "../../../components/HowItWork";
import Features1 from "../../../components/Features1";
import Features2 from "../../../components/Features2";
import Testimonial from "../../../components/Testimonial";
import Pricing from "../../../components/Pricing";
import Faqs from "../../../components/Faqs";
import Cta from "../../../components/Cta";
import Contact from "../../../components/Contact";
import Footer from "../../../components/Footer";
import BackToTop from "../../../components/BackToTop";
import { Navbar1 } from "../../../components/navbar";
import FEHero from "../../../components/FacEle/FEHero";
import Intro from "../../../components/FacEle/Intro";
import Precios from "../../../components/FacEle/Precios";
import Beneficios from "../../../components/FacEle/Beneficios";
import Contactanos from "../../../components/FacEle/Contactanos";
import TaeFooter from "../../../components/TaeFooter";

const FacEle = () => {
  return (
    <>
      {/* Navbar */}
      <Navbar1 classname="navbar-light" isLogoDark={false} />

      {/* Hero Section */}
      {/* <div id="home"> */}
        <FEHero />
        {/* <HowItWork /> */}
      {/* </div> */}

      {/* Características */}
      {/* <div id="features"> */}
        <Intro />
      {/* </div> */}

      {/* Más detalles */}
      {/* <div id="screenshot"> */}
        <Precios />
      {/* </div> */}

      {/* Testimonios */}
      <Beneficios />

      {/* Precios / Planes */}
      {/* <div id="pricing"> */}
        <Contactanos />
        {/* <Faqs />
        <Cta /> */}
      {/* </div> */}

      {/* Contacto */}
      {/* <Contact /> */}

      {/* Footer */}
      <TaeFooter />

      {/* Back to top */}
      <BackToTop />
    </>
  );
};

export default FacEle;
