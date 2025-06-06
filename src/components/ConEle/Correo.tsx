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
        const pagina = "Landfing TAE";
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

        // axios.post(
        //     'http://taeconta.com/api/public/api/correosTae',
        //     payload
        // )
        axios.post(
            'https://taeconta.com/api/public/api/correos/publicos', // <-- aquí la URL correcta
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
                            Our <span className="fw-bold">Contact Us</span>
                        </h6>
                        <h2 className="title">Get in Touch</h2>
                        <p className="text-muted">
                            Mediante correo
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
                                <h2 className="mb-0">Say Hello!</h2>
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
                                    <h5 className="mb-0 fs-18">Email</h5>
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
                                                <Form.Label htmlFor="firstName">First Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="firstName"
                                                    placeholder="Your first name..."
                                                    isInvalid={!!errors.firstName}
                                                    {...register("firstName", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.firstName && "First name is required"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="lastName">Last Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="lastName"
                                                    placeholder="Last name..."
                                                    isInvalid={!!errors.lastName}
                                                    {...register("lastName", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.lastName && "Last name is required"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="email">Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    id="email"
                                                    placeholder="Your email..."
                                                    isInvalid={!!errors.email}
                                                    {...register("email", {
                                                        required: true,
                                                        pattern: {
                                                            value: /^\S+@\S+\.\S+$/,
                                                            message: "Invalid email"
                                                        }
                                                    })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email?.type === "required"
                                                        ? "Email is required"
                                                        : errors.email?.message as string}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="phone">Phone Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    id="phone"
                                                    placeholder="Phone number..."
                                                    isInvalid={!!errors.phone}
                                                    {...register("phone", {
                                                        required: true,
                                                        pattern: {
                                                            value: /^[0-9\s\-()+]{8,20}$/,
                                                            message: "Invalid phone number"
                                                        }
                                                    })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone?.type === "required"
                                                        ? "Phone is required"
                                                        : errors.phone?.message as string}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col md={6} lg={12}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="subject">Subject</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="subject"
                                                    placeholder="Type subject..."
                                                    isInvalid={!!errors.subject}
                                                    {...register("subject", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.subject && "Subject is required"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="mb-4">
                                                <Form.Label htmlFor="message">Messages</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    style={{ height: "100px" }}
                                                    id="message"
                                                    placeholder="Type messages..."
                                                    isInvalid={!!errors.message}
                                                    {...register("message", { required: true })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.message && "Message is required"}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Col>
                                    </Row>
                                    <button type="submit" className="btn btn-gradient-danger">
                                        Send Messages <i className="mdi mdi-send ms-1"></i>
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
