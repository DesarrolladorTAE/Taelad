import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

//images
import iStore from "../assets/images/i-store.png";
import playStore from "../assets/images/play-store.png";

const Cta = () => {
  return (
    <section className="section">
      <Container>
        <Row className="justify-content-center">
          <Col md={10}>
            <div className="text-center">
              <h1 className="display-5 fw-bold mb-4">
                Available For Your <br />
                Smartphone.
              </h1>
              <p className="text-muted mx-auto mb-5 w-75">
                The wise man therefore always holds in these matters to this of
                selection he rejects pleasures to other greater that id pains to
                avoid worse.
              </p>
              <Link to="#" className="me-1">
                <img src={iStore} alt="" className="shadow" height="52" />
              </Link>
              <Link to="#">
                <img src={playStore} alt="" className="shadow" height="52" />
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cta;
