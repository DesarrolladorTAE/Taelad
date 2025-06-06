import BackToTop from "../../../components/BackToTop";
import Contact from "../../../components/Contact";
import Cta from "../../../components/Cta";
import Faqs from "../../../components/Faqs";
import Features1 from "../../../components/Features1";
import Features2 from "../../../components/Features2";
import { Hero4 } from "../../../components/heros";
import HowItWork from "../../../components/HowItWork";
import { Navbar1 } from "../../../components/navbar";
import Slider from "../../../components/Slider";
import Pricing from "../../../components/Pricing";
import Footer from "../../../components/Footer";
import Counter from "../../../components/Counter";
import Testimonial from "../../../components/Testimonial";
import Login from "../../auth/Login";
import Signin from "../../auth/Signin";
import MDHero from "../../../components/MarDig/MDHero";
import Creamos from "../../../components/MarDig/Creamos";
import TaeFooter from "../../../components/TaeFooter";
import Servicios from "../../../components/MarDig/Servicios";

const index = () => {
  return (
    <>
      {/* navbar */}
      <Navbar1 classname="navbar-light" isLogoDark={false} />
      {/* header and hero */}
      <div id="home">
      <MDHero />
      {/* how it work */}
      <Creamos />
      </div>
      <div id="features">
      {/* features1 */}
      <Servicios />
      {/* fetures2 */}
      {/* <Features2 /> */}
      {/* counter */}
      {/* <Counter /> */}
      </div>
      <div id="screenshot">
      {/* slider */}
      {/* <Slider /> */}
      </div>
      {/* testimonial */}
      {/* <Testimonial /> */}
      <div id="pricing">
      {/* pricing */}
      {/* <Pricing /> */}
      {/* faqs */}
      {/* <Faqs /> */}
      {/* cta */}
      {/* <Cta /> */}
      </div>
      {/* contact */}
      {/* <Contact /> */}
      {/* footer */}
      <TaeFooter />
      {/* back to top button */}
      {/* <BackToTop /> */}
      {/* login form */}
      {/* <Login /> */}
      {/* signin form */}
      {/* <Signin /> */}
    </>
  );
};

export default index;
