import logoLight from "../assets/images/logo-light.png";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
    FaFacebookF,
    FaTwitter,
    FaYoutube,
    FaInstagram,
} from "react-icons/fa";
import React from "react";
import logoraro from "../assets/images/Tae/LOGO-TAE-VERTICAL_BLANCO.png";

const TaeFooter = () => {
    const year = new Date().getFullYear().toString();

    return (
        <footer className="footer bg-dark text-white pt-5">
            <Container>
                <Row className="align-items-start">
                    {/* Logo y marca */}
                    <Col lg={4} className="mb-4 text-center text-lg-start">
                        <img src={logoraro} alt="Logo" className="mb-3" style={{ maxWidth: "160px" }} />
                        <p className="text-white-50">TECNOLOGÍAS ADMINISTRATIVAS</p>
                    </Col>

                    {/* Nosotros */}
                    <Col lg={2} md={4} sm={6} className="mb-4">
                        <h6 className="text-uppercase small fw-bold border-bottom border-light pb-2">Nosotros</h6>
                        <ul className="list-unstyled small">
                            <li><Link to="#" className="text-white-50">Nosotros</Link></li>
                            <li><Link to="#" className="text-white-50">Aviso de privacidad</Link></li>
                            <li><Link to="#" className="text-white-50">Términos y Condiciones</Link></li>
                            <li><Link to="#" className="text-white-50">¿Quiénes somos?</Link></li>
                        </ul>
                    </Col>

                    {/* Tienda */}
                    <Col lg={2} md={4} sm={6} className="mb-4">
                        <h6 className="text-uppercase small fw-bold border-bottom border-light pb-2">Tienda</h6>
                        <ul className="list-unstyled small">
                            <li><Link to="#" className="text-white-50">Inicio</Link></li>
                            <li><Link to="#" className="text-white-50">Tienda</Link></li>
                            <li><Link to="#" className="text-white-50">Mi Cuenta</Link></li>
                            <li><Link to="#" className="text-white-50">Carrito</Link></li>
                        </ul>
                    </Col>

                    {/* Redes */}
                    <Col lg={4} className="mb-4 text-center text-lg-start">
                        <h6 className="text-uppercase small fw-bold border-bottom border-light pb-2">Redes</h6>
                        <div className="d-flex gap-3 justify-content-lg-start justify-content-center mt-3">
                            <Link to="#" className="bg-white p-2 rounded text-dark">
                                {(FaFacebookF as any)({ className: "fs-5" })}
                            </Link>
                            <Link to="#" className="bg-white p-2 rounded text-dark">
                                {(FaTwitter as any)({ className: "fs-5" })}
                            </Link>
                            <Link to="#" className="bg-white p-2 rounded text-dark">
                                {(FaYoutube as any)({ className: "fs-5" })}
                            </Link>
                            <Link to="#" className="bg-white p-2 rounded text-dark">
                                {(FaInstagram as any)({ className: "fs-5" })}
                            </Link>
                        </div>
                    </Col>
                </Row>

                <hr className="border-light opacity-25" />

                <Row className="justify-content-between py-3 small">
                    {/* <Col md={6}>
                        <p className="text-white-50 mb-0">
                            {year} © TAE ContA — Todos los derechos reservados.
                        </p>
                    </Col> */}
                    {/* <Col md={6} className="text-md-end">
                        <Link to="#" className="text-white-50">Términos, condiciones y políticas</Link>
                    </Col> */}
                </Row>
            </Container>
        </footer>
    );
};

export default TaeFooter;
