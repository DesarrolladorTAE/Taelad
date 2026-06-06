import logoLight from "../assets/images/logo-light.png";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const year = new Date().getFullYear().toString();

  return (
    <>
      <section className="footer bg-dark">
        <Container>
          <Row>
            <Col lg={3} className="text-center text-lg-start">
              <div className="footer-logo mb-4">
                <Link to="#">
                  <img src={logoLight} alt="" />
                </Link>
              </div>
              <Link to="#" className="text-white">
                Hello@coderthemes.com
              </Link>
              <p className="text-white">+01 ( 1234 567 890 )</p>

              <h5 className="fs-18 mb-3 text-white">Follow Us</h5>
              <ul className="list-inline mt-5">
                <li className="list-inline-item">
                  <Link to="#;" className="footer-social-icon">
                    <i className="mdi mdi-facebook"></i>
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link to="#;" className="footer-social-icon">
                    <i className="mdi mdi-twitter"></i>
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link to="#;" className="footer-social-icon">
                    <i className="mdi mdi-linkedin"></i>
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link to="#;" className="footer-social-icon">
                    <i className="mdi mdi-skype"></i>
                  </Link>
                </li>
              </ul>
            </Col>
            <Col lg={9}>
              <Row>
                <Col sm={6} md={3}>
                  <h5 className="fs-22 mb-3 fw-semibold text-white">
                    About Us
                  </h5>
                  <ul className="list-unstyled footer-nav">
                    <li>
                      <Link to="#;" className="footer-link">
                        Support Center
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Customer Support
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Copyright
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Popular Campaign
                      </Link>
                    </li>
                  </ul>
                </Col>
                <Col sm={6} md={3}>
                  <h5 className="fs-22 mb-3 fw-semibold text-white">
                    Our Information
                  </h5>
                  <ul className="list-unstyled footer-nav">
                    <li>
                      <Link to="#;" className="footer-link">
                        Return Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Site Map
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Store Hours
                      </Link>
                    </li>
                  </ul>
                </Col>
                <Col sm={6} md={3}>
                  <h5 className="fs-22 mb-3 fw-semibold text-white">
                    My Account
                  </h5>
                  <ul className="list-unstyled footer-nav">
                    <li>
                      <Link to="#;" className="footer-link">
                        Press Inquiries
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Social Media Directories
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Images & B-roll
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Permissions
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Speaker Requests
                      </Link>
                    </li>
                  </ul>
                </Col>
                <Col sm={6} md={3}>
                  <h5 className="fs-22 mb-3 fw-semibold text-white">Policy</h5>
                  <ul className="list-unstyled footer-nav">
                    <li>
                      <Link to="#;" className="footer-link">
                        Application Security
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Softwere Principles
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Unwanted Softwere Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="#;" className="footer-link">
                        Risponsible Supply Chain
                      </Link>
                    </li>
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
      <div className="footer-tagline">
        <Container>
          <Row className="justify-content-between py-2">
            <Col md={6}>
              <p className="text-white opacity-75 mb-0 fs-14">
                {year} © Appexy -{" "}
                <Link to="https://coderthemes.com/" className="text-white">
                  Coderthemes.com
                </Link>
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <Link to="#" className="text-white opacity-75 fs-14">
                Terms Conditions & Policy
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Footer;
