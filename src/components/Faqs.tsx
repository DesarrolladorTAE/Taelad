import faq from "../assets/images/faq.png";
import { Container, Row, Col, Accordion } from "react-bootstrap";

const Faqs = () => {
  return (
    <section className="section bg-light">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              Our <span className="fw-bold">FAQs</span>
            </h6>
            <h2 className="title">Frequently Asked Questions</h2>
            <p className="text-muted">
              Sed ut perspiciatis unde omnis iste natus error voluptatem
              accusantium doloremque rem aperiam.
            </p>
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col lg={4}>
            <img src={faq} alt="" className="img-fluid d-block mx-auto" />
          </Col>

          <Col lg={7} className="offset-lg-1">
            <Accordion
              defaultActiveKey="0"
              className="accordion-flush faqs-accordion mt-4 mt-lg-0"
            >
              <Accordion.Item eventKey="0">
                <Accordion.Header className="h2">
                  <Accordion.Button className="p-0">
                    How to install App?
                  </Accordion.Button>
                </Accordion.Header>
                <Accordion.Collapse eventKey="" className="show">
                  <Accordion.Body className="text-secondary">
                    Neque porro quisquam est, qui dolorem ipsum quia dolor sit
                    amet consectetur adipisci velit sed quia non numquam eius
                    modi tempora incidunt ut labore et dolore magnam aliquam
                    quaerat voluptatem.
                  </Accordion.Body>
                </Accordion.Collapse>
              </Accordion.Item>
              {/* <!-- accordion-header end --> */}

              <Accordion.Item eventKey="1">
                <Accordion.Header className="h2">
                  <Accordion.Button className="p-0">
                    How do I get the Mobile App for my phone?
                  </Accordion.Button>
                </Accordion.Header>
                <Accordion.Collapse eventKey="" className="show">
                  <Accordion.Body className="text-secondary">
                    At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesentium voluptatum deleniti atque
                    corrupti quos dolores et quas molestias excepturi sint
                    occaecati cupiditate non provident, similique sunt in culpa
                    qui officia deserunt mollitia animi, id est laborum et
                    dolorum fuga.
                  </Accordion.Body>
                </Accordion.Collapse>
              </Accordion.Item>
              {/* <!-- accordion-header end --> */}

              <Accordion.Item eventKey="2">
                <Accordion.Header className="h2">
                  <Accordion.Button className="p-0">
                    What’s special about Appexy?
                  </Accordion.Button>
                </Accordion.Header>
                <Accordion.Collapse eventKey="" className="show">
                  <Accordion.Body className="accordion-body text-secondary">
                    Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                    reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat.
                  </Accordion.Body>
                </Accordion.Collapse>
              </Accordion.Item>
              {/* <!-- accordion-header end --> */}

              <Accordion.Item eventKey="3">
                <Accordion.Header className="h2">
                  <Accordion.Button className="p-0">
                    How much does Appexy cost?
                  </Accordion.Button>
                </Accordion.Header>
                <Accordion.Collapse eventKey="" className="show">
                  <Accordion.Body className="accordion-body text-secondary">
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo.
                  </Accordion.Body>
                </Accordion.Collapse>
              </Accordion.Item>
              {/* <!-- accordion-header end --> */}

              <Accordion.Item eventKey="4">
                <Accordion.Header className="h2">
                  <Accordion.Button className="p-0">
                    How do I disable installed apps?
                  </Accordion.Button>
                </Accordion.Header>
                <Accordion.Collapse eventKey="" className="show">
                  <Accordion.Body className="accordion-body text-secondary">
                    Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                    reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat.
                  </Accordion.Body>
                </Accordion.Collapse>
              </Accordion.Item>
              {/* <!-- accordion-header end --> */}

              <Accordion.Item eventKey="5">
                <Accordion.Header className="h2">
                  <Accordion.Button className="p-0">
                    What about the security of my payments?
                  </Accordion.Button>
                </Accordion.Header>
                <Accordion.Collapse eventKey="" className="show">
                  <Accordion.Body className="accordion-body text-secondary">
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                    odit aut fugit, sed quia consequuntur magni dolores eos qui
                    ratione voluptatem sequi nesciunt.
                  </Accordion.Body>
                </Accordion.Collapse>
              </Accordion.Item>
              {/* <!-- accordion-header end --> */}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Faqs;
