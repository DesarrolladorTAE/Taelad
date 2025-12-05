import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaMoneyBillWave } from "react-icons/fa";
// image
import hero4Img from "../../assets/images/heros/hero-4-img.png";
import Conta from "../../assets/images/CE/Conta.png";

const CEHero = () => {
  return (
    <section className="hero-4">
      <div className="bg-overlay-img"></div>
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <div className="avatar avatar-xl rounded-circle bg-soft-light text-white shadow-sm mb-4">
              {(FaMoneyBillWave as any)({ size: 32 })}
            </div>
            <h1 className="hero-title text-white fw-bold mb-4 display-5">
              Contabilidad <span className="text-primary">Electrónica</span>
            </h1>
            <p className="text-white-50 mb-4 fs-17">
              TAEConta es el software contable que te permite llevar los
              registros, los catálogos, libros, documentos, la preparación y
              envío de los datos contables, reportes contables (Balanza,
              Balance general, Estados de resultados, Libros) todo queda
              resguardado en la nube.
            </p>
            <p className="text-white-50 mb-5 fs-17 fw-semibold">
              ¡Olvídate de Excel y comienza a usar TAEConta!
            </p>
            {/* <Link to="#" className="btn btn-lg btn-primary">
              Probar Ahora{" "}
              <i className="mdi mdi-arrow-right-thin ms-1 fs-22 right-arrow"></i>
            </Link> */}
          </Col>

          <Col lg={6}>
            <div className="mt-5 mt-lg-0">
              <img
                src={Conta}
                alt="Contabilidad electrónica TAEConta"
                className="img-fluid d-block mx-auto"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CEHero;
