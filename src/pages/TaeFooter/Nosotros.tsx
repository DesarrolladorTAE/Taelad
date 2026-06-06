import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaRocket, FaEye } from "react-icons/fa";
import bgImg from "../../assets/images/TaeFooter/20943526.jpg";

// Ajusta las rutas de tus componentes si están en otra carpeta
import { Navbar1 } from "../../components/navbar";
import TaeFooter from "../../components/TaeFooter";
import BackToTop from "../../components/BackToTop";
import Login from "../auth/Login";
import Signin from "../auth/Signin";

const Nosotros: React.FC = () => (
    <>
        {/* navbar */}
        <Navbar1 classname="navbar-light" isLogoDark={false} />

        {/* Banner superior */}
        <div
            style={{
                background: `linear-gradient(rgba(24,54,122,0.7),rgba(24,54,122,0.7)), url('${bgImg}') center/cover no-repeat`,
                minHeight: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <h1
                className="text-white fw-bold"
                style={{ fontSize: "3rem", letterSpacing: 1 }}
            >
                Nosotros
            </h1>
        </div>

        {/* Sección Misión y Visión */}
        <Container className="py-5">
            <Row className="gy-5">
                <Col md={6} className="border-end border-2">
                    <div className="text-center px-4">
                        {(FaRocket as any)({ color: "#2061b2", size: 48, className: "mb-2" })}
                        <h2 className="fw-bold mb-3">Misión</h2>
                        <p className="text-muted fs-5">
                            Generar las estrategias y el uso de herramientas Administrativas y
                            marketing digital al alcance de las micro y medianas empresas para
                            coadyuvar en su crecimiento, fortalecimiento e inclusión en las
                            tecnologías de la información.
                        </p>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="text-center px-4">
                        {(FaEye as any)({ color: "#2061b2", size: 48, className: "mb-2" })}
                        <h2 className="fw-bold mb-3">Visión</h2>
                        <p className="text-muted fs-5">
                            Ser el apoyo del sector empresarial para alcanzar sus metas en el
                            posicionamiento y venta de sus productos con la calidad de servicio
                            y atención inmediata que sus necesidades administrativas demanden.
                            Un organismo donde nuestro equipo de trabajo se sienta identificado
                            y comprometido por lograr los objetivos de nuestros clientes y su
                            campo de trabajo sea de crecimiento y estabilidad personal.
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>

        {/* footer */}
        <TaeFooter />
        {/* back to top, login y signin */}
        <BackToTop />
        {/* <Login /> */}
        {/* <Signin /> */}
    </>
);

export default Nosotros;
