import React from "react";
import { Container, Row, Col } from "react-bootstrap";

// Imágenes
import Fondo from "../../assets/images/DW/Fondo.png";
import DW1 from "../../assets/images/DW/DW1.png";
import DW2 from "../../assets/images/DW/DW2.png";
import DW3 from "../../assets/images/DW/DW3.png";
import DW4 from "../../assets/images/DW/DW4.png";
import DW5 from "../../assets/images/DW/DW5.png";
import DW6 from "../../assets/images/DW/DW6.png";
import DW7 from "../../assets/images/DW/DW7.png";
import DW8 from "../../assets/images/DW/DW8.png";
import DW9 from "../../assets/images/DW/DW9.png";

const DWHero = () => {
    const logos = [DW1, DW2, DW3, DW4, DW5, DW6, DW7, DW8, DW9];

    return (
        <section
            className="hero-5 position-relative"
            style={{
                backgroundImage: `url(${Fondo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: 520,
                display: "flex",
                alignItems: "center"
            }}
        >
            <Container>
                <Row className="align-items-center justify-content-center hero-content">
                    <Col lg={8}>
                        <h1 className="hero-title fw-bold mb-4 display-4 text-center">
                            <span className="text-white">Desarrollo </span>
                            <span className="text-primary">Web</span>
                        </h1>

                        <p className="opacity-75 mb-4 pb-3 fs-17 text-white text-center">
                            Gran parte de nuestros sitios web y plataformas entregadas,
                            cuentan con las siguientes tecnologías, lo cual nos permite
                            crear interfaces web seguras y estables para el usuario.
                        </p>

                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "25px",
                            marginTop: "30px",
                            flexWrap: "wrap"
                        }}>
                            {logos.map((logo, index) => (
                                <img
                                    key={index}
                                    src={logo}
                                    alt={`Logo ${index + 1}`}
                                    style={{
                                        maxWidth: "60px",
                                        maxHeight: "60px",
                                        objectFit: "contain"
                                    }}
                                />
                            ))}
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default DWHero;
