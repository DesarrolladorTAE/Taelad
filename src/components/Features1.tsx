//image
import { Col, Container, Row } from "react-bootstrap";
import features1 from "../assets/images/features-1.png";

const Features1 = () => {
  return (
    <section className="section bg-light" >
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              Our <span className="fw-bold">Features</span>
            </h6>
            <h2 className="title">Smart Solutions For Buys People</h2>
            <p className="text-muted">
              Sed ut perspiciatis unde omnis iste natus error voluptatem
              accusantium doloremque rem aperiam.
            </p>
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col lg={6}>
            <img
              src={features1}
              alt=""
              className="img-fluid d-block mx-auto ms-lg-auto"
            />
          </Col>
          <Col lg={5} className="offset-lg-1">
            <h1 className="fs-38 mb-4">Discover your destination</h1>
            <p className="text-muted">
              On the other hand, we denounce with righteous indignation so
              blinded that they cannot.
            </p>

            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-check"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">
                    The wise a therefore always holds
                  </span>{" "}
                  in us matters to this principle a selection a rejects
                  pleasures.
                </p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-layers-outline"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  Sed perspiciatis omnis a{" "}
                  <span className="text-dark fw-bold">
                    natus error accusantium doloremque
                  </span>{" "}
                  laudantium tota rem aperiam eaque ipsa quae illo inventore.
                </p>
              </div>
            </div>

            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-lock-outline"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  Et sit{" "}
                  <span className="text-dark fw-bold">
                    quidem rerum facilis as expedita
                  </span>{" "}
                  distinctio am libero tempore cum{" "}
                  <span className="text-dark fw-bold">soluta nobis est</span>{" "}
                  eligendi optio cumque nihil impedit quo minus.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features1;
