import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

//image
import hero2Img from "../../assets/images/heros/hero-2-img.png";

const Hero2 = () => {
  return (
    <section className="hero-2">
      <div className="bg-overlay-img"></div>
      <Container>
        <Row className="align-items-center justify-content-center hero-content">
          <Col lg={6}>
            <div className="avatar avatar-xl rounded-circle bg-soft-primary text-primary shadow-sm mb-4">
              <i className="mdi mdi-rocket-launch mb-0 h2"></i>
            </div>
            <h1 className="hero-title fw-bold mb-4 display-5">
              Manage Your Activity With{" "}
              <span className="text-primary">Appexy</span>
            </h1>
            <p className="opacity-75 mb-4 pb-3 fs-17">
              Maecenas tempus, tellus eget condimentum rhoncus quam semper
              libero sit amet adipiscing sem neque sed ipsum nam quam nunc
              blandit vel luctus pulvinar.
            </p>
            <Link to="#" className="btn btn-lg btn-gradient-primary me-1">
              Get Started Today
            </Link>
            <Link to="#" className="btn btn-lg btn-outline-dark">
              Download App
            </Link>
          </Col>

          <Col md={8} lg={5} className="offset-lg-1">
            <div className="hero-2-img mt-5 mt-lg-0">
              <img src={hero2Img} alt="" className="img-fluid rounded-lg" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero2;
