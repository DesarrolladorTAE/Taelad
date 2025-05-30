import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";

const Counter = () => {
  const counterFunc = () => {
    // counter
    const counter = document.querySelectorAll(".counter_value");
    const speed = 800; // The higher the slower

    counter.forEach((counter_value) => {
      const updateCount = () => {
        const targetStr = counter_value.getAttribute("data-target");

        if (targetStr) {
          const target = JSON.parse(targetStr);
          const count = parseInt(counter_value.innerHTML);
          if (target) {
            const inc: number = target / speed;

            // Check if target is reached
            if (count < target) {
              // Add inc to count and output in counter_value
              counter_value.innerHTML = (count + inc).toFixed(0);
              // Call function every ms
              setTimeout(updateCount, 1);
            } else {
              counter_value.innerHTML = target;
            }
          }
        }
      };
      updateCount();
    });
  };

  useEffect(() => {
    counterFunc();
  }, []);

  return (
    <section className="section cta-bg">
      <div className="bg-overlay bg-dark"></div>
      <Container>
        <Row id="counter">
          <Col sm={6} lg={3}>
            <div className="text-center my-3">
              <div className="d-flex align-items-center counter-content text-start">
                <div className="flex-shrink-0">
                  <i className="mdi mdi-web text-white display-5"></i>
                </div>
                <div className="flex-grow-1 ms-4">
                  <h1 className="text-white">
                    <span className="counter_value" data-target="825">
                      0
                    </span>
                  </h1>
                  <p className="counter-name text-white opacity-75 mb-0 text-uppercase">
                    Global Brands
                  </p>
                </div>
              </div>
            </div>
          </Col>
          <Col sm={6} lg={3}>
            <div className="text-center my-3">
              <div className="d-flex align-items-center counter-content text-start">
                <div className="flex-shrink-0">
                  <i className="mdi mdi-emoticon-happy text-white display-5"></i>
                </div>
                <div className="flex-grow-1 ms-4">
                  <h1 className="text-white">
                    <span className="counter_value" data-target="1800">
                      0
                    </span>
                    +
                  </h1>
                  <p className="counter-name text-white opacity-75 mb-0 text-uppercase">
                    Happy Clients
                  </p>
                </div>
              </div>
            </div>
          </Col>
          <Col sm={6} lg={3}>
            <div className="text-center my-3">
              <div className="d-flex align-items-center counter-content text-start">
                <div className="flex-shrink-0">
                  <i className="mdi mdi-lightbulb-on text-white display-5"></i>
                </div>
                <div className="flex-grow-1 ms-4">
                  <h1 className="text-white">
                    <span className="counter_value" data-target="599">
                      0
                    </span>
                    +
                  </h1>
                  <p className="counter-name text-white opacity-75 mb-0 text-uppercase">
                    Creative Idea
                  </p>
                </div>
              </div>
            </div>
          </Col>
          <Col sm={6} lg={3}>
            <div className="text-center my-3">
              <div className="d-flex align-items-center counter-content text-start">
                <div className="flex-shrink-0">
                  <i className="mdi mdi-account-multiple text-white display-5"></i>
                </div>
                <div className="flex-grow-1 ms-4">
                  <h1 className="text-white">
                    <span className="counter_value" data-target="2000">
                      0
                    </span>
                    +
                  </h1>
                  <p className="counter-name text-white opacity-75 mb-0 text-uppercase">
                    User clients
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Counter;
