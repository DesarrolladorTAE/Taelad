
import { Link } from "react-router-dom";


//images
import index1 from "../assets/images/home/index1.jpg";
import index2 from "../assets/images/home/index2.jpg";
import index3 from "../assets/images/home/index3.jpg";
import index4 from "../assets/images/home/index4.jpg";
import index5 from "../assets/images/home/index5.jpg";
import index6 from "../assets/images/home/index6.jpg";

import facebook from "../assets/images/icon/facebook-line.svg";
import twitter from "../assets/images/icon/twitter-line.svg";
import linkedin from "../assets/images/icon/linkedin-line.svg";
import dribbble from "../assets/images/icon/dribbble-line.svg";
import skype from "../assets/images/icon/skype-line.svg";
import cart from "../assets/images/icon/shopping-cart-2-line.svg";
import { Col, Container, Row } from "react-bootstrap";

const Home = () => {
  const year = new Date().getFullYear().toString()
  return (
    <>
      <section className="section home" id="home">
        <Container>
          <Row className="justify-content-center">
            <Col lg={7}>
              <div className="home-wrapper text-center">
                <div className="text-tran-box">
                  <h1 className="text-transparent">
                    Appexy - Landing Page Template
                  </h1>
                </div>
                <p>
                  Appexy is a fully responsive landing template built using the
                  latest bootstrap framework. It’s designed for describing your
                  app, agency or business.
                </p>

                <Link
                  to="https://1.envato.market/appexy"
                  target="_blank"
                  className="btn btn-dark-custom mt-4 mb-5"
                >
                 <img src={cart} className="footer-img" alt=""/> Buy
                  Now
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <div className="position-relative">
        <div className="shape overflow-hidden text-white">
          <svg
            viewBox="0 0 2880 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>

      <section className="section" id="features">
        <Container>
          <Row>
            <Col sm={12} className="text-center">
              <h2 className="title text-dark">Available Demos</h2>
              {/* <!-- <p className="title-alt">Looks beautiful & ultra-sharp on Retina Screen Displays. Retina Icons, Fonts & all <br/> others graphics are optimized.</p> --> */}
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={4} md={6}>
              <div className="demo-box">
                <Link to="/landing/index1" target="_blank">
                  <img src={index1} alt="demo-img" className="img-responsive" />
                </Link>

                <h4>Index 1</h4>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="demo-box">
                <Link to="/landing/index2" target="_blank">
                  <img src={index2} alt="demo-img" className="img-responsive" />
                </Link>

                <h4>Index 2</h4>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="demo-box">
                <Link to="/landing/index3" target="_blank">
                  <img src={index3} alt="demo-img" className="img-responsive" />
                </Link>

                <h4>Index 3</h4>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="demo-box">
                <Link to="/landing/index4" target="_blank">
                  <img src={index4} alt="demo-img" className="img-responsive" />
                </Link>

                <h4>Index 4</h4>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="demo-box">
                <Link to="/landing/index5" target="_blank">
                  <img src={index5} alt="demo-img" className="img-responsive" />
                </Link>

                <h4>Index 5</h4>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="demo-box">
                <Link to="/landing/index6" target="_blank">
                  <img src={index6} alt="demo-img" className="img-responsive" />
                </Link>

                <h4>Index 6</h4>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <div className="position-relative">
        <div className="shape overflow-hidden text-footer">
          <svg
            viewBox="0 0 2880 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z"
              fill="#343a40"
            ></path>
          </svg>
        </div>
      </div>

      <footer className="bg-dark footer-one">
        <div className="footer-one-alt">
          <Container>
            <Row>
              <Col sm={6}>
                <p className="m-b-0 font-13 copyright">
                  © {year}{" "}
                  Appexy. Design & Develop by Coderthemes
                </p>
              </Col>
              <Col sm={6}>
                <ul className="list-inline footer-social-one m-b-0 float-right">
                  <li className="list-inline-item">
                    <Link
                      to="https://www.facebook.com/coderthemes"
                      target="_blank"
                    >
                      <img src={facebook} className='footer-img'  alt="" />
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="https://twitter.com/coder_themes" target="_blank">
                    <img src={twitter} className='footer-img' alt="" />
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link
                      to="https://www.linkedin.com/in/coderthemes/"
                      target="_blank"
                    >
                      <img src={linkedin} className='footer-img' alt="" />
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="https://dribbble.com/coderthemes" target="_blank">
                    <img src={dribbble} className='footer-img' alt="" />
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <a href="skype:coderthemes" rel="noreferrer" target="_blank">
                    <img src={skype}  className='footer-img' alt="" />
                    </a>
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </div>
      </footer>
    </>
  );
};

export default Home;
