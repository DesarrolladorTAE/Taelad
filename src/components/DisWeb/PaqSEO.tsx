import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const paquetesSEO = [
    {
        nombre: "Paquete Básico",
        precio: "$2,500",
        moneda: "MXN",
        subtitulo: "Ideal para sitios nuevos o con baja competencia",
        beneficios: [
            "Auditoría SEO inicial (análisis técnico y contenido)",
            "Optimización de títulos, descripciones y etiquetas meta",
            "Corrección de URL amigables",
            "Inserción de palabras clave estratégicas (hasta 5 keywords)",
            "Revisión de velocidad de carga",
            "Mapa del sitio y configuración de Google Search Console",
            "1 reporte de optimización"
        ],
    },
    {
        nombre: "Paquete Intermedio",
        precio: "$5,800",
        moneda: "MXN",
        subtitulo: "Para sitios en competencia media",
        beneficios: [
            "Todo lo del paquete básico",
            "Estudio de palabras clave (hasta 15 keywords)",
            "Optimización de imágenes (tamaños, etiquetas ALT)",
            "Revisión y mejora de contenido en hasta 5 páginas del sitio",
            "Configuración de estructura de enlaces internos",
            "Corrección de errores técnicos (redirecciones, enlaces rotos, encabezados H1/H2)",
            "Reporte SEO + recomendaciones de contenido mensual"
        ],
    },
    {
        nombre: "Paquete Avanzado",
        precio: "$10,500",
        moneda: "MXN",
        subtitulo: "Para sitios con competencia alta o regional",
        beneficios: [
            "Todo lo del paquete intermedio",
            "Optimización completa de hasta 15 páginas",
            "Revisión de SEO local (Google Maps + palabras clave geolocalizadas)",
            "Estrategia de contenido basada en preguntas frecuentes (SEO semántico)",
            "Revisión de velocidad avanzada y experiencia móvil",
            "Implementación de rich snippets (fragmentos destacados)",
            "Reporte detallado + sesión de asesoría estratégica"
        ],
    },
    {
        nombre: "Paquete a la medida",
        precio: "Cotización personalizada",
        moneda: "",
        subtitulo: "¿Tu negocio necesita algo más específico? Propuesta personalizada.",
        beneficios: [
            "Propuesta según tamaño de tu sitio",
            "Nicho de mercado y volumen de competencia",
            "Necesidades de SEO técnico, local o internacional",
            "Incluye diagnóstico sin costo y asesoría previa"
        ],
    },
];

const waNumber = "5217442188925";
const getWaLink = (nombre: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, quiero contratar el ${nombre} para optimización SEO.`)}`;

const SeoPackages = () => (
    <section style={{ background: "#fff", padding: "48px 0" }}>
        <Container>
            <Row className="justify-content-center mb-5">
                <Col lg={10} className="text-center">
                    <h2 className="fw-bold mb-2 text-primary">🔍 Paquetes de Optimización SEO</h2>
                    <p style={{ color: "#2466c9", fontWeight: 500 }}>
                        Optimiza tu sitio web, mejora tu posicionamiento en Google y atrae más clientes. <br />
                        Elige el plan que mejor se adapte a tu negocio.
                    </p>
                </Col>
            </Row>
            <Row className="justify-content-center g-4">
                {paquetesSEO.map((paq, idx) => (
                    <Col md={6} lg={3} key={idx}>
                        <div className="shadow rounded-3 p-0 h-100" style={{ background: "#fff" }}>
                            <div style={{
                                background: "#2466c9",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px"
                            }}>
                                <h4 className="text-center text-white py-3 fw-bold m-0">{paq.nombre}</h4>
                            </div>
                            <div className="text-center pt-4 pb-2">
                                {paq.precio !== "Cotización personalizada" ? (
                                    <>
                                        <span style={{ fontSize: 18, fontWeight: "bold" }}>$</span>
                                        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-2px" }}>
                                            {Number(paq.precio.replace(/[^0-9]/g, "")).toLocaleString("es-MX")}
                                        </span>
                                        <span style={{ fontSize: 18, fontWeight: "bold" }}>MXN</span>
                                    </>
                                ) : (
                                    <span style={{ fontSize: 24, fontWeight: 700 }}>
                                        {paq.precio}
                                    </span>
                                )}
                            </div>

                            <div className="text-center text-secondary mb-2" style={{ minHeight: 48 }}>
                                <small>{paq.subtitulo}</small>
                            </div>
                            <ul className="list-unstyled px-4 pb-2 pt-1">
                                {paq.beneficios.map((b, i) => (
                                    <li key={i} className="d-flex align-items-start mb-2" style={{ fontSize: "1rem" }}>
                                        <span style={{
                                            color: "#2466c9",
                                            fontSize: 18,
                                            marginRight: 10,
                                            lineHeight: "1.5"
                                        }}>✔️</span>
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="text-center py-3">
                                <a
                                    href={getWaLink(paq.nombre)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{
                                        border: "2px solid #2466c9",
                                        borderRadius: "8px",
                                        color: "#2466c9",
                                        fontWeight: 600,
                                        fontSize: "1.1rem",
                                        background: "#fff",
                                        padding: "12px 32px",
                                    }}
                                >
                                    {paq.nombre === "Paquete a la medida"
                                        ? "Solicitar Propuesta"
                                        : "Contratar Servicio"}
                                </a>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    </section>
);

export default SeoPackages;
