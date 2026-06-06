import { Col, Container, Row } from "react-bootstrap";

const folioPlans = [
    { title: "10 Folios", price: "$140", free: false },
    { title: "25 Folios", price: "$250", free: false },
    { title: "50 Folios", price: "$300", free: false },
    { title: "100 Folios", price: "$500", free: false },
];

const Pricing = () => {
    return (
        <section className="section bg-gradient" style={{ background: 'linear-gradient(to top, #2ebef9, #4facfe)' }}>
            <Container>
                <Row className="justify-content-center mb-5">
                    <Col md={8} lg={6} className="text-center">
                        <h2 className="fw-bold">Planes de Folios</h2>
                        <p className="text-light">
                            La vigencia de cada plan es de <strong>12 meses</strong>.
                        </p>
                    </Col>
                </Row>

                <Row className="justify-content-center g-4">
                    {folioPlans.map((plan, idx) => (
                        <Col xs={12} sm={6} md={4} lg={2} key={idx}>
                            <div className="bg-white rounded p-4 text-center shadow-sm h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <h5 className="fw-bold">{plan.title}</h5>
                                    <h2 className="text-dark my-3">{plan.price}</h2>
                                    <i className="ri-file-text-line text-primary fs-3 mb-2"></i>
                                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        La vigencia de los folios<br />es de 12 meses
                                    </p>
                                </div>
                                <div>
                                    {plan.free ? (
                                        <button className="btn btn-secondary w-100" disabled>
                                            ¡GRATIS!
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => window.open("https://taeconta.com/property", "_blank")}
                                        >
                                            PAGAR
                                        </button>

                                    )}
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Pricing;
