import { Col, Row, Container } from "react-bootstrap";
import features2 from "../assets/images/features-2.png";

const Features2 = () => {
  return (
    <section className="section bg-light features-bg">
      <Container>
        <Row className="align-items-center">
          <Col lg={5}>
            <h1 className="fs-38 mb-4">Connecting people, Places</h1>
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

          <Col lg={5} className="offset-lg-1">
            <img
              src={features2}
              alt=""
              className="img-fluid d-block mx-auto ms-lg-auto"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features2;
