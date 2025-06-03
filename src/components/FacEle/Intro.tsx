// image
import { Col, Container, Row } from "react-bootstrap";
import features1 from "../assets/images/features-1.png";
import Factura from "../../assets/images/Tae/4911345.jpg";
import FacCelu from "../../assets/images/FE/FacCelu.png"

const Features1 = () => {
    return (
        <section className="section bg-light">
            <Container>
                <Row className="justify-content-center mb-5">
                    <Col md={8} lg={6} className="text-center">
                        {/* <h6 className="subtitle">
                            Soluciones de <span className="fw-bold">Facturación Electrónica</span>
                        </h6> */}
                        <h2 className="title">
                            Accede a nuestro sistema
                        </h2>
                        {/* <p className="text-muted">
                            Emite tus facturas electrónicas en formatos PDF y XML, cumpliendo con las versiones 3.3 y 4.0 del SAT. Nuestro sistema facilita la gestión fiscal de tu empresa.
                        </p> */}
                    </Col>
                </Row>

                <Row className="align-items-center">
                    <Col lg={6}>
                        <img
                            src={FacCelu}
                            alt="Facturación Electrónica"
                            className="img-fluid mx-auto d-block"
                            style={{ maxWidth: '75%' }}
                        />

                    </Col>
                    <Col
                        lg={5}
                        className="offset-lg-1 d-flex flex-column align-items-start"
                        style={{ textAlign: "left" }}
                    >
                        <h1 className="fs-38 mb-4">Registrate aquí</h1>
                        <div className="mb-3" style={{ width: "100%" }}>
                            <p className="text-muted mb-0">
                                <span className="text-dark fw-bold">
                                    Conozca nuestra maravillosa forma de facturar
                                </span>
                            </p>
                        </div>
                        <div className="mt-4">
                            <a
                                href="#"
                                className="btn btn-gradient-primary btn-lg shadow-sm"
                                style={{ minWidth: 180 }}
                            >
                                Registrarse
                            </a>
                        </div>
                    </Col>



                </Row>
            </Container>
        </section>
    );
};

export default Features1;
