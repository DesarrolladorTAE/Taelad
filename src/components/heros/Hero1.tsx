import { Link } from "react-router-dom";
import hero1Img from "../../assets/images/heros/hero-1-img.png";
import Laptop from "../../assets/images/Tae/4110955-removebg-preview.png";
import hero1BottomShape from "../../assets/images/heros/hero-1-bottom-shape.png";
import { Container, Row, Col, Form } from "react-bootstrap";

const Hero1 = () => {
  return (
    <section className="hero-1" >
      <div className="bg-overlay-img"></div>
      <Container>
        <Row className="align-items-center hero-content">
          <Col lg={6}>
            <h1 className="hero-title fw-bold mb-4 pb-3 text-white">
              Desarrollo web, Tiendas en linea, Marketing digital, Sistema contable y de facturación
            </h1>
            <p className="text-white opacity-75 mb-4 pb-3 fs-17">
              Implementamos La Tecnología Para Hacer El Trabajo Diario Más Fácil, Creamos Sitios Web Únicos
              Y Diseñamos La Imagen Corporativa De Tu Negocio.
            </p>
            {/* <div className="subscribe-form me-lg-5 mb-5 mb-lg-0">
              <i className="mdi mdi-email-outline form-icon"></i>
              <Form.Control
                type="email"
                id="exampleFormControlInput1"
                placeholder="Enter Email Address"
              />
              <Link to="#" className="btn btn-success form-btn">
                <span>Download Now</span>{" "}
                <i className="mdi mdi-download download-icon"></i>
              </Link>
            </div> */}
          </Col>
          <Col lg={6} className=" text-center text-lg-end">
            <img src={Laptop} alt="" className="img-fluid" />
          </Col>
        </Row>
      </Container>
      <Container fluid>
        <Row>
          <Col>
            <div className="hero-bottom-shape">
              <img src={hero1BottomShape} alt="" className="w-100" />
            </div>
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col>
            {/* <div className="down-arrow-btn">
              <Link to="#how-it-work" className="down-arrow">
                <i className="mdi mdi-arrow-down"></i>
              </Link>
            </div> */}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero1;
