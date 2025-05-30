//images
import user1 from "../assets/images/users/user-1.jpg";
import dribbble from "../assets/images/brand-logo/dribbble.png";
import insta from "../assets/images/brand-logo/insta.png";
import bootstrap from "../assets/images/brand-logo/bootstrap.png";
import jquery from "../assets/images/brand-logo/jquery.png";
import { Col, Container, Row } from "react-bootstrap";

const Testimonial = () => {
  return (
    <section className="section bg-light" id="testimonial">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              Our <span className="fw-bold">Testimonial</span>
            </h6>
            <h2 className="title">What Our Customers Say</h2>
            <p className="text-muted">
              Sed ut perspiciatis unde omnis iste natus error voluptatem
              accusantium doloremque rem aperiam.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="testimonial-box text-center">
              <p className="text-muted mb-2">
                “Itaque earum us tenetur sapiente delectus asperiores repellat.”
              </p>
              <h5 className="fs-18 fw-semibold lh-base mb-4 pb-3">
                At vero eos et accusamus iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atqued corrupti as
                quos dolores quas molestias excepturi occaecati provident.
              </h5>
              <img
                src={user1}
                alt=""
                className="shadow rounded-circle"
                width="70"
              />
              <h5 className="fs-18 fw-semibold mt-4 mb-0">Mayra Vasquez</h5>
              <p className="text-muted fs-14">Web Development, USA</p>
            </div>
          </Col>
        </Row>

        <Row className="mt-md-5">
          <Col sm={6} md={3}>
            <div className="text-center py-3">
              <img src={dribbble} alt="" height="40" />
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="text-center py-3">
              <img src={insta} alt="" height="40" />
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="text-center py-3">
              <img src={bootstrap} alt="" height="40" />
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="text-center py-3">
              <img src={jquery} alt="" height="40" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Testimonial;
