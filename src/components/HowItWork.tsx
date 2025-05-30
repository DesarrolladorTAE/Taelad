//images
import arrowTop from "../assets/images/arrow-top.png";
import arrowBottom from "../assets/images/arrow-bottom.png";

import { Col, Container, Row } from "react-bootstrap";
const HowItWork = () => {
  return (
    <section className="section">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              How it <span className="fw-bold">Work</span>
            </h6>
            <h2 className="title">How dose it work ?</h2>
            <p className="text-muted">
              Sed ut perspiciatis unde omnis iste natus error voluptatem
              accusantium doloremque rem aperiam.
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={4}>
            <div className="work-box px-lg-5 text-center mb-5 mb-lg-0">
              <div className="work-icon bg-soft-primary mb-4">
                <i className="mdi mdi-format-list-bulleted"></i>
              </div>
              <h5 className="fw-semibold">1. Intuitive visual editor</h5>
              <p className="text-muted">
                Nemo enim ipsam quia voluptas sit aspernatur ist dolores.
              </p>
              <img src={arrowTop} alt="" className="work-arrow" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="work-box px-lg-5 text-center mb-5 mb-lg-0">
              <div className="work-icon bg-soft-success mb-4">
                <i className="mdi mdi-palette-outline"></i>
              </div>
              <h5 className="fw-semibold">2. Huge design collection</h5>
              <p className="text-muted">
                Nemo enim ipsam quia voluptas sit aspernatur ist dolores.
              </p>
              <img src={arrowBottom} alt="" className="work-arrow" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="work-box px-lg-5 text-center mb-5 mb-lg-0">
              <div className="work-icon bg-soft-warning mb-4">
                <i className="mdi mdi-layers-triple"></i>
              </div>
              <h5 className="fw-semibold">3. One click installation</h5>
              <p className="text-muted">
                Nemo enim ipsam quia voluptas sit aspernatur ist dolores.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HowItWork;
