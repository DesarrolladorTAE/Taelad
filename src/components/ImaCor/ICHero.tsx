import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

// Importa tu imagen de fondo aquí como las demás
import hero3Bg from "../../assets/images/IC/Verde.png"; // Cambia el nombre/ruta según tu fondo
import logoCreation from "../../assets/images/IC/logoCreation.png";

const Hero3 = () => {
  return (
    <section
      className="hero-3 position-relative"
      style={{
        backgroundImage: `url(${hero3Bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: 420,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="bg-overlay-img"></div>
      <Container>
        <Row className="align-items-center hero-content">
          <Col lg={6}>
            <h1 className="hero-title fw-bold mb-4 display-4 text-white">
              Diseño Gráfico
            </h1>
            <p className="opacity-75 mb-4 fs-17 text-white">
              Creamos logotipos en base a los estándares de calidad, con autenticidad en el diseño, para que puedas registrarlo como propiedad de tu marca.
            </p>
          </Col>
          <Col lg={6} className="d-flex justify-content-center align-items-center">
            <img
              src={logoCreation}
              alt=""
              className="img-fluid mt-5 mt-lg-0"
              style={{
                maxWidth: 600,     // Aumenta el ancho máximo a tu gusto
                maxHeight: 600,    // También puedes ajustar la altura máxima
                width: "100%",     // Se adapta si hay menos espacio
                height: "auto",    // Mantiene el aspecto
                display: "block"
              }}
            />
          </Col>

        </Row>
      </Container>
    </section>
  );
};

export default Hero3;
