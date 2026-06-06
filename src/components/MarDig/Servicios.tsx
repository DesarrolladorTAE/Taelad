import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Logothetickets from "../../assets/images/MD/logothetickets.svg";

const servicios = [
    {
        titulo: "Sistema de contabilidad y facturación en la nube",
        imagen: require("../../assets/images/Tae/TAECONTA-HORIZONTAL-600x227.webp"),
        link: "https://www.taeconta.com/",
    },
    {
        titulo: "Sistema de tickets",
        imagen: Logothetickets,
        link: "https://thebusinessticket.com/",
    },
    {
        titulo: "Crea tu propia tienda en línea",
        imagen: require("../../assets/images/MD/logoc.png"),
        link: "https://mitiendaenlineamx.com.mx/",
    },
    {
        titulo: "Venta de tiempo aire",
        imagen: require("../../assets/images/MD/logo1.png"),
        link: "https://telorecargo.com/",
    },
];

const pastelMorado = "#e7dbff";
const pastelMoradoFuerte = "#a18aff";

const Servicios = () => (
    <section
        style={{
            background: pastelMorado,
            minHeight: "60vh",
            padding: "64px 0 48px 0",
        }}
    >
        <Container>
            <h2
                className="fw-bold mb-5 text-center"
                style={{
                    color: pastelMoradoFuerte,
                    fontSize: "2.5rem",
                    letterSpacing: ".04em",
                }}
            >
                Nuestros Servicios
            </h2>
            <Row className="justify-content-center g-4">
                {servicios.map((servicio, idx) => (
                    <Col xs={12} sm={6} md={4} lg={3} key={idx}>
                        <a
                            href={servicio.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", display: "block" }}
                        >
                            <div
                                className="h-100"
                                style={{
                                    background: "#fff",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    boxShadow: `0 6px 36px 0 ${pastelMoradoFuerte}18`,
                                    transition: "transform .17s, box-shadow .17s",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    minHeight: 250,
                                }}
                            >
                                {/* Logo */}
                                <div
                                    style={{
                                        width: "100%",
                                        height: 150,
                                        background: "#f5f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "12px 0",
                                    }}
                                >
                                    <img
                                        src={servicio.imagen}
                                        alt={servicio.titulo}
                                        style={{
                                            maxWidth: "90%",
                                            maxHeight: "150px",
                                            objectFit: "contain",
                                            transition: "transform .27s",
                                            display: "block",
                                        }}
                                        className="servicio-img"
                                    />
                                </div>
                                {/* Título */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "1.2rem 1rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <span
                                        className="fw-semibold"
                                        style={{
                                            color: pastelMoradoFuerte,
                                            fontSize: "1.13rem",
                                            letterSpacing: ".02em",
                                        }}
                                    >
                                        {servicio.titulo}
                                    </span>
                                </div>
                            </div>
                        </a>
                    </Col>
                ))}
            </Row>
        </Container>
        <style>{`
            .servicio-img:hover {
                transform: scale(1.07) rotate(-1.5deg);
                box-shadow: 0 4px 22px 0 #a18aff30;
            }
            a:hover .h-100 {
                transform: translateY(-7px) scale(1.03);
                box-shadow: 0 12px 44px 0 #a18aff33;
            }
        `}</style>
    </section>
);

export default Servicios;
