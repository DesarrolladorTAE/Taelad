import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

// Images
import hero2Img from "../../assets/images/Tae/TAECONTABLANCO.png"; // <-- TU LOGO para el círculo
// import TaeCelu from "../../assets/images/FE/TAECelu.png";
import Diamond from "../../assets/images/FE/Diamond.png";
import Dragon from "../../assets/images/FE/Dragon.png";
import Elad from "../../assets/images/FE/Elad.png";
import Washer from "../../assets/images/FE/Washer.png";
import TMC from "../../assets/images/FE/tmc_web.png";

// Cambia la ruta abajo por la que quieras de fondo:
const backgroundImg = require("../../assets/images/FE/6070859.jpg"); // O pon la ruta que necesites

const FEHero = () => {
    const videoSrc = require("../../assets/videos/VideoTaeconta.mp4");

    return (
        <section
            className="hero-2 position-relative"
            style={{
                backgroundImage: `url(${backgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: 520,
                display: "flex",
                alignItems: "center"
            }}
        >
            <div className="bg-overlay-img" />
            <Container>
                <Row className="align-items-center justify-content-center hero-content">
                    {/* <Col lg={6}> */}
                    <Col lg={6} md={6}>
                        <div
                            className="avatar avatar-xl rounded-circle bg-soft-primary text-primary shadow-sm mb-4 d-flex justify-content-center align-items-center"
                            style={{
                                width: 160,
                                height: 160,
                                margin: "0 auto",
                                background: "rgba(255,255,255,0.8)",
                                boxShadow: "0 8px 32px 0 rgba(31,97,235,0.12)"
                            }}
                        >
                            <img
                                src={hero2Img}
                                alt="Logo"
                                style={{
                                    width: 130,
                                    height: 130,
                                    objectFit: "contain"
                                }}
                            />
                        </div>

                        <h1 className="hero-title fw-bold mb-4 display-5">
                            <span className="text-white">Facturación </span>
                            <span className="text-primary">Electrónica</span>
                        </h1>
                        <p className="opacity-75 mb-4 pb-3 fs-17 text-white">
                            Algunos de nuestros clientes
                        </p>

                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "35px",
                            marginTop: "30px",
                            flexWrap: "wrap"
                        }}>
                            <img src={Diamond} alt="Marca 1" style={{ maxWidth: 100, maxHeight: 80, objectFit: "contain" }} />
                            <img src={Dragon} alt="Marca 2" style={{ maxWidth: 100, maxHeight: 80, objectFit: "contain" }} />
                            <img src={TMC} alt="Marca 3" style={{ maxWidth: 100, maxHeight: 80, objectFit: "contain" }} />
                            <img src={Washer} alt="Marca 4" style={{ maxWidth: 100, maxHeight: 80, objectFit: "contain" }} />
                            <img src={Elad} alt="Marca 5" style={{ maxWidth: 100, maxHeight: 80, objectFit: "contain" }} />
                        </div>
                    </Col>
                    {/* <Col md={8} lg={5} className="offset-lg-1"> */}
                    <Col lg={6} md={6}>
                        <div className="hero-2-img mt-5 mt-lg-0 d-flex justify-content-center align-items-center">
                            <video
                                src={videoSrc}
                                controls
                                autoPlay
                                muted
                                loop
                                style={{
                                    maxWidth: "600px",
                                    width: "100%",
                                    borderRadius: "16px",
                                    boxShadow: "0 10px 32px 0 rgba(31,97,235,0.10)",
                                    background: "#eee"
                                }}
                            />
                        </div>

                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default FEHero;
