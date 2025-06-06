import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const waNumber = "5217442188925"; // Cambia el número si lo necesitas

const paquetes = [
    {
        nombre: "START UP",
        precio: "$3,000",
        moneda: "MXN",
        beneficios: [
            "Dominio y alojamiento web",
            "Diseño de landing page",
            "1 Correo electrónico (1 GB)",
            "Formulario de contacto",
        ],
    },
    {
        nombre: "PAQUETE BASICO",
        precio: "$5,000",
        moneda: "MXN",
        beneficios: [
            "2 Páginas de información (sin contar las páginas de contacto, términos y condiciones, aviso de privacidad)",
            "Compatible con celulares y tabletas",
            "Certificado de seguridad SSL",
            "1 propuesta de diseño de la estructura, con base al modelo de negocio",
            "1 cuenta de correo electrónico con capacidad de 1 GB.",
            "1 formulario de Contacto Básico",
            "Hasta 10 imágenes de uso libre o proporcionadas por el cliente",
            "Hosting (Hospedaje) Gratis por un año",
            "Enlace a redes sociales",
            "Chat por Whatsapp",
            "Mapa de Google Maps con dirección de sus instalaciones",
            "Tiempo de entrega de 15 días hábiles",
            <span className="fst-italic" key="info">
                Toda la información a mostrar dentro del sitio web las deberá proporcionar el cliente (nosotros no colocaremos ninguna información que no proporcione el cliente)
            </span>,
        ],
    },
    {
        nombre: "PAQUETE DESARROLLO WEB A LA MEDIDA",
        precio: "Cotizar",
        moneda: "MXN",
        beneficios: [],
    }
];

const getWaLink = (nombrePaquete: string): string => {
    let mensaje = "";
    if (nombrePaquete === "PAQUETE DESARROLLO WEB A LA MEDIDA") {
        mensaje = "Hola, quiero cotizar un servicio de desarrollo web a la medida.";
    } else {
        mensaje = `Hola, quiero contratar el paquete ${nombrePaquete}. de diseño web`;
    }
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
};


const Pricing = () => (
    <section style={{ background: "#fff", padding: "48px 0" }}>
        <Container>
            <Row className="justify-content-center mb-5">
                <Col lg={10} className="text-center">
                    <h2 className="fw-bold mb-2">Nuestros Paquetes de Diseño Web</h2>
                    <p className="text-muted">¡Elige el paquete que mejor se adapte a tu negocio!</p>
                </Col>
            </Row>
            <Row className="justify-content-center g-4">
                {paquetes.map((paq, idx) => (
                    <Col md={6} lg={4} key={idx}>
                        <div className="shadow rounded-3 p-0 h-100 position-relative" style={{ minHeight: 620, background: "#fff" }}>
                            {/* Header */}
                            <div style={{ background: "#2466c9", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
                                <h4 className="text-center text-white py-3 fw-bold m-0">{paq.nombre}</h4>
                            </div>
                            {/* Precio */}
                            <div className="text-center pt-4 pb-2">
                                {paq.precio === "Cotizar" ? (
                                    <span style={{
                                        fontSize: 34,
                                        fontWeight: 700,
                                        letterSpacing: "-1px",
                                        color: "#2466c9",
                                    }}>Cotizar</span>
                                ) : (
                                    <>
                                        <span style={{ fontSize: 18, fontWeight: "bold" }}>$</span>
                                        <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-2px" }}>
                                            {paq.precio.replace(/[^0-9]/g, "")}
                                        </span>
                                        <span style={{ fontSize: 20, fontWeight: "bold" }}>MXN</span>
                                    </>
                                )}
                            </div>
                            {/* Beneficios */}
                            <ul className="list-unstyled px-4 pb-2 pt-1">
                                {paq.beneficios.length === 0 ? (
                                    <li className="d-flex align-items-start mb-2" style={{ fontSize: "1rem" }}>
                                        <span style={{
                                            color: "#2466c9",
                                            fontSize: 18,
                                            marginRight: 10,
                                            lineHeight: "1.5"
                                        }}>✔️</span>
                                        <span>
                                            Desarrollo web personalizado a tus necesidades empresariales.
                                        </span>
                                    </li>
                                ) : (
                                    paq.beneficios.map((b, i) => (
                                        <li key={i} className="d-flex align-items-start mb-2" style={{ fontSize: "1rem" }}>
                                            <span style={{
                                                color: "#2466c9",
                                                fontSize: 18,
                                                marginRight: 10,
                                                lineHeight: "1.5"
                                            }}>✔️</span>
                                            <span>{b}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                            {/* Botón WhatsApp */}
                            <div className="text-center py-3">
                                <a
                                    href={getWaLink(paq.nombre)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{
                                        border: "2px solid #2466c9",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        background: "#25d366",
                                        fontWeight: 600,
                                        fontSize: "1.15rem",
                                        padding: "12px 32px",
                                    }}
                                >
                                    {paq.precio === "Cotizar" ? "Solicitar Cotización por WhatsApp" : "Contratar Servicio por WhatsApp"}
                                </a>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    </section>
);

export default Pricing;
