import { Container, Row, Col } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import user1 from "../assets/images/users/user-1.jpg";
import Manuel from "../assets/images/users/Manuel.png";
import Eduardo from "../assets/images/users/Eduardo.png";

const googleReviews = [
  {
    name: "Manuel Herrera",
    comment:
      "Estoy alegre porque logré conseguir mi proyecto a mi gusto. Hay una buena comunicación. Contratar sus servicios es una buena decisión.Estoy alegre porque logre conseguir mi proyecto a mi gusto , hay una buena comunicacion contratar sus seevicios es una buena atención donde puedes hablar con toda confianza y libertad para que los detalles sean proyectados.",
    rating: 5,
    photo: Manuel,
  },
  {
    name: "Eduardo Bautista",
    comment:
      "Excelente, muy atentos al cliente, resolvieron mis dudas y me apoyaron en el sitio web a mi negocio.",
    rating: 5,
    photo: Eduardo,
  },
];

const Testimonial = () => {
  return (
    <section className="section bg-light" id="testimonial">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle text-primary">Testimonios</h6>
            <h2 className="title">Lo que dicen nuestros clientes</h2>
            <p className="text-muted">
              Opiniones reales de personas que ya usan nuestros servicios.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          {googleReviews.map((review, idx) => (
            <Col md={6} lg={5} key={idx} className="mb-4">
              <div className="bg-white p-4 shadow-sm rounded h-100">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={review.photo}
                    alt={review.name}
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                  />
                  <div>
                    <h6 className="mb-0 fw-bold">{review.name}</h6>
                    <div className="text-warning">
                      {Array.from({ length: review.rating }).map((_, i) =>
                        (FaStar as any)({ key: i, className: "me-1" })
                      )}
                    </div>

                  </div>
                </div>
                <p className="text-muted fst-italic">“{review.comment}”</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Testimonial;
