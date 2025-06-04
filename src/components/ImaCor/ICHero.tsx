import { Container, Row, Col } from "react-bootstrap";

//image
import hero3Img from "../../assets/images/heros/hero-3-img.png";
import { Link } from "react-router-dom";
import logoCreation from "../../assets/images/IC/logoCreation.png";

const Hero3 = () => {
  return (
    <section className="hero-3">
      <div className="bg-overlay-img"></div>
      <Container>
        <Row className="align-items-center hero-content">
          <Col lg={6}>
            <h1 className="hero-title fw-bold mb-4 display-4">
              Identidad corporativa
            </h1>
            <p className="opacity-75 mb-4 fs-17">
             Creamos logotipos en base a los estándares de calidad, con autenticidad en el diseño, para que puedas registrarlo como propiedad de tu marca.
            </p>

            {/* <p className="text-muted mb-2">
              <i className="mdi mdi-checkbox-marked-circle-outline text-success me-2"></i>{" "}
              Aenean leo ligula porttitor eu consequat vitae.
            </p>
            <p className="text-muted mb-2">
              <i className="mdi mdi-checkbox-marked-circle-outline text-success me-2"></i>{" "}
              Maecenas tempus tellus eget condimentum rhoncus quam.
            </p>
            <p className="text-muted mb-4 pb-3">
              <i className="mdi mdi-checkbox-marked-circle-outline text-success me-2"></i>{" "}
              Donec sodales sagittis as consequat.
            </p> */}
            {/* <Link to="#" className="btn btn-lg btn-primary">
              Get Started
            </Link> */}
          </Col>

          <Col lg={6}>
            <img src={logoCreation} alt="" className="img-fluid mt-5 mt-lg-0" />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero3;
