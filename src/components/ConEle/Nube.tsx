import { Container, Row, Col, Button } from "react-bootstrap";
import nube from "../../assets/images/CE/nube.webp";
import logo from "../../assets/images/CE/TAECONTA-HORIZONTAL-600x227.webp";

const TecnologiaNube = () => {
    return (
        <section className="py-5 bg-white">
            <Container>
                {/* Sección superior */}
                <Row className="align-items-center mb-5">
                    <Col md={4} className="text-center mb-4 mb-md-0">
                        <img
                            src={nube}
                            alt="Tecnología en la nube"
                            className="img-fluid"
                            style={{ maxHeight: "200px" }}
                        />
                    </Col>
                    <Col md={8}>
                        <h2 className="fw-bold text-primary mb-3">Tecnología en Nube</h2>
                        <p className="text-muted fs-5">
                            El sistema contable te permite accesar desde cualquier navegador de internet,
                            optimizado para su uso en computadora, laptop o tableta.
                        </p>
                    </Col>
                </Row>

                {/* Sección inferior */}
                <Row className="justify-content-center align-items-center gx-3">
                    <Col md={5} className="text-center mb-4 mb-md-0">
                        <h2 className="fw-bold text-primary">Tecnología en Nube</h2>
                        <a
                            href="https://wa.me/5217442188925?text=Hola%2C%20quiero%20más%20información%20sobre%20TAEConta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-lg mt-3 px-4"
                        >
                            Más información
                        </a>

                    </Col>
                    <Col md={5} className="text-center">
                        <img
                            src={logo}
                            alt="TAECONTA logo"
                            style={{ maxHeight: "90px" }}
                            className="img-fluid"
                        />
                    </Col>
                </Row>

            </Container>
        </section>
    );
};

export default TecnologiaNube;
