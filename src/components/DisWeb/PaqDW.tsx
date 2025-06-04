import { Col, Container, Nav, NavLink, Row, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";

const Pricing = () => {
    return (
        <section className="section" >
            <Container>
                <Row className="justify-content-center mb-5">
                    <Col md={8} lg={6} className="text-center">
                        <h6 className="subtitle">
                            Our <span className="fw-bold">Pricing</span>
                        </h6>
                        <h2 className="title">Pricing Plan</h2>
                        <p className="text-muted">
                            Sed ut perspiciatis unde omnis iste natus error voluptatem
                            accusantium doloremque rem aperiam.
                        </p>
                    </Col>
                </Row>

                <Tab.Container defaultActiveKey="monthly">
                    <Row>
                        <Col>
                            <Nav variant="pills" className="pricing-tab mb-4">
                                <Nav.Item as="li" className="me-2">
                                    <NavLink eventKey="monthly">Monthly</NavLink>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <NavLink eventKey="yearly">Yearly</NavLink>
                                </Nav.Item>
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane className="fade" eventKey="monthly">
                                    <Row>
                                        <Col lg={4}>
                                            <div className="pricing-box">
                                                <div className="text-center mb-4 bg-light p-4 rounded">
                                                    <h5>Free</h5>
                                                    <h1 className="mt-3 mb-0 text-primary">
                                                        $0.00
                                                        <span className="text-muted fs-16 fw-normal">
                                                            {" "}
                                                            /Month
                                                        </span>
                                                    </h1>
                                                </div>
                                                <ul className="list-unstyled text-secondary mb-5 pt-2">
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">3</span>{" "}
                                                        Projects
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">580GB</span>{" "}
                                                        Storage
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">
                                                            Unlimited
                                                        </span>{" "}
                                                        Contacts
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">5</span>{" "}
                                                        Domains
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i> Free Support{" "}
                                                        <span className="fw-semibold text-dark">24/7</span>
                                                    </li>
                                                </ul>
                                                <Link to="#" className="btn btn-gradient-primary w-100">
                                                    Choose Plan
                                                </Link>
                                            </div>
                                        </Col>
                                        <Col lg={4}>
                                            <div className="pricing-box">
                                                <span className="pricing-badge">Most Popular</span>
                                                <div className="text-center mb-4 bg-light p-4 rounded">
                                                    <h5>Standard</h5>
                                                    <h1 className="mt-3 mb-0 text-primary">
                                                        $29.00
                                                        <span className="text-muted fs-16 fw-normal">
                                                            {" "}
                                                            /Month
                                                        </span>
                                                    </h1>
                                                </div>
                                                <ul className="list-unstyled text-secondary mb-5 pt-2">
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">10</span>{" "}
                                                        Projects
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">1TB</span>{" "}
                                                        Storage
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">
                                                            Unlimited
                                                        </span>{" "}
                                                        Contacts
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">12</span>{" "}
                                                        Domains
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i> Free Support{" "}
                                                        <span className="fw-semibold text-dark">24/7</span>
                                                    </li>
                                                </ul>
                                                <Link to="#" className="btn btn-gradient-primary w-100">
                                                    Choose Plan
                                                </Link>
                                            </div>
                                        </Col>
                                        <Col lg={4}>
                                            <div className="pricing-box">
                                                <div className="text-center mb-4 bg-light p-4 rounded">
                                                    <h5>Enterprice</h5>
                                                    <h1 className="mt-3 mb-0 text-primary">
                                                        $49.00
                                                        <span className="text-muted fs-16 fw-normal">
                                                            {" "}
                                                            /Month
                                                        </span>
                                                    </h1>
                                                </div>
                                                <ul className="list-unstyled text-secondary mb-5 pt-2">
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">20</span>{" "}
                                                        Projects
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">2.5TB</span>{" "}
                                                        Storage
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">
                                                            Unlimited
                                                        </span>{" "}
                                                        Contacts
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">18</span>{" "}
                                                        Domains
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i> Free Support{" "}
                                                        <span className="fw-semibold text-dark">24/7</span>
                                                    </li>
                                                </ul>
                                                <Link to="#" className="btn btn-gradient-primary w-100">
                                                    Choose Plan
                                                </Link>
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                <Tab.Pane className="fade" eventKey="yearly">
                                    <Row>
                                        <Col lg={4}>
                                            <div className="pricing-box">
                                                <div className="text-center mb-4 bg-light p-4 rounded">
                                                    <h5>Basic</h5>
                                                    <h1 className="mt-3 mb-0 text-primary">
                                                        $39.00
                                                        <span className="text-muted fs-16 fw-normal">
                                                            {" "}
                                                            /Year
                                                        </span>
                                                    </h1>
                                                </div>
                                                <ul className="list-unstyled text-secondary mb-5 pt-2">
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">15</span>{" "}
                                                        Projects
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">3TB</span>{" "}
                                                        Storage
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">
                                                            Unlimited
                                                        </span>{" "}
                                                        Contacts
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">20</span>{" "}
                                                        Domains
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i> Free Support{" "}
                                                        <span className="fw-semibold text-dark">24/7</span>
                                                    </li>
                                                </ul>
                                                <Link to="#" className="btn btn-gradient-primary w-100">
                                                    Choose Plan
                                                </Link>
                                            </div>
                                        </Col>
                                        <Col lg={4}>
                                            <div className="pricing-box">
                                                <span className="pricing-badge">Most Popular</span>
                                                <div className="text-center mb-4 bg-light p-4 rounded">
                                                    <h5>Standard</h5>
                                                    <h1 className="mt-3 mb-0 text-primary">
                                                        $79.00
                                                        <span className="text-muted fs-16 fw-normal">
                                                            {" "}
                                                            /Year
                                                        </span>
                                                    </h1>
                                                </div>
                                                <ul className="list-unstyled text-secondary mb-5 pt-2">
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">32</span>{" "}
                                                        Projects
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">6TB</span>{" "}
                                                        Storage
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">
                                                            Unlimited
                                                        </span>{" "}
                                                        Contacts
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">35</span>{" "}
                                                        Domains
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i> Free Support{" "}
                                                        <span className="fw-semibold text-dark">24/7</span>
                                                    </li>
                                                </ul>
                                                <Link to="#" className="btn btn-gradient-primary w-100">
                                                    Choose Plan
                                                </Link>
                                            </div>
                                        </Col>
                                        <Col lg={4}>
                                            <div className="pricing-box">
                                                <div className="text-center mb-4 bg-light p-4 rounded">
                                                    <h5>Enterprice</h5>
                                                    <h1 className="mt-3 mb-0 text-primary">
                                                        $99.00
                                                        <span className="text-muted fs-16 fw-normal">
                                                            {" "}
                                                            /Year
                                                        </span>
                                                    </h1>
                                                </div>
                                                <ul className="list-unstyled text-secondary mb-5 pt-2">
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">50</span>{" "}
                                                        Projects
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">10TB</span>{" "}
                                                        Storage
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">
                                                            Unlimited
                                                        </span>{" "}
                                                        Contacts
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i>{" "}
                                                        <span className="fw-semibold text-dark">55</span>{" "}
                                                        Domains
                                                    </li>
                                                    <li className="my-3">
                                                        <i className="mdi mdi-check me-1"></i> Free Support{" "}
                                                        <span className="fw-semibold text-dark">24/7</span>
                                                    </li>
                                                </ul>
                                                <Link to="#" className="btn btn-gradient-primary w-100">
                                                    Choose Plan
                                                </Link>
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
        </section>
    );
};

export default Pricing;
