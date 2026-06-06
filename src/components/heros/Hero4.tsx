import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
//images
import hero4Img from "../../assets/images/heros/hero-4-img.png";
const Hero4 = () => {
  return (
    <section className="hero-4">
      <div className="bg-overlay-img"></div>
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <div className="avatar avatar-xl rounded-circle bg-soft-light text-white shadow-sm mb-4">
              <i className="mdi mdi-shield-lock mb-0 h2"></i>
            </div>
            <h1 className="hero-title text-white fw-bold mb-4 display-5">
              Secure Your <span className="text-primary">Payment</span>{" "}
              Application
            </h1>
            <p className="text-white-50 mb-4 pb-2 fs-17">
              Maecenas tempus, tellus eget condimentum rhoncus quam semper
              libero sit amet adipiscing sem neque sed.
            </p>
            <p className="text-white-50 mb-2">
              <i className="mdi mdi-lock-check fs-20 me-2 text-success"></i>{" "}
              Nemo enim ipsam voluptatem voluptas aspernatur.
            </p>
            <p className="text-white-50 mb-5">
              <i className="mdi mdi-lock-check fs-20 me-2 text-success"></i>{" "}
              Quis autem vel eum iure reprehenderit.
            </p>
            {/* <p className="text-white-50 mb-5"><i className="mdi mdi-lock-check fs-20 me-2 text-success"></i> At vero eos et accusamus et iusto odio dignissimos.</p> */}
            <Link to="#" className="btn btn-lg btn-primary">
              Get Started{" "}
              <i className="mdi mdi-arrow-right-thin ms-1 fs-22 right-arrow"></i>
            </Link>
          </Col>

          <Col lg={6}>
            <div className="mt-5 mt-lg-0">
              <img
                src={hero4Img}
                alt=""
                className="img-fluid d-block mx-auto"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero4;
