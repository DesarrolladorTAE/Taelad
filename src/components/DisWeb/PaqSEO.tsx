import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const paquetesSEO = [
    {
        nombre: "SEO INICIAL",
        precio: "$3,500",
        moneda: "MXN",
        beneficios: [
            "1 hora de consultoría SEO por video llamada",
            "Estudio de Keywords o palabras clave",
            "Títulos y descripciones SEO de hasta 10 urls",
            "Indexación en Google (Creación de sitemaps)",
        ],
        link: "#",
    },
    {
        nombre: "ALTA Y OPTIMIZACIÓN",
        precio: "$4,000",
        moneda: "MXN",
        beneficios: [
            "Alta del sitio en Search Console",
            "Envío de Sitemap",
            "Indexación del sitio y páginas",
            "Alta de keywords",
            "Retirar contenido de Google",
        ],
        link: "#",
    },
    {
        nombre: "OPTIMIZACIÓN SEO SITIO WEB",
        precio: "$8,500",
        moneda: "MXN",
        beneficios: [
            "2 horas de consultoría SEO por video llamada",
            "Revisión de Google Analytics y Objetivos",
            "Optimización de Títulos y Descripciones SEO de hasta 30 urls",
            "Estudio de Keywords o palabras clave",
            "Propuesta de site Architecture",
            "Indexación en Google (Creación de sitemaps)",
        ],
        link: "#",
    },
    {
        nombre: "ESTRATEGIA SEO PREMIUM",
        precio: "$12,000",
        moneda: "MXN",
        beneficios: [
            "3 horas de consultoría SEO por video llamada",
            "2 keywords a posicionar en Google",
            "Garantía de resultados en 3 meses",
            "Estudio de Keywords o palabras clave",
            "Optimización de Títulos y Descripciones SEO de hasta 40 urls",
            "Site Architecture, landings pages, categorías de blog",
            "Creación de contenido 2 artículos de blog al mes o 2 landing pages con kw's",
        ],
        link: "#",
    },
];

const SeoPackages = () => (
    <section style={{ background: "#fff", padding: "48px 0" }}>
        <Container>
            <Row className="justify-content-center mb-5">
                <Col lg={10} className="text-center">
                    <h2 className="fw-bold mb-2 text-primary">Paquetes de optimización SEO</h2>
                </Col>
            </Row>
            <Row className="justify-content-center g-4">
                {paquetesSEO.map((paq, idx) => (
                    <Col md={6} lg={4} key={idx}>
                        <div className="shadow rounded-3 p-0 h-100" style={{ background: "#fff" }}>
                            <div style={{ background: "#2466c9", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
                                <h4 className="text-center text-white py-3 fw-bold m-0">{paq.nombre}</h4>
                            </div>
                            <div className="text-center pt-4 pb-2">
                                <span style={{ fontSize: 18, fontWeight: "bold" }}>$</span>
                                <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-2px" }}>
                                    {paq.precio.replace(/[^0-9]/g, "")}
                                </span>
                                <span style={{ fontSize: 20, fontWeight: "bold" }}>MXN</span>
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
                                    href={`https://wa.me/5217442188925?text=Hola%2C%20quiero%20contratar%20el%20paquete%20SEO%20"${encodeURIComponent(paq.nombre)}"`}
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
                                    Contratar Servicio
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
