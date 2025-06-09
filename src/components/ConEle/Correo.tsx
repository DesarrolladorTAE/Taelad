import helloIcon from "../../assets/images/hello-icon.png";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

type ContactForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
};

const Contact = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ContactForm>();

    const onSubmit = (data: ContactForm) => {
        console.log(data); // listo para backend
        alert("✅ Mensaje enviado con éxito");
        enviarCorro(data)
    };

    const enviarCorro = (data: ContactForm) => {
        // Aquí defines los valores fijos
        const correoProp = "contacto@tecnologiasadministrativas.com";
        const pagina = "Landing TAE";
        const nombreProp = "Raul Alvarez";

        // Mapeas al formato esperado
        const payload = {
            nombre: data.firstName,
            correo: data.email,
            mensaje: data.message,
            nombreProp: nombreProp,
            correoProp: correoProp,
            pagina: pagina,
            telefono: data.phone ? data.phone : null
        };

        axios.post(
            'https://taeconta.com/api/public/api/correos/publicos',
            payload
        )
            .then((data) => {
                console.log('Respuesta de correo: ', data)
                reset();
            }).catch((e) => {
                console.log('Error: ', e)
            });
    }


    return (
        <section className="section bg-light" id="contact">
            <Container>
                <Row className="justify-content-center mb-5">
                    <Col md={8} lg={6} className="text-center">
                        <h6 className="subtitle">
                            Nuestro <span className="fw-bold">Contacto</span>
                        </h6>
                        <h2 className="title">Ponte en contacto</h2>
                        <p className="text-muted">
                            Mediante correo electrónico
                        </p>
                    </Col>
                </Row>
                <Row className="align-items-center">
                    <Col lg={4}>
                        <div className="d-flex align-items-center mb-5">
                            <div className="flex-shrink-0">
                                <img src={helloIcon} alt="..." height="80" />
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h2 className="mb-0">¡Di Hola!</h2>
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
                                    <h5 className="mb-0 fs-18">Correo electrónico</h5>
                                </div>
                            </div>
                            <p className="mb-1">
                                <i className="mdi mdi-arrow-right-thin text-muted me-1"></i>
                                <a href="mailto:contacto@tecnologiasadministrativas.com" className="text-secondary">
                                    contacto@tecnologiasadministrativas.com
                                </a>
                            </p>
                        </div>
                    </Col>
                    <Col lg={7} className="offset-lg-1">
                        <Card className="contact-form rounded-lg mt-4 mt-lg-0">
                            <Card.Body className="p-5">
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Row>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="firstName">Nombre</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="firstName"
                                                    placeholder="Tu nombre..."
                                                    isInvalid={!!errors.firstName}
                                                    {...register("firstName", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.firstName && "El nombre es obligatorio"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="lastName">Apellido</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="lastName"
                                                    placeholder="Tu apellido..."
                                                    isInvalid={!!errors.lastName}
                                                    {...register("lastName", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.lastName && "El apellido es obligatorio"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="email">Correo electrónico</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    id="email"
                                                    placeholder="Tu correo electrónico..."
                                                    isInvalid={!!errors.email}
                                                    {...register("email", {
                                                        required: true,
                                                        pattern: {
                                                            value: /^\S+@\S+\.\S+$/,
                                                            message: "Correo inválido"
                                                        }
                                                    })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email?.type === "required"
                                                        ? "El correo es obligatorio"
                                                        : errors.email?.message as string}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="phone">Teléfono</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    id="phone"
                                                    placeholder="Número de teléfono..."
                                                    isInvalid={!!errors.phone}
                                                    {...register("phone", {
                                                        required: true,
                                                        pattern: {
                                                            value: /^[0-9\s\-()+]{8,20}$/,
                                                            message: "Teléfono inválido"
                                                        }
                                                    })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone?.type === "required"
                                                        ? "El teléfono es obligatorio"
                                                        : errors.phone?.message as string}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6} lg={12}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="subject">Asunto</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="subject"
                                                    placeholder="Escribe el asunto..."
                                                    isInvalid={!!errors.subject}
                                                    {...register("subject", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.subject && "El asunto es obligatorio"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="mb-4">
                                                <Form.Label htmlFor="message">Mensaje</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    style={{ height: "100px" }}
                                                    id="message"
                                                    placeholder="Escribe tu mensaje..."
                                                    isInvalid={!!errors.message}
                                                    {...register("message", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.message && "El mensaje es obligatorio"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                    </Row>
                                    <button type="submit" className="btn btn-gradient-danger">
                                        Enviar mensaje <i className="mdi mdi-send ms-1"></i>
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
