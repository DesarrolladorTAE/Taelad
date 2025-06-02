import { Hero1 } from "../../../components/heros";
import HowItWork from "../../../components/HowItWork";
import Features1 from "../../../components/Features1";
import Features2 from "../../../components/Features2";
import Counter from "../../../components/Counter";
import Testimonial from "../../../components/Testimonial";
import Faqs from "../../../components/Faqs";
import Cta from "../../../components/Cta";
import Contact from "../../../components/Contact";
import BackToTop from "../../../components/BackToTop";
import Login from "../../auth/Login";
import Signin from "../../auth/Signin";
import { Navbar1 } from "../../../components/navbar";
import Slider from "../../../components/Slider";
import Pricing from "../../../components/Pricing";
import Footer from "../../../components/Footer";

const index1 = () => {
  return (
    <>
      {/* navbar */}
      <Navbar1 classname="navbar-light" isLogoDark={false} />
      {/* header and hero */}
      <div id="home">
      <Hero1 />
      {/* how it work */}
      <HowItWork />
      </div>
      <div id="features">
      {/* features1 */}
      <Features1 />
      {/* counter */}
      {/* <Counter /> */}
      </div>
      <div id="screenshot">
      {/* fetures2 */}
      <Features2 />
      {/* slider */}
      <Slider />
      </div>
      {/* testimonial */}
      <Testimonial />
      <div id="pricing">
      {/* pricing */}
      <Pricing />
      {/* faqs */}
      <Faqs />
      {/* cta */}
      <Cta />
      </div>
      {/* contact */}
      <Contact />
      {/* footer */}
      <Footer />
      {/* back to top button */}
      <BackToTop />
      {/* login form */}
      <Login />
      {/* signin form */}
      <Signin />
    </>
  );
};

export default index1;
