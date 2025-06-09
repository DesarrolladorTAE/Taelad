import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import * as React from "react";
import { FaCogs } from "react-icons/fa";

// Imágenes
import heroBottomShape from "../../assets/images/DW/Fondo.png";
import DW1 from "../../assets/images/DW/DW1.png";
import DW2 from "../../assets/images/DW/DW2.png";
import DW3 from "../../assets/images/DW/DW3.png";
import DW4 from "../../assets/images/DW/DW4.png";
import DW5 from "../../assets/images/DW/DW5.png";
import DW6 from "../../assets/images/DW/DW6.png";
import DW7 from "../../assets/images/DW/DW7.png";
import DW8 from "../../assets/images/DW/DW8.png";
import DW9 from "../../assets/images/DW/DW9.png";

// RECIBE UN PROPS LLAMADO background (opcional)
const DWHero = ({ background }: { background?: string }) => {
  const logos = [DW1, DW2, DW3, DW4, DW5, DW6, DW7, DW8, DW9];

  return (
    <>
      <section
        className="hero-5 position-relative pb-5"
        style={
          background
            ? {
              background: background.startsWith("url(")
                ? background
                : `url(${background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: 520,
            }
            : { background: "#f8fafc", minHeight: 520 }
        }
      >
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="justify-content-center text-center hero-content">
            <Col lg={8}>
              <h1 className="hero-title fw-bold mb-4 display-4">
                <span className="text-white">Desarrollo </span>
                <span className="text-primary">Web</span>
              </h1>

              <p className="opacity-75 mb-4 pb-3 fs-17 text-white" style={{ color: "#fff" }}>
                Gran parte de nuestros sitios web y plataformas entregadas,
                cuentan con las siguientes tecnologías, lo cual nos permite
                crear interfaces web seguras y estables para el usuario.
              </p>
            </Col>
          </Row>

          <Row className="text-center justify-content-center flex-wrap my-4">
            {logos.map((logo, index) => (
              <Col key={index} xs={6} sm={4} md={3} lg={1} className="mb-4">
                <img
                  src={logo}
                  alt={`Logo ${index + 1}`}
                  className="img-fluid"
                  style={{ maxHeight: "60px", objectFit: "contain" }}
                />
              </Col>
            ))}
          </Row>
        </Container>

        <div
          className="bottom-shape position-absolute bottom-0 start-0 end-0"
          style={{ zIndex: 1 }}
        >
          <img src={heroBottomShape} alt="" className="w-100" />
        </div>
      </section>

      <div className="bg-white py-4">
        <Container>
          <Row className="mt-2">
            <Col className="text-center">
              <a
                href="#soluciones"
                className="text-primary fw-bold text-decoration-none"
              >
                ↓ Conoce nuestras soluciones web
              </a>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default DWHero;
