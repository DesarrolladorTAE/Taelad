import BackToTop from "../../../components/BackToTop";
import Contact from "../../../components/Contact";
import Cta from "../../../components/Cta";
import Faqs from "../../../components/Faqs";
import Features1 from "../../../components/Features1";
import Features2 from "../../../components/Features2";
import { Hero3 } from "../../../components/heros";
import HowItWork from "../../../components/HowItWork";
import Testimonial from "../../../components/Testimonial";
import Login from "../../auth/Login";
import Signin from "../../auth/Signin";
import { Navbar1 } from "../../../components/navbar";
import Slider from "../../../components/Slider";
import Pricing from "../../../components/Pricing";
import Footer from "../../../components/Footer";
import Counter from "../../../components/Counter";
import ConEle from "../../../components/ConEle/CEHero";
import CEHero from "../../../components/ConEle/CEHero";
import Iconos from "../../../components/ConEle/Iconos";
import Nube from "../../../components/ConEle/Nube";
import Correo from "../../../components/ConEle/Correo";
import TaeFooter from "../../../components/TaeFooter";

const index = () => {
    return (
        <>
            {/* navbar */}
            <Navbar1 classname="navbar-light" isLogoDark={false} />
            {/* header and hero */}
            <div id="home">
                <CEHero />
                {/* how it work */}
                <Iconos />
            </div>
            <div id="features">
                {/* features1 */}
                <Nube />
                {/* fetures2 */}
                <Correo />
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
            <BackToTop />
            {/* login form */}
            <Login />
            {/* signin form */}
            <Signin />
        </>
    );
};

export default index;
