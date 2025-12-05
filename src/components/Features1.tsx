// image
import { Col, Container, Row } from "react-bootstrap";
import features1 from "../assets/images/features-1.png";
import Factura from "../assets/images/Tae/4911345.jpg";

const Features1 = () => {
  return (
    <section className="section bg-light">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              Soluciones de <span className="fw-bold">Facturación Electrónica</span>
            </h6>
            <h2 className="title">Cumple con las normativas del SAT de forma sencilla</h2>
            <p className="text-muted">
              Emite tus facturas electrónicas en formatos PDF y XML, cumpliendo con las versiones 3.3 y 4.0 del SAT. Nuestro sistema facilita la gestión fiscal de tu empresa.
            </p>
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col lg={6}>
            <img
              src={Factura}
              alt="Facturación Electrónica"
              className="img-fluid mx-auto d-block"
              style={{ maxWidth: '75%' }}
            />

          </Col>
          <Col lg={5} className="offset-lg-1">
            <h1 className="fs-38 mb-4">Características Destacadas</h1>
            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-file-document-outline"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Emisión en formatos PDF y XML</span> para cada factura generada, asegurando compatibilidad y cumplimiento normativo.
                </p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-calendar-clock"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Entrega oportuna</span> de facturas, incluso para servicios realizados el último día hábil del mes, con un plazo máximo de 72 horas para su emisión.
                </p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-account-check-outline"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Actualización de datos fiscales</span> sencilla a través de WhatsApp o correo electrónico, facilitando la gestión de tu información.
                </p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-lock-outline"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Seguridad y cumplimiento</span> garantizados, alineados con las normativas establecidas por el SAT para la emisión de facturas electrónicas.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features1;
