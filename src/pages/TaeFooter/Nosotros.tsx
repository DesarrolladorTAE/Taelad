import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Col,
  Container,
  Row,
} from "react-bootstrap";
import {
  FaEye,
  FaRocket,
} from "react-icons/fa";

import bgImg from "../../assets/images/TaeFooter/20943526.jpg";

import { Navbar1 } from "../../components/navbar";
import TaeFooter from "../../components/TaeFooter";
import BackToTop from "../../components/BackToTop";

type CompatibleIconProps = {
  color?: string;
  size?: string | number;
  className?: string;
  "aria-hidden"?:
    | boolean
    | "true"
    | "false";
};

const RocketIcon =
  FaRocket as unknown as React.ComponentType<CompatibleIconProps>;

const EyeIcon =
  FaEye as unknown as React.ComponentType<CompatibleIconProps>;

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const PAGE_CANONICAL_URL =
  `${SITE_URL}/nosotros`;

const PAGE_TITLE =
  "Nosotros | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Conoce la misión y visión de Tecnologías Administrativas ELAD, empresa enfocada en soluciones administrativas, tecnológicas y de marketing digital para negocios.";

const PAGE_KEYWORDS = [
  "Tecnologías Administrativas ELAD",
  "nosotros",
  "misión empresarial",
  "visión empresarial",
  "soluciones administrativas",
  "tecnología para empresas",
  "marketing digital",
];

const PAGE_IMAGE_URL =
  new URL(
    bgImg,
    SITE_URL
  ).toString();

const PAGE_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Tecnologías Administrativas ELAD",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo192.png`,
      },
      description: PAGE_DESCRIPTION,
    },
    {
      "@type": "AboutPage",
      "@id": `${PAGE_CANONICAL_URL}#webpage`,
      url: PAGE_CANONICAL_URL,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      inLanguage: "es-MX",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Tecnologías Administrativas ELAD",
      },
      about: {
        "@id": `${SITE_URL}/#organization`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: PAGE_IMAGE_URL,
      },
    },
  ],
};

const Nosotros: React.FC = () => {
  return (
    <>
      <Helmet>
        <html lang="es-MX" />

        <title>{PAGE_TITLE}</title>

        <meta
          name="description"
          content={PAGE_DESCRIPTION}
        />

        <meta
          name="keywords"
          content={PAGE_KEYWORDS.join(", ")}
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href={PAGE_CANONICAL_URL}
        />

        <meta
          property="og:locale"
          content="es_MX"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content="Tecnologías Administrativas ELAD"
        />

        <meta
          property="og:title"
          content={PAGE_TITLE}
        />

        <meta
          property="og:description"
          content={PAGE_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={PAGE_CANONICAL_URL}
        />

        <meta
          property="og:image"
          content={PAGE_IMAGE_URL}
        />

        <meta
          property="og:image:alt"
          content="Equipo y filosofía de Tecnologías Administrativas ELAD"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={PAGE_TITLE}
        />

        <meta
          name="twitter:description"
          content={PAGE_DESCRIPTION}
        />

        <meta
          name="twitter:image"
          content={PAGE_IMAGE_URL}
        />

        <meta
          name="twitter:image:alt"
          content="Equipo y filosofía de Tecnologías Administrativas ELAD"
        />

        <script type="application/ld+json">
          {JSON.stringify(
            PAGE_STRUCTURED_DATA
          ).replace(
            /</g,
            "\\u003c"
          )}
        </script>
      </Helmet>

      <Navbar1
        classname="navbar-light"
        isLogoDark={false}
      />

      <main>
        <header
          style={{
            background: `linear-gradient(rgba(24, 54, 122, 0.7), rgba(24, 54, 122, 0.7)), url('${bgImg}') center/cover no-repeat`,
            minHeight: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            className="text-white fw-bold"
            style={{
              fontSize: "3rem",
              letterSpacing: 1,
            }}
          >
            Nosotros
          </h1>
        </header>

        <section
          aria-labelledby="mision-vision-title"
        >
          <h2
            id="mision-vision-title"
            className="visually-hidden"
          >
            Misión y visión
          </h2>

          <Container className="py-5">
            <Row className="gy-5">
              <Col
                md={6}
                className="border-end border-2"
              >
                <article className="text-center px-4">
                  <RocketIcon
                    color="#2061b2"
                    size={48}
                    className="mb-2"
                    aria-hidden="true"
                  />

                  <h3 className="fw-bold mb-3">
                    Misión
                  </h3>

                  <p className="text-muted fs-5">
                    Generar estrategias y facilitar el
                    uso de herramientas administrativas
                    y de marketing digital al alcance de
                    las micro y medianas empresas, para
                    coadyuvar en su crecimiento,
                    fortalecimiento e inclusión en las
                    tecnologías de la información.
                  </p>
                </article>
              </Col>

              <Col md={6}>
                <article className="text-center px-4">
                  <EyeIcon
                    color="#2061b2"
                    size={48}
                    className="mb-2"
                    aria-hidden="true"
                  />

                  <h3 className="fw-bold mb-3">
                    Visión
                  </h3>

                  <p className="text-muted fs-5">
                    Ser el apoyo del sector empresarial
                    para alcanzar sus metas en el
                    posicionamiento y venta de sus
                    productos, con calidad de servicio y
                    atención inmediata a sus necesidades
                    administrativas. Consolidar un
                    organismo donde nuestro equipo se
                    identifique y comprometa con los
                    objetivos de nuestros clientes, en
                    un entorno de crecimiento y
                    estabilidad personal.
                  </p>
                </article>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      <TaeFooter />

      <BackToTop />
    </>
  );
};

export default Nosotros;