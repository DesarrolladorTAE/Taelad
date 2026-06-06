import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const waNumber = "5217442188925";

const paquetes = [
  {
    nombre: "PAQUETE BÁSICO",
    precio: "$1,500",
    beneficios: [
      "Diseño de 2 propuestas de logotipo",
      "Entrega en JPG y PNG (alta calidad y fondo transparente)",
      "No incluye manual de marca ni rediseños posteriores"
    ],
  },
  {
    nombre: "PAQUETE ESTÁNDAR",
    precio: "$3,000",
    badge: "Más vendido",
    beneficios: [
      "Diseño de 3 propuestas de logotipo",
      "Entrega en JPG, PNG y PDF",
      "Incluye manual básico de uso del logo (colores, tipografía, versiones)",
      "No incluye aplicaciones de marca"
    ],
  },
  {
    nombre: "PAQUETE PROFESIONAL",
    precio: "$5,000",
    beneficios: [
      "Diseño de 5 propuestas de logotipo",
      "Entrega en JPG, PNG, PDF y SVG (vector editable)",
      "Incluye manual de identidad corporativa completo:",
      "• Paleta de colores",
      "• Tipografías",
      "• Usos correctos e incorrectos",
      "• Aplicaciones básicas",
      "Diseño de tarjeta de presentación (frente y reverso)"
    ],
  },
];


const getWaLink = (nombrePaquete: string): string => {
  const mensaje = `Hola, quiero adquirir el ${nombrePaquete} de diseño de logo`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
};

const PricingIdentidad = () => (
  <section style={{ background: "#f9f9ff", padding: "48px 0" }}>
    <Container>
      <Row className="justify-content-center g-4">
        {paquetes.map((paq, idx) => (
          <Col md={6} lg={4} key={idx}>
            <div
              className="rounded border position-relative h-100 d-flex flex-column"
              style={{
                background: idx === 0 ? "#4478cc" : "#fff",
                color: idx === 0 ? "#fff" : "#4478cc",
                borderColor: "#4478cc",
              }}
            >
              {/* Badge */}
              {paq.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: -35,
                    background: "red",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    padding: "4px 36px",
                    transform: "rotate(45deg)",
                    zIndex: 2,
                  }}
                >
                  {paq.badge.toUpperCase()}
                </span>
              )}
              {/* Header */}
              <div className="text-center py-3 border-bottom border-light">
                <h4 className="fw-bold m-0">{paq.nombre}</h4>
              </div>
              {/* Precio */}
              <div className="text-center my-3">
                <h1 style={{ fontWeight: 800, fontSize: "3rem" }}>{paq.precio}</h1>
              </div>
              {/* Beneficios */}
              <ul className="list-unstyled px-4 flex-grow-1">
                {paq.beneficios.map((b, i) => (
                  <li key={i} className="d-flex align-items-start mb-2" style={{ fontSize: "1rem" }}>
                    <span
                      style={{
                        color: idx === 0 ? "#fff" : "#4478cc",
                        fontSize: 18,
                        marginRight: 10,
                        lineHeight: "1.5",
                      }}
                    >
                      ✔️
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {/* Botón */}
              <div className="text-center py-3">
                <a
                  href={getWaLink(paq.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    background: idx === 0 ? "#fff" : "#4478cc",
                    color: idx === 0 ? "#4478cc" : "#fff",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "1rem",
                    padding: "10px 28px",
                  }}
                >
                  Adquiere
                </a>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);

export default PricingIdentidad;
