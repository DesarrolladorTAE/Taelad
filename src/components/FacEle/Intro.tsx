import { useState } from "react";
import { Col, Container, Row, Form, Button } from "react-bootstrap";
import FacCelu from "../../assets/images/FE/FacCelu.png";

const Features1 = () => {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("https://taeconta.com/api/public/api/iniciar-sesion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Error al iniciar sesión");

            const newWindow = window.open("https://taeconta.com/panel", "_blank");
            if (newWindow) {
                setTimeout(() => {
                    newWindow.postMessage({ type: "loginResponse", data }, "*");
                    console.log("Mensaje enviado:", data);
                }, 1000);
            } else {
                alert("No se pudo abrir la ventana del panel");
            }
        } catch (error: any) {
            alert("Error: " + error.message);
        }
    };

    return (
        <section className="section bg-light">
            <Container>
                <Row className="justify-content-center mb-5">
                    <Col md={8} lg={6} className="text-center">
                        <h2 className="title">Accede a nuestro sistema</h2>
                    </Col>
                </Row>

                <Row className="align-items-center gx-1">
                    <Col lg={6}>
                        <img
                            src={FacCelu}
                            alt="Facturación Electrónica"
                            className="img-fluid mx-auto d-block"
                            style={{ maxWidth: "75%" }}
                        />
                    </Col>

                    <Col lg={5} className="offset-lg-1">
                        <h1 className="fs-38 mb-4">Inicie sesión aquí</h1>
                        <Form onSubmit={handleLogin}>
                            <Form.Group controlId="correo_field" className="mb-3">
                                <Form.Label>Correo</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="correo"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="contrasena_field" className="mb-3">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="contraseña"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button type="submit" className="btn btn-gradient-primary btn-lg shadow-sm" style={{ minWidth: 180 }}>
                                Entrar
                            </Button>
                        </Form>

                        <p className="text-muted mt-4">
                            <span className="text-dark fw-bold">
                                ¿No tienes cuenta?
                            </span>{" "}
                            <a
                                href="https://taeconta.com/autenticacion/crear-cuenta"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Regístrate aquí
                            </a>
                        </p>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Features1;
