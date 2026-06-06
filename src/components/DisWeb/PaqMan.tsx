import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const waNumber = "5217442188925";

const planes = [
    {
        nombre: "Paquete Mensual",
        precio: "$1,500",
        extras: "MXN/mes",
        beneficios: [
            "2 actualizaciones de contenido al mes (textos, imágenes o banners)",
            "Revisión de enlaces rotos y formularios",
            "Optimización de velocidad y carga básica",
            "Copia de seguridad mensual",
            "Soporte técnico básico (WhatsApp/correo)",
            "Reporte mensual de mantenimiento"
        ]
    },
    {
        nombre: "Paquete Trimestral",
        precio: "$3,900",
        extras: "MXN/3 meses",
        beneficios: [
            "6 actualizaciones durante el trimestre",
            "Revisión general de código y estructura",
            "Optimización de imágenes y velocidad",
            "Copia de seguridad mensual",
            "Soporte técnico medio (WhatsApp/correo)",
            "Reporte trimestral detallado",
            "Revisión de compatibilidad móvil"
        ]
    },
    {
        nombre: "Paquete Anual",
        precio: "$13,800",
        extras: "MXN/año",
        beneficios: [
            "Hasta 24 actualizaciones durante el año",
            "Soporte prioritario",
            "Mantenimiento de base de datos",
            "Monitoreo de seguridad mensual",
            "Revisión de SEO técnico básico",
            "Copia de seguridad mensual",
            "Reporte trimestral + asesoría estratégica anual"
        ]
    },
    {
        nombre: "Paquete Personalizado",
        precio: "Cotizar",
        fondo: "#2466c9",
        color: "white",
        buttonBackground: "#fff",
        buttonTextColor: "#2466c9",
        beneficios: [
            "Plan adaptado a tu empresa",
            "Cantidad de actualizaciones requeridas",
            "Tipo de contenido y complejidad técnica",
            "Integraciones con otros sistemas",
            "Necesidades de seguridad o escalabilidad"
        ]
    }
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
                                    {plan.nombre === "Paquete Personalizado"
                                        ? "Cotizar Plan Personalizado"
                                        : "Contratar Servicio"}
                                </a>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Bloque de ventajas */}
            <div className="text-center mt-5">
                <h4 className="fw-bold mb-3 text-primary">¿Por qué contratar mantenimiento con nosotros?</h4>
                <ul className="list-unstyled d-inline-block text-start" style={{ maxWidth: 500 }}>
                    <li>✔️ Especialistas en desarrollo web con código nativo</li>
                    <li>✔️ Soporte rápido y cercano</li>
                    <li>✔️ Prevención de fallos, pérdidas o vulnerabilidades</li>
                    <li>✔️ Mejor experiencia para tus usuarios</li>
                    <li>✔️ Tu sitio siempre actualizado y en línea</li>
                </ul>
            </div>
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
