import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaPinterestP,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import type { IconType } from "react-icons";

import logoraro from "../assets/images/Tae/LOGO-TAE-VERTICAL_BLANCO.png";

const TaeFooter = () => {
  const year = new Date().getFullYear().toString();

  const socialLinks = [
    {
      Icon: FaFacebookF,
      link: "https://www.facebook.com/TAELADTI",
      label: "Facebook",
    },
    {
      Icon: FaTwitter,
      link: "https://x.com/i/flow/login?redirect_after_login=%2FTAELAD2",
      label: "Twitter",
    },
    {
      Icon: FaYoutube,
      link: "https://www.youtube.com/channel/UCZqj4INBI_M6b8b9O3Y3H5w",
      label: "YouTube",
    },
    {
      Icon: FaPinterestP,
      link: "https://mx.pinterest.com/taeladmx/_created/",
      label: "Pinterest",
    },
    {
      Icon: FaInstagram,
      link: "https://www.instagram.com/taeladmx/",
      label: "Instagram",
    },
    {
      Icon: FaTiktok,
      link: "https://www.tiktok.com/@taelad?",
      label: "TikTok",
    },
  ];

const ContactItem = ({
  Icon,
  title,
  children,
}: {
  Icon: IconType;
  title: string;
  children: React.ReactNode;
}) => (
    <div className="d-flex align-items-center gap-3 mb-4 flex-column flex-sm-row text-center text-sm-start">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: "52px",
          height: "52px",
          minWidth: "52px",
          background: "rgba(255,255,255,0.10)",
          color: "#fff",
          fontSize: "18px",
          flexShrink: 0,
        }}
      >
        {React.createElement(
          Icon as React.ElementType
        )}
      </div>

      <div>
        <h6 className="fw-bold mb-1 text-white">
          {title}
        </h6>

        <p
          className="mb-0"
          style={{
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.7,
            wordBreak: "break-word",
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );

  return (
    <footer
      className="footer text-white pt-5"
      style={{
        background:
          "linear-gradient(135deg,#06172d 0%, #0b2545 45%, #102f56 100%)",
      }}
    >
      <Container>
        <Row className="gy-5 align-items-start">
          {/* LOGO + INFORMACIÓN */}
          <Col lg={4}>
            <div className="text-center text-lg-start">
              <img
                src={logoraro}
                alt="Logo ELAD"
                className="mb-4"
                style={{
                  maxWidth: "180px",
                  width: "100%",
                }}
              />

              <p
                className="mb-5"
                style={{
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.8,
                  fontSize: "15px",
                }}
              >
                Soluciones tecnológicas, administrativas y
                digitales para empresas modernas.
              </p>

              <ContactItem
                Icon={FaMapMarkerAlt}
                title="Dirección"
              >
                C. 24 202, Las Cruces, 39770
                <br />
                Acapulco de Juárez, Gro.
              </ContactItem>

              <ContactItem
                Icon={FaPhoneAlt}
                title="Teléfono"
              >
                +52 (744) 218 8925
              </ContactItem>

              <ContactItem
                Icon={FaEnvelope}
                title="Correo"
              >
                contacto@tecnologiasadministrativas.com
              </ContactItem>
            </div>
          </Col>

          {/* MAPA */}
          <Col lg={4}>
            <div className="text-center text-lg-start">
              <h5 className="fw-bold mb-4 text-white">
                Nuestra ubicación
              </h5>

              <div
                className="shadow-lg overflow-hidden"
                style={{
                  width: "100%",
                  height: "320px",
                  borderRadius: "24px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <iframe
                  title="Ubicación TAE"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.5723024095105!2d-99.8141532248472!3d16.847560883950475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ca59e1bb794c7b%3A0xdf944a853b7b8e17!2sTecnolog%C3%ADas%20Administrativas%20Elad%20%7C%20Dise%C3%B1o%20Web%20%7C%20Marketing%20%7C%20E-Commerce%20%7C%20CRM%20%7C!5e0!3m2!1ses-419!2smx!4v1749235367451!5m2!1ses-419!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Col>

          {/* NAVEGACIÓN + REDES */}
          <Col lg={4}>
            <div className="text-center text-lg-start">
              <h5 className="fw-bold mb-4 text-white">
                Navegación
              </h5>

              <ul className="list-unstyled mb-5">
                <li className="mb-3">
                  <Link
                    to="/nosotros"
                    className="text-decoration-none"
                    style={{
                      color:
                        "rgba(255,255,255,0.72)",
                    }}
                  >
                    Nosotros
                  </Link>
                </li>

                <li className="mb-3">
                  <Link
                    to="/aviso-privacidad"
                    className="text-decoration-none"
                    style={{
                      color:
                        "rgba(255,255,255,0.72)",
                    }}
                  >
                    Aviso de privacidad
                  </Link>
                </li>

                <li className="mb-3">
                  <Link
                    to="/terminos-condiciones"
                    className="text-decoration-none"
                    style={{
                      color:
                        "rgba(255,255,255,0.72)",
                    }}
                  >
                    Términos y condiciones
                  </Link>
                </li>
              </ul>

              <h5 className="fw-bold mb-4 text-white">
                Redes Sociales
              </h5>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                {socialLinks.map(
                  ({ Icon, link, label }) => (
                    <a
                      key={label}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="d-flex align-items-center justify-content-center text-dark text-decoration-none"
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "18px",
                        background: "#ffffff",
                        transition: "0.3s ease",
                      }}
                    >
                      {React.createElement(
                        Icon as React.ElementType,
                        {
                          className: "fs-5",
                        }
                      )}
                    </a>
                  )
                )}
              </div>
            </div>
          </Col>
        </Row>

        <hr
          className="mt-5"
          style={{
            borderColor:
              "rgba(255,255,255,0.12)",
          }}
        />

        <Row className="py-3">
          <Col className="text-center">
            <p
              className="mb-0"
              style={{
                color:
                  "rgba(255,255,255,0.62)",
                fontSize: "14px",
              }}
            >
              © {year} Tecnologías
              Administrativas ELAD — Todos los
              derechos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default TaeFooter;