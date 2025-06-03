import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

//image
import hero2Img from "../../assets/images/heros/hero-2-img.png";
import TaecontaCelu from "../../assets/images/FE/TaecontaCelu.png";
import TaeCelu from "../../assets/images/FE/TAECelu.png";
import Diamond from "../../assets/images/FE/Diamond.png";
import Dragon from "../../assets/images/FE/Dragon.png";
import Elad from "../../assets/images/FE/Elad.png";
import Washer from "../../assets/images/FE/Washer.png";
import TMC from "../../assets/images/FE/tmc_web.png";

const FEHero = () => {
    return (
        <section className="hero-2">
            <div className="bg-overlay-img"></div>
            <Container>
                <Row className="align-items-center justify-content-center hero-content">
                    <Col lg={6}>
                        <div className="avatar avatar-xl rounded-circle bg-soft-primary text-primary shadow-sm mb-4">
                            <i className="mdi mdi-currency-usd mb-0 h2"></i>
                        </div>
                        <h1 className="hero-title fw-bold mb-4 display-5">
                            Facturación{" "}
                            <span className="text-primary">Electrónica</span>
                        </h1>
                        <p className="opacity-75 mb-4 pb-3 fs-17">
                            Algunos de nuestros clientes
                        </p>
                        {/* <Link to="#" className="btn btn-lg btn-gradient-primary me-1">
                            Get Started Today
                        </Link>
                        <Link to="#" className="btn btn-lg btn-outline-dark">
                            Download App
                        </Link> */}
                        {/* Imagen o insignia abajo */}
                        {/* Grupo de logos */}
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

                    <Col md={8} lg={5} className="offset-lg-1">
                        <div className="hero-2-img mt-5 mt-lg-0">
                            <img
                                src={TaeCelu}
                                alt=""
                                className="img-fluid rounded-lg"
                                style={{ maxWidth: "370px", width: "100%", boxShadow: "0 10px 32px 0 rgba(31,97,235,0.10)" }}
                            />

                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default FEHero;
