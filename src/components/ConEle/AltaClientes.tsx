import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { FaCheckCircle, FaCloud, FaLock, FaUserPlus } from "react-icons/fa";

const inputStyle = {
    border: "1px solid #dbe4ff",
    borderRadius: "8px",
    minHeight: "48px",
};

const AltaClientes = () => {
    return (
        <section className="section bg-light" id="alta-clientes">
            <Container>
                <Row className="align-items-center g-4">
                    <Col lg={5}>
                        <div className="avatar avatar-xl rounded-circle bg-soft-primary text-primary shadow-sm mb-4">
                            {(FaUserPlus as any)({ size: 30 })}
                        </div>
                        <h6 className="subtitle mb-2">
                            Alta de <span className="fw-bold">clientes</span>
                        </h6>
                        <h2 className="title mb-3">
                            Crea tu acceso a TAEConta en minutos
                        </h2>
                        <p className="text-muted fs-17 mb-4">
                            Registra los datos de tu empresa y comienza a trabajar con
                            tu contabilidad electronica desde la nube.
                        </p>

                        <div className="d-flex align-items-start mb-3">
                            <div className="contact-icon bg-soft-primary text-primary me-3">
                                {(FaCloud as any)({ size: 18 })}
                            </div>
                            <div>
                                <h5 className="fs-18 mb-1">Acceso en la nube</h5>
                                <p className="text-muted mb-0">
                                    Consulta tu informacion desde cualquier navegador.
                                </p>
                            </div>
                        </div>

                        <div className="d-flex align-items-start">
                            <div className="contact-icon bg-soft-success text-success me-3">
                                {(FaCheckCircle as any)({ size: 18 })}
                            </div>
                            <div>
                                <h5 className="fs-18 mb-1">Datos listos para el alta</h5>
                                <p className="text-muted mb-0">
                                    Usuario, correo, RFC y razon social en un solo paso.
                                </p>
                            </div>
                        </div>
                    </Col>

                    <Col lg={7}>
                        <Card className="rounded-lg shadow-lg border-0">
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="avatar avatar-lg rounded-circle bg-soft-primary text-primary me-3">
                                        {(FaLock as any)({ size: 18 })}
                                    </div>
                                    <div>
                                        <h3 className="fs-24 fw-bold mb-1">Formulario de alta</h3>
                                        <p className="text-muted mb-0">
                                            Completa la informacion para activar el cliente.
                                        </p>
                                    </div>
                                </div>

                                <Form
                                    method="POST"
                                    action="https://taeconta.tecnologiasadministrativas.com/mb/demo/altaDemo"
                                    className="vstack gap-3"
                                >
                                    <fieldset>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="user">
                                                    <Form.Label>Usuario</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="user"
                                                        placeholder="usuario"
                                                        required
                                                        style={inputStyle}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="pass">
                                                    <Form.Label>Contrasena</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="pass"
                                                        placeholder="contrasena"
                                                        required
                                                        style={inputStyle}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="correo">
                                                    <Form.Label>Correo</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="correo"
                                                        placeholder="Correo de contacto"
                                                        required
                                                        style={inputStyle}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="rfc">
                                                    <Form.Label>RFC</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="rfc"
                                                        placeholder="AAAAXXXXXXBBB"
                                                        required
                                                        style={inputStyle}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12}>
                                                <Form.Group className="mb-4" controlId="razon">
                                                    <Form.Label>Razon social</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="razon"
                                                        placeholder="Razon social"
                                                        required
                                                        style={inputStyle}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="d-grid">
                                            <button className="btn btn-gradient-primary btn-lg" type="submit" value="Alta">
                                                Dar de alta cliente
                                            </button>
                                        </div>
                                    </fieldset>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AltaClientes;
