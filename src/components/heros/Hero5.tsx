import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

//images
import heroBottomShape from "../../assets/images/hero-bottom-shape.png";
import hero5Img from "../../assets/images/heros/hero-5-img.png";

const Hero5 = () => {
  return (
    <>
      <section className="hero-5 bg-light">
        <Container>
          <Row className="justify-content-center text-center hero-content">
            <Col lg={8}>
              <h1 className="hero-title fw-bold mb-4 display-4">
                Let's <span className="text-primary">Build Your Products</span>{" "}
                by Appexy App.
              </h1>
              <p className="opacity-75 mb-4 pb-3 fs-17">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores quas molestias excepturi similique sintnonprovidente
                sunt in culpa.
              </p>
              <Link to="#" className="btn btn-lg btn-gradient-primary">
                Let's Started
              </Link>
            </Col>
          </Row>
        </Container>
        <div className="bottom-shape position-absolute bottom-0 start-0 end-0">
          <img src={heroBottomShape} alt="" className="w-100" />
        </div>
      </section>

      <div className="hero-5-img">
        <Container>
          <Row className="justify-content-center hero-content">
            <Col lg={10}>
              <div className="hero-5-img-content">
                <img
                  src={hero5Img}
                  alt=""
                  className="img-fluid d-block mx-auto"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Hero5;
