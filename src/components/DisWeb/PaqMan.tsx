import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const waNumber = "5217442188925";

const planes = [
    {
        nombre: "PLAN MENSUAL",
        precio: "$300-400",
        extras: "MXN",
        beneficios: [
            "Asesoramiento técnico web",
            "Copias de seguridad (Backups)",
            "Protección y seguridad web",
            "Monitorización",
            "1 Cambio general",
        ],
    },
    {
        nombre: "PLAN TRIMESTRAL",
        precio: "$900-1200",
        extras: "MXN",
        beneficios: [
            "Asesoramiento técnico web",
            "Copias de seguridad (Backups)",
            "Protección y seguridad web",
            "Monitorización",
            "Mejora de carga y velocidad",
            "Actualización contenido web",
            "4 Cambios generales",
        ],
    },
    {
        nombre: "PLAN ANUAL",
        precio: "$3000-5000",
        extras: "MXN",
        beneficios: [
            "Asesoramiento técnico web",
            "Copias de seguridad (Backups)",
            "Protección y seguridad web",
            "Monitorización",
            "Mejora de carga y velocidad",
            "Actualización contenido web",
            "7 Cambios generales",
            "Rediseño gratis de pagina principal del sitio",
        ],
    },
    {
        nombre: "PLAN PERSONALIZADO",
        precio: "Cotizar",
        fondo: "#2466c9",
        color: "white",
        buttonBackground: "#fff",
        buttonTextColor: "#2466c9",
        beneficios: [
            "Asesoramiento técnico web",
            "Copias de seguridad (Backups)",
            "Protección y seguridad web",
            "Monitorización",
            "Mejora de carga y velocidad",
            "Actualización contenido web",
            "7 Cambios generales",
            "Rediseño gratis de pagina principal del sitio",
            "Añade más elementos a la lista...",
        ],
    },
];

const getWaLink = (nombre: string) => {
    const mensaje = `Hola, quiero más información sobre el ${nombre} de mantenimiento`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
};

const PlanesMantenimiento = () => (
    <section style={{ background: "#fff", padding: "48px 0" }}>
        <Container>
            <h2 className="text-center fw-bold mb-5 text-primary">
                Pólizas de Mantenimiento Web
            </h2>
            <Row className="justify-content-center g-4">
                {planes.map((plan, idx) => (
                    <Col md={6} lg={3} key={idx}>
                        <div
                            className="shadow rounded-3 h-100 d-flex flex-column"
                            style={{
                                background: plan.fondo || "#fff",
                                color: plan.color || "#000",
                            }}
                        >
                            {/* Título */}
                            <div
                                className="text-center py-3"
                                style={{ background: "#2466c9", color: "white" }}
                            >
                                <h5 className="fw-bold m-0">{plan.nombre}</h5>
                            </div>

                            {/* Precio */}
                            <div className="text-center py-4">
                                <h2 className="fw-bold m-0">
                                    {plan.precio}
                                    {plan.precio !== "Cotizar" && (
                                        <span className="ms-1" style={{ fontSize: 18 }}>{plan.extras}</span>
                                    )}
                                </h2>
                            </div>

                            {/* Beneficios */}
                            <ul className="list-unstyled px-4 flex-grow-1">
                                {plan.beneficios.map((b, i) => (
                                    <li
                                        key={i}
                                        className="d-flex align-items-start mb-2"
                                        style={{ fontSize: "0.95rem" }}
                                    >
                                        <span style={{ color: plan.color || "#2466c9", marginRight: 10 }}>✔️</span>
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Botón */}
                            <div className="text-center py-3">
                                <a
                                    href={getWaLink(plan.nombre)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{
                                        border: "2px solid",
                                        borderColor: plan.color || "#2466c9",
                                        color: plan.buttonTextColor || plan.color || "#2466c9",
                                        background: plan.buttonBackground || "#fff",
                                        fontWeight: 600,
                                        padding: "10px 20px",
                                        borderRadius: "8px",
                                    }}
                                >
                                    {plan.nombre === "PLAN PERSONALIZADO" ? "Cotizar Plan Personalizado" : "Contratar Servicio"}
                                </a>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
            <div className="text-center mt-4">
                <a
                    href="/Políticas-de-Mantenimiento-TAE-1.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary px-4 py-2 shadow-sm"
                    style={{ borderRadius: 12 }}
                >
                    Ver Políticas de Mantenimiento
                </a>

            </div>
        </Container>
    </section>
);

export default PlanesMantenimiento;
