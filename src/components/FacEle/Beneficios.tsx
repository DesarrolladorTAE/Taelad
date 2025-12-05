import { Col, Container, Row } from "react-bootstrap";

const Bene = () => {
    return (
        <section className="section bg-light">
            <Container>
                <Row className="justify-content-center mb-5">
                    {/* <Col md={8} lg={6} className="text-center">
                        <h6 className="subtitle">
                            Soluciones de <span className="fw-bold">Facturación Electrónica</span>
                        </h6>
                        <h2 className="title">Cumple con las normativas del SAT de forma sencilla</h2>
                        <p className="text-muted">
                            Emite tus facturas electrónicas en formatos PDF y XML, cumpliendo con las versiones 3.3 y 4.0 del SAT. Nuestro sistema facilita la gestión fiscal de tu empresa.
                        </p>
                    </Col> */}
                </Row>

                <Row className="align-items-center">
                    {/* Reemplazo de la imagen por 2 videos */}
                    <Col lg={6}>
                        <div className="mb-4 ratio ratio-16x9">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/E_RYiUJOcas"
                                title="Video explicativo 1"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="ratio ratio-16x9">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/dljP4kXaEEw"
                                title="Video explicativo 2"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </Col>

                    <Col lg={5} className="offset-lg-1">
                        <h6 className="text-uppercase text-primary fw-bold mb-2">Beneficios</h6>
                        <h1 className="fs-38 mb-4">Conozca Nuestros Beneficios</h1>

                        <p className="text-muted mb-4">
                            Es la evolución de la factura tradicional, para efectos legales tiene la misma validez que el papel,
                            sin embargo, se genera, valida, expide, recibe, rechaza y conserva electrónicamente, lo que representa mayores ventajas.
                            Tributariamente es un soporte de transacciones de venta de bienes y/o servicios.
                        </p>

                        <ul className="list-unstyled text-muted mb-4">
                            {["Fácil acceso", "Publicidad", "Seguridad", "Control documental"].map((beneficio, idx) => (
                                <li className="mb-2 d-flex align-items-center" key={idx}>
                                    <i className="mdi mdi-check text-primary me-2 fs-5"></i> {beneficio}
                                </li>
                            ))}
                        </ul>
                    </Col>

                </Row>
            </Container>
        </section>
    );
};

export default Bene;
