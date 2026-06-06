import { Col, Row, Container } from "react-bootstrap";
import Icon from '@mdi/react';
import { mdiCurrencyUsd } from '@mdi/js';
import Contable from "../assets/images/Tae/634.png";
import TAEContaLogo from "../assets/images/Tae/TAECONTA-HORIZONTAL-600x227.webp";

const Features2 = () => {
  return (
    <section className="section bg-light features-bg">
      <Container>
        <Row className="align-items-center">
          <Col lg={5}>
            <h1 className="fs-38 mb-4">Contabilidad Electrónica Simplificada</h1>
            <p className="text-muted">
              TAEConta es el software contable que te permite llevar los registros, catálogos, libros y documentos, así como la preparación y envío de los datos contables. Todo queda resguardado en la nube.
            </p>

            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-timer-sand"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Ahorra hasta un 90% de tiempo</span> al automatizar tu contabilidad y olvidarte de Excel.
                </p>
              </div>
            </div>

            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-cloud-upload-outline"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Resguardo en la nube</span> de tus datos contables de manera segura y automática.
                </p>
              </div>
            </div>

            {/* <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span
                  className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary d-flex align-items-center justify-content-center"
                  style={{ padding: "10px" }}
                >
                  <Icon path={mdiCurrencyUsd} size={1.2} color="#1f61eb" />
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Generación e importación de la DIOT</span> al portal del SAT de forma sencilla.
                </p>
              </div>
            </div> */}

            <div className="d-flex mb-3">
              <div className="flex-shrink-0">
                <span className="avatar avatar-lg bg-white text-primary rounded-circle shadow-primary">
                  <i className="mdi mdi-chart-bar"></i>
                </span>
              </div>
              <div className="flex-grow-1 ms-4">
                <p className="text-muted">
                  <span className="text-dark fw-bold">Reportes contables en tiempo real</span> como Balanza, Balance general y Estados de resultados.
                </p>
              </div>
            </div>

            {/* Imagen agregada aquí debajo */}
            <div className="text-center my-4">
              <img
                src={TAEContaLogo}
                alt="TAECONTA Logo"
                className="img-fluid"
                style={{ maxWidth: 300 }}
              />
            </div>
          </Col>

          <Col lg={5} className="offset-lg-1">
            <img
              src={Contable}
              alt="Contabilidad Electrónica"
              className="img-fluid d-block mx-auto ms-lg-auto"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features2;
