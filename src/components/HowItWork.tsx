// images
import arrowTop from "../assets/images/arrow-top.png";
import arrowBottom from "../assets/images/arrow-bottom.png";

import { Col, Container, Row } from "react-bootstrap";

const HowItWork = () => {
  return (
    <section className="section">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              ¿Cómo <span className="fw-bold">funciona?</span>
            </h6>
            <h2 className="title">Algunos de nuestros servicios</h2>
            <p className="text-muted">
              En Tecnologías Administrativas ELAD, implementamos soluciones tecnológicas para facilitar el trabajo diario de las PyMES, creando sitios web únicos y diseñando la imagen corporativa de tu negocio.
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={4}>
            <div className="work-box px-lg-5 text-center mb-5 mb-lg-0">
              <div className="work-icon bg-soft-primary mb-4">
                <i className="mdi mdi-web"></i>
              </div>
              <h5 className="fw-semibold">1. Diseño Web Personalizado</h5>
              <p className="text-muted">
                Creamos soluciones web a medida, colocando tu empresa en internet con sitios únicos y funcionales.
              </p>
              {/* <img src={arrowTop} alt="" className="work-arrow" /> */}
            </div>
          </Col>
          <Col lg={4}>
            <div className="work-box px-lg-5 text-center mb-5 mb-lg-0">
              <div className="work-icon bg-soft-success mb-4">
                <i className="mdi mdi-bullhorn"></i>
              </div>
              <h5 className="fw-semibold">2. Marketing Digital Efectivo</h5>
              <p className="text-muted">
                Administramos tus redes sociales, campañas de WhatsApp Marketing, Facebook Ads, mailing masivo y SMS para aumentar tu alcance y fidelizar clientes.
              </p>
              {/* <img src={arrowBottom} alt="" className="work-arrow" /> */}
            </div>
          </Col>
          <Col lg={4}>
            <div className="work-box px-lg-5 text-center mb-5 mb-lg-0">
              <div className="work-icon bg-soft-warning mb-4">
                <i className="mdi mdi-palette"></i>
              </div>
              <h5 className="fw-semibold">3. Identidad Corporativa</h5>
              <p className="text-muted">
                Diseñamos logotipos auténticos y profesionales, basados en estándares de calidad, para que puedas registrarlos como propiedad de tu marca.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HowItWork;
