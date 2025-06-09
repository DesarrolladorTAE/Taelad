import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const waNumber = "5217442188925";

const planes = [
    {
        nombre: "Plan Mensual",
        precio: "$1,200",
        extras: "MXN/mes",
        beneficios: [
            "Actualización mensual de plugins, temas y núcleo de WordPress",
            "2 cambios menores de contenido al mes (texto, imágenes o banners)",
            "Copia de seguridad mensual",
            "Revisión de enlaces rotos",
            "Optimización básica de velocidad",
            "Soporte técnico básico por WhatsApp o correo",
            "Reporte mensual"
        ]
    },
    {
        nombre: "Plan Trimestral",
        precio: "$3,300",
        extras: "MXN/3 meses",
        beneficios: [
            "Actualizaciones quincenales del sitio y plugins",
            "Hasta 6 cambios de contenido por trimestre",
            "Limpieza de base de datos básica",
            "Revisión y eliminación de spam",
            "Copia de seguridad mensual",
            "Soporte técnico medio (WhatsApp, correo y llamada)",
            "Reporte detallado trimestral"
        ]
    },
    {
        nombre: "Plan Anual",
        precio: "$11,000",
        extras: "MXN/año",
        beneficios: [
            "Actualizaciones semanales de plugins y sistema",
            "Hasta 24 cambios de contenido durante el año",
            "Copias de seguridad automáticas semanales",
            "Limpieza mensual de base de datos y caché",
            "Monitoreo de seguridad y performance",
            "Soporte prioritario (WhatsApp + soporte remoto)",
            "Reportes trimestrales",
            "Asesoría técnica semestral"
        ]
    },
    {
        nombre: "Plan Personalizado",
        precio: "Cotizar",
        fondo: "#2466c9",
        color: "white",
        buttonBackground: "#fff",
        buttonTextColor: "#2466c9",
        beneficios: [
            "Plan a la medida según tus necesidades",
            "Plugins premium o personalizados",
            "Cantidad de actualizaciones y cambios frecuentes",
            "Nivel de seguridad requerido",
            "Integración con plataformas externas"
        ]
    }
];

const getWaLink = (nombre: string) => {
    const mensaje = `Hola, quiero más información sobre el ${nombre} de mantenimiento WordPress.`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
};

const PlanesMantenimiento = () => (
    <section style={{ background: "#fff", padding: "48px 0" }}>
        <Container>
            <h2 className="text-center fw-bold mb-5 text-primary">
                🛠 Pólizas de Mantenimiento WordPress
            </h2>
            <p className="text-center mb-5" style={{ maxWidth: 650, margin: "0 auto", color: "#2466c9", fontWeight: 500 }}>
                Ofrecemos soluciones de mantenimiento para que tu sitio WordPress esté siempre seguro, actualizado, funcional y optimizado.<br />
                <span style={{ color: "#000" }}>
                    Nos encargamos del backend mientras tú haces crecer tu negocio.
                </span>
            </p>
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
                                        style={{ fontSize: "0.97rem" }}
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
                                    {plan.nombre === "Plan Personalizado"
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
                <h4 className="fw-bold mb-3 text-primary">
                    ¿Por qué contratar mantenimiento con Tecnologías Administrativas ELAD®?
                </h4>
                <ul className="list-unstyled d-inline-block text-start" style={{ maxWidth: 500 }}>
                    <li>✔️ Especialistas en WordPress y desarrollo web profesional</li>
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
