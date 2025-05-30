import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Carousel from "react-bootstrap/Carousel";

//images
import hero6Bg1 from "../../assets/images/heros/hero-6-bg-1.jpg";
import hero6Bg2 from "../../assets/images/heros/hero-6-bg-2.jpg";
import hero6Bg3 from "../../assets/images/heros/hero-6-bg-3.jpg";

const Hero6 = () => {
  return (
    <>
      <section className="hero-6 mb-5">
        <Carousel
          indicators={false}
          prevIcon={
            <button className="carousel-control-prev" type="button">
              <span
                className="hero-slider-arrow"
                style={{ marginLeft: "200px" }}
              >
                <i className="mdi mdi-arrow-left-thin"></i>
              </span>
            </button>
          }
          nextIcon={
            <button className="carousel-control-next" type="button">
              <span
                className="hero-slider-arrow"
                style={{ marginRight: "200px" }}
              >
                <i className="mdi mdi-arrow-right-thin"></i>
              </span>
            </button>
          }
          fade
          interval={5000}
          pause={false}
        >
          <Carousel.Item style={{ backgroundImage: `url(${hero6Bg1})` }}>
            <div className="bg-overlay"></div>
            <div className="text-center hero-content">
              <Container>
                <Row className="justify-content-center">
                  <Col mg={10} lg={8}>
                    <div className="bg-soft-light text-light avatar avatar-xl rounded-circle mx-auto mb-4">
                      <i className="mdi mdi-rocket-launch-outline fs-24"></i>
                    </div>
                    <h1 className="text-white display-4 fw-semibold mb-4">
                      Integrate Salesforce with The Apps You Use.
                    </h1>
                    <p className="text-white-50 mx-lg-5 mb-5">
                      At vero eos et accusamus et iusto odio dignissimos ducimus
                      qui blanditiis praesentium voluptatum deleniti atqued
                      corrupti quos dolores et quas molestias excepturi
                      sintoccaecati cupiditate.
                    </p>
                    <Link to="#" className="btn btn-lg btn-primary">
                      Get Started
                    </Link>
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>
          <Carousel.Item style={{ backgroundImage: `url(${hero6Bg2})` }}>
            <div className="bg-overlay"></div>
            <div className=" text-center hero-content">
              <Container>
                <Row className="justify-content-center">
                  <Col md={10} lg={8}>
                    <div className="bg-soft-light text-light avatar avatar-xl rounded-circle mx-auto mb-4">
                      <i className="mdi mdi-currency-usd fs-24"></i>
                    </div>
                    <h1 className="text-white display-4 fw-semibold mb-4">
                      Make Your Transactions even easier with Appexy
                    </h1>
                    <p className="text-white-50 mx-lg-5 mb-5">
                      At vero eos et accusamus et iusto odio dignissimos ducimus
                      qui blanditiis praesentium voluptatum deleniti atqued
                      corrupti quos dolores et quas molestias excepturi
                      sintoccaecati cupiditate.
                    </p>
                    <Link to="#" className="btn btn-lg btn-primary">
                      Get Started
                    </Link>
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>
          <Carousel.Item style={{ backgroundImage: `url(${hero6Bg3})` }}>
            <div className="bg-overlay"></div>
            <div className=" text-center hero-content">
              <Container>
                <Row className="justify-content-center">
                  <Col md={10} lg={8}>
                    <div className="bg-soft-light text-light avatar avatar-xl rounded-circle mx-auto mb-4">
                      <i className="mdi mdi-layers-triple-outline fs-24"></i>
                    </div>
                    <h1 className="text-white display-4 fw-semibold mb-4">
                      Manage all Your Finances Easily with Appexy
                    </h1>
                    <p className="text-white-50 mx-lg-5 mb-5">
                      At vero eos et accusamus et iusto odio dignissimos ducimus
                      qui blanditiis praesentium voluptatum deleniti atqued
                      corrupti quos dolores et quas molestias excepturi
                      sintoccaecati cupiditate.
                    </p>
                    <Link to="#" className="btn btn-lg btn-primary">
                      Get Started
                    </Link>
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>
        </Carousel>
      </section>
    </>
  );
};

export default Hero6;
