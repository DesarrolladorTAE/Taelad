import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
//images
import hero4Img from "../../assets/images/heros/hero-4-img.png";
import marketing from "../../assets/images/MD/marketing.png";

const Hero4 = () => {
    return (
        <section className="hero-4">
            <div className="bg-overlay-img"></div>
            <Container>
                <Row className="align-items-center">
                    <Col lg={6}>
                        {/* <div className="avatar avatar-xl rounded-circle bg-soft-light text-white shadow-sm mb-4">
                            <i className="mdi mdi-shield-lock mb-0 h2"></i>
                        </div> */}
                        <h1 className="hero-title text-white fw-bold mb-4 display-5">
                            Marketing <span className="text-primary">Digital</span>{" "}

                        </h1>
                        <p className="text-white-50 mb-4 pb-2 fs-17">
                            Las redes sociales se han transformado y con ellas la forma de hacer negocio, son una plataforma que nos brinda un canal de comunicación masivo y nos permite informar e interactuar de manera mas directa y personalizada con nuestros clientes.
                        </p>
                        <p className="text-white-50 mb-2">
                            <i className="mdi mdi-lock-check fs-20 me-2 text-success"></i>{" "}
                            Administración de redes sociales
                        </p>
                        <p className="text-white-50 mb-2">
                            <i className="mdi mdi-lock-check fs-20 me-2 text-success"></i>{" "}
                            Marketing de Whatsapp
                        </p>
                        <p className="text-white-50 mb-2">
                            <i className="mdi mdi-lock-check fs-20 me-2 text-success"></i>{" "}
                            Envío de correo másivo
                        </p>
                        {/* <p className="text-white-50 mb-5"><i className="mdi mdi-lock-check fs-20 me-2 text-success"></i> At vero eos et accusamus et iusto odio dignissimos.</p> */}
                        {/* <Link to="#" className="btn btn-lg btn-primary">
                            Get Started{" "}
                            <i className="mdi mdi-arrow-right-thin ms-1 fs-22 right-arrow"></i>
                        </Link> */}
                    </Col>

                    <Col lg={6}>
                        <div className="mt-5 mt-lg-0 text-center">
                            <img
                                src={marketing}
                                alt=""
                                style={{
                                    width: "550px",  // o cualquier otro valor que desees
                                    height: "auto",
                                }}
                            />
                        </div>


                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Hero4;
