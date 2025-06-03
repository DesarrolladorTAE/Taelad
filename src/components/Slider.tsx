//images
import screenShot1 from "../assets/images/screen-shot/1.jpg";
import screenShot2 from "../assets/images/screen-shot/2.jpg";
import screenShot3 from "../assets/images/screen-shot/3.jpg";
import screenShot4 from "../assets/images/screen-shot/4.jpg";
import screenShot5 from "../assets/images/screen-shot/5.jpg";
import screenShot6 from "../assets/images/screen-shot/6.jpg";

import Tlaxco from "../assets/images/screen-shot/Tlaxco.png";
import Ticket from "../assets/images/screen-shot/Ticket.png";
import Telorecargo from "../assets/images/screen-shot/Telorecargo.png";
import Taeconta from "../assets/images/screen-shot/Taeconta.png";
import Mosca from "../assets/images/screen-shot/Mosca.png";
import Mitiendaenlinea from "../assets/images/screen-shot/Mitiendaenlinea.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Col, Container, Row } from "react-bootstrap";

const Slider = () => {




  return (
    <section className="section overflow-hidden" >
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6} className="text-center">
            <h6 className="subtitle">
              Capturas de<span className="fw-bold">Pantalla</span>
            </h6>
            <h2 className="title">Página y aplicaciones creados por nosotros</h2>
            {/* <p className="text-muted mb-0">
              Sed ut perspiciatis unde omnis iste natus error voluptatem
              accusantium doloremque rem aperiam.
            </p> */}
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="screen-slider overflow-hidden swiper-initialized swiper-horizontal swiper-pointer-events">
              {/* swiper */}
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={24}
                centeredSlides={true}
                loop={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true, el: ".swiper-pagination" }}
                breakpoints={{
                  0: {
                    slidesPerView: 2,
                  },
                  576: {
                    slidesPerView: 3,
                  },
                  768: {
                    slidesPerView: 3.5,
                  },
                  // 991: {
                  //   slidesPerView: 3,
                  // },
                  1024: {
                    slidesPerView: 4.2,
                  },
                }}
                className="py-5"
              >
                <div className="swiper-wrapper">
                  <SwiperSlide className="swiper-slide">
                    <img src={Telorecargo} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Tlaxco} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Ticket} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Mitiendaenlinea} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Mosca} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Taeconta} alt="" className="img-fluid" />
                  </SwiperSlide>

                  {/* duplicate slide */}
                  <SwiperSlide className="swiper-slide">
                    <img src={Telorecargo} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Tlaxco} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Ticket} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Mitiendaenlinea} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Mosca} alt="" className="img-fluid" />
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <img src={Taeconta} alt="" className="img-fluid" />
                  </SwiperSlide>
                </div>
                {/* <div className="swiper-pagination"></div> */}
              </Swiper>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Slider;
