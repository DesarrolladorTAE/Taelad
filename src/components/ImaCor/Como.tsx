import { Col, Container, Row } from "react-bootstrap";
import {
    FaPenNib,
    FaBookOpen,
    FaCheckCircle
} from "react-icons/fa";

const HowItWork = () => {
    return (
        <section style={{ backgroundColor: "#2156b1", color: "white", padding: "80px 0" }}>
            <Container>
                <Row className="justify-content-center mb-5 text-center">
                    <Col lg={10}>
                        <h2 className="fw-bold display-5 mb-3">Diseño Auténtico</h2>
                        <p className="fs-5">
                            Nuestro equipo de profesionales en Diseño Gráfico te brindará la asesoría necesaria para que aterrices la idea de tu logotipo.
                        </p>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col md={4} className="mb-4">
                        {(FaPenNib as any)({
                            size: 50,
                            className: "mb-3"
                        })}
                        <h5 className="fw-bold">Diseño Profesional</h5>
                        <p>
                            Se entrega el diseño original en vector, con formatos EPS, PDF, JPG y PNG por mencionar algunos.
                        </p>
                    </Col>

                    <Col md={4} className="mb-4">
                        {(FaBookOpen as any)({
                            size: 50,
                            className: "mb-3"
                        })}
                        <h5 className="fw-bold">Manual de Identidad</h5>
                        <p>
                            Un breve manual donde se brindan sugerencias técnicas para el uso y la impresión del logotipo.
                        </p>
                    </Col>

                    <Col md={4} className="mb-4">
                        {(FaCheckCircle as any)({
                            size: 50,
                            className: "mb-3"
                        })}
                        <h5 className="fw-bold">Funcional</h5>
                        <p>
                            Realizamos las versiones necesarias para su adaptación en impresiones de notas de venta o facturas.
                        </p>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default HowItWork;
