import helloIcon from "../assets/images/hello-icon.png";
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Card } from "react-bootstrap";

const Contact = () => {
  return (
    <section className="section bg-light" id="contact">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              Our <span className="fw-bold">Contact Us</span>
            </h6>
            <h2 className="title">Get in Touch</h2>
            <p className="text-muted">
              Sed ut perspiciatis unde omnis iste natus error voluptatem
              accusantium doloremque rem aperiam.
            </p>
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col lg={4}>
            <div className="d-flex align-items-center mb-5">
              <div className="flex-shrink-0">
                <img src={helloIcon} alt="..." height="80" className="" />
              </div>
              <div className="flex-grow-1 ms-3">
                <h2 className="mb-0">Say Hello!</h2>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="contact-icon bg-soft-primary text-primary">
                    <i className="mdi mdi-email"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="mb-0 fs-18">Email</h5>
                </div>
              </div>
              <p className="mb-1">
                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i>
                <Link to="#" className="text-secondary">
                  JuanaMRush@jourrapide.com
                </Link>
              </p>
              <p className="">
                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i>
                <Link to="#" className="text-secondary">
                  BrandonDBrown@jourrapide.com
                </Link>
              </p>
            </div>
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="contact-icon bg-soft-primary text-primary">
                    <i className="mdi mdi-phone"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="mb-0 fs-18">Phone</h5>
                </div>
              </div>
              <p className="mb-1">
                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i>
                <Link to="#" className="text-secondary">
                  (+01) 1234 5678 00
                </Link>
              </p>
              <p className="">
                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i>
                <Link to="#" className="text-secondary">
                  (+01) 1234 5678 90
                </Link>
              </p>
            </div>
            <div className="">
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="contact-icon bg-soft-primary text-primary">
                    <i className="mdi mdi-google-maps"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="mb-0 fs-18">Address</h5>
                </div>
              </div>
              <h5 className="fs-16 mb-2 text-secondary">
                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i> New
                York Office
              </h5>
              <p className="text-muted lh-base">
                331 Maple Street, Monroe Avenue, CA 90017
              </p>
              <h5 className="fs-16 mb-2 text-secondary">
                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i>{" "}
                Anguilla Office
              </h5>
              <p className="text-muted lh-base mb-0">
                2118 Bird Spring, Creek Road, TX 77388
              </p>
            </div>
          </Col>
          <Col lg={7} className="offset-lg-1">
            <Card className="contact-form rounded-lg mt-4 mt-lg-0">
              <Card.Body className="p-5">
                <Form>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="formFirstName">
                          First Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="formFirstName"
                          placeholder="Your first name..."
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="formLastName">
                          Last Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="formLastName"
                          placeholder="Last first name..."
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="formEmail">
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          id="formEmail"
                          placeholder="Your email..."
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="formPhone">
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          id="formPhone"
                          placeholder="Type phone number..."
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6} lg={12}>
                      <div className="mb-3">
                        <Form.Label htmlFor="formSubject">Subject</Form.Label>
                        <Form.Control
                          type="text"
                          id="formSubject"
                          placeholder="Type subject..."
                          required
                        />
                      </div>
                    </Col>
                    <Col>
                      <div className="mb-4">
                        <Form.Label htmlFor="formMessages">Messages</Form.Label>
                        <Form.Control
                          as="textarea"
                          style={{ height: "100px" }}
                          id="formMessages"
                          placeholder="Type messages..."
                          required
                        ></Form.Control>
                      </div>
                    </Col>
                  </Row>
                  <button type="submit" className="btn btn-gradient-danger">
                    Send Messages <i className="mdi mdi-send ms-1"></i>
                  </button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Contact;
