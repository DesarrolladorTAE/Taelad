import { Container, Row, Col } from "react-bootstrap";
import {
    FaFacebookF,
    FaTwitter,
    FaYoutube,
    FaPinterestP,
    FaInstagram,
    FaTiktok,
    FaPhoneAlt,
} from "react-icons/fa";
import React from "react";
import Facturon from "../../assets/images/FE/10075624.jpg";

const Contactanos = () => {
    return (
        <section className="section bg-white">
            <Container>
                <Row className="align-items-center">
                    <Col md={6}>
                        {/* Puedes reemplazar esto por una imagen si la tienes */}
                        <img
                            src={Facturon}
                            alt="Ilustración"
                            className="img-fluid mx-auto d-block"
                            style={{ maxWidth: "80%" }}
                        />
                    </Col>

                    <Col md={6}>
                        <h6 className="text-uppercase text-primary fw-bold mb-2">Facturación Electrónica</h6>
                        <h2 className="fw-bold mb-3">Contáctanos</h2>

                        <p className="text-muted">
                            Elabora cualquier factura o CFDI que necesites de manera sencilla y cumpliendo siempre con los requisitos solicitados por el SAT en facturación electrónica.
                        </p>

                        <div className="d-flex align-items-center mb-3">
                            {(FaPhoneAlt as any)({ className: "text-primary me-2" })}
                            <span className="fw-semibold">7441340051</span>
                        </div>

                        <p className="text-muted">Al contactarnos es importante seleccionar la opción <strong>#1</strong></p>

                        <div className="bg-light py-3 px-4 rounded d-flex gap-3 justify-content-start mt-4">
                            <a
                                href="https://www.facebook.com/TAELADTI"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dark"
                            >
                                {(FaFacebookF as any)({ className: "fs-4" })}
                            </a>
                            <a
                                href="https://x.com/i/flow/login?redirect_after_login=%2FTAELAD2"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dark"
                            >
                                {(FaTwitter as any)({ className: "fs-4" })}
                            </a>
                            <a
                                href="https://www.youtube.com/channel/UCZqj4INBI_M6b8b9O3Y3H5w"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dark"
                            >
                                {(FaYoutube as any)({ className: "fs-4" })}
                            </a>
                            <a
                                href="https://mx.pinterest.com/taeladmx/_created/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dark"
                            >
                                {(FaPinterestP as any)({ className: "fs-4" })}
                            </a>
                            <a
                                href="https://www.instagram.com/taeladmx/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dark"
                            >
                                {(FaInstagram as any)({ className: "fs-4" })}
                            </a>
                            <a
                                href="https://www.tiktok.com/@taelad?"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dark"
                            >
                                {(FaTiktok as any)({ className: "fs-4" })}
                            </a>
                        </div>

                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Contactanos;
