import BackToTop from "../../../components/BackToTop";
import Contact from "../../../components/Contact";
import Cta from "../../../components/Cta";
import Faqs from "../../../components/Faqs";
import Features1 from "../../../components/Features1";
import Features2 from "../../../components/Features2";
import { Hero5 } from "../../../components/heros";
import HowItWork from "../../../components/HowItWork";
import Testimonial from "../../../components/Testimonial";
import Login from "../../auth/Login";
import Signin from "../../auth/Signin";
import { Navbar1 } from "../../../components/navbar";
import Slider from "../../../components/Slider";
import Pricing from "../../../components/Pricing";
import Footer from "../../../components/Footer";
import Counter from "../../../components/Counter";
import DWHero from "../../../components/DisWeb/DWHero";
import PaqDW from "../../../components/DisWeb/PaqDW";
import TaeFooter from "../../../components/TaeFooter";
import PaqMan from "../../../components/DisWeb/PaqMan";
import PaqSEO from "../../../components/DisWeb/PaqSEO";
import PaqWP from "../../../components/DisWeb/PaqWP";

const index = () => {
  return (
    <>
      {/* navbar */}
      <Navbar1 classname="navbar-light" isLogoDark={false} />
{/* header and hero */}
<div id="home">
      <DWHero />
      {/* how it work */}
      <PaqDW />
      </div>
      <div id="features">
      {/* features1 */}
      <PaqMan />
      {/* fetures2 */}
      <PaqWP />
      {/* counter */}
      <PaqSEO />
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
      <BackToTop />
      {/* login form */}
      {/* <Login /> */}
      {/* signin form */}
      {/* <Signin /> */}
    </>
  );
};

export default index;
