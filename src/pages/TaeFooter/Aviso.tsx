import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Col,
  Container,
  Row,
} from "react-bootstrap";

import bgImg from "../../assets/images/TaeFooter/20943526.jpg";

import { Navbar1 } from "../../components/navbar";
import TaeFooter from "../../components/TaeFooter";
import BackToTop from "../../components/BackToTop";

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const PAGE_CANONICAL_URL =
  `${SITE_URL}/aviso-privacidad`;

const PAGE_TITLE =
  "Aviso de privacidad | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Consulta el aviso de privacidad integral de Tecnologías Administrativas ELAD, las finalidades del tratamiento de datos personales y el ejercicio de derechos ARCO.";

const PAGE_KEYWORDS = [
  "aviso de privacidad",
  "protección de datos personales",
  "derechos ARCO",
  "privacidad",
  "tratamiento de datos",
  "Tecnologías Administrativas ELAD",
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
    },
    {
      "@type": "WebPage",
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

const contentCardStyle: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: 12,
  boxShadow:
    "0 2px 8px rgba(24, 54, 122, 0.06)",
  padding: "2.5rem 2rem",
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#2061b2",
};

const Aviso: React.FC = () => {
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
          content="Aviso de privacidad de Tecnologías Administrativas ELAD"
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
          content="Aviso de privacidad de Tecnologías Administrativas ELAD"
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
            className="text-white fw-bold text-center"
            style={{
              fontSize: "3rem",
              letterSpacing: 1,
            }}
          >
            Aviso de Privacidad
          </h1>
        </header>

        <section
          aria-labelledby="aviso-integral-title"
        >
          <Container className="py-5">
            <Row className="justify-content-center">
              <Col md={10} lg={9}>
                <article style={contentCardStyle}>
                  <h2
                    id="aviso-integral-title"
                    className="fw-bold mb-4 text-center"
                    style={sectionTitleStyle}
                  >
                    Aviso de privacidad integral
                  </h2>

                  <p>
                    <strong>
                      Tecnologías Administrativas Elad
                      S de RL de CV
                    </strong>{" "}
                    con domicilio en Carr. Cayaco –
                    Puerto Marqués, Piedra Roja, El
                    Coloso, 39810 Acapulco de Juárez,
                    Gro. y portal de internet{" "}
                    <a
                      href="https://tecnologiasadministrativas.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://tecnologiasadministrativas.com/
                    </a>
                    , es el responsable del uso y
                    protección de sus datos personales,
                    y al respecto le informamos lo
                    siguiente:
                  </p>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    ¿Para qué fines utilizaremos sus
                    datos personales?
                  </h3>

                  <p>
                    Los datos personales que recabamos
                    de usted los utilizaremos para las
                    siguientes finalidades necesarias
                    para el servicio que solicita:
                  </p>

                  <ul>
                    <li>
                      Respuesta a mensajes del formulario
                      de contacto.
                    </li>
                    <li>
                      Creación de menús digitales.
                    </li>
                  </ul>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    ¿Qué datos personales utilizaremos
                    para estos fines?
                  </h3>

                  <p>
                    Para llevar a cabo las finalidades
                    descritas en el presente aviso de
                    privacidad, utilizaremos los
                    siguientes datos personales:
                  </p>

                  <ul>
                    <li>
                      Datos de identificación y contacto.
                    </li>
                    <li>Datos laborales.</li>
                  </ul>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    ¿Cómo puede acceder, rectificar o
                    cancelar sus datos personales,
                    oponerse a su uso o ejercer la
                    revocación del consentimiento?
                  </h3>

                  <p>
                    Usted tiene derecho a conocer qué
                    datos personales tenemos de usted,
                    para qué los utilizamos y las
                    condiciones del uso que les damos
                    (Acceso). Asimismo, tiene derecho a
                    solicitar la corrección de su
                    información personal cuando esté
                    desactualizada, sea inexacta o
                    incompleta (Rectificación); solicitar
                    que la eliminemos de nuestros
                    registros o bases de datos cuando
                    considere que no está siendo
                    utilizada adecuadamente
                    (Cancelación); así como oponerse al
                    uso de sus datos personales para
                    fines específicos (Oposición). Estos
                    derechos se conocen como derechos
                    ARCO.
                  </p>

                  <p>
                    Para ejercer cualquiera de los
                    derechos ARCO, debe enviar una
                    petición por correo electrónico a{" "}
                    <a href="mailto:contacto@tecnologiasadministrativas.com.mx">
                      contacto@tecnologiasadministrativas.com.mx
                    </a>
                    . La petición deberá contener:
                  </p>

                  <ul>
                    <li>
                      Nombre completo del titular.
                    </li>
                    <li>Domicilio.</li>
                    <li>Teléfono.</li>
                    <li>
                      Correo electrónico utilizado en
                      este sitio web.
                    </li>
                    <li>
                      Copia adjunta de una identificación
                      oficial.
                    </li>
                    <li>Asunto: «Derechos ARCO».</li>
                    <li>
                      Descripción del objeto del escrito.
                      Este puede incluir, de manera
                      enunciativa y no limitativa:
                      revocación del consentimiento para
                      tratar sus datos personales;
                      notificación del uso indebido del
                      tratamiento de sus datos; o el
                      ejercicio de los derechos ARCO,
                      mediante una descripción clara y
                      precisa de los datos a acceder,
                      rectificar, cancelar u oponerse. En
                      caso de rectificación, deberá
                      indicar la modificación exacta y
                      anexar la documentación de soporte.
                      Debe considerar que no en todos los
                      casos podremos atender una
                      revocación o concluir el uso de los
                      datos de forma inmediata, ya que
                      alguna obligación legal podría
                      requerir que continuemos con su
                      tratamiento. Asimismo, para ciertos
                      fines, la revocación podría impedir
                      que sigamos prestando el servicio
                      solicitado o provocar la
                      terminación de la relación con
                      nosotros.
                    </li>
                  </ul>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    ¿En cuántos días responderemos a su
                    solicitud?
                  </h3>

                  <p>En 5 días.</p>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    ¿Por qué medio comunicaremos la
                    respuesta?
                  </h3>

                  <p>
                    Al mismo correo electrónico desde el
                    que se envió la petición.
                  </p>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    Uso de tecnologías de rastreo en
                    nuestro portal de internet
                  </h3>

                  <p>
                    Le informamos que en nuestra página
                    de internet utilizamos cookies, web
                    beacons u otras tecnologías mediante
                    las cuales es posible monitorear su
                    comportamiento como usuario de
                    internet, así como brindarle un mejor
                    servicio y experiencia de navegación.
                    Los datos personales que podemos
                    obtener mediante estas tecnologías
                    son:
                  </p>

                  <ul>
                    <li>
                      Identificadores, nombre de usuario
                      y contraseñas de sesión.
                    </li>
                    <li>
                      Región en la que se encuentra el
                      usuario.
                    </li>
                  </ul>

                  <p>
                    Estas cookies, web beacons y otras
                    tecnologías pueden ser deshabilitadas.
                    Para conocer cómo hacerlo, consulte
                    el menú de ayuda de su navegador.
                    Tenga en cuenta que, al desactivar
                    las cookies, es posible que no pueda
                    acceder a ciertas funciones
                    personalizadas del sitio web.
                  </p>

                  <h3 className="mt-4 mb-2 h5 fw-semibold">
                    ¿Cómo puede conocer los cambios en
                    este aviso de privacidad?
                  </h3>

                  <p>
                    El presente aviso de privacidad puede
                    sufrir modificaciones, cambios o
                    actualizaciones derivadas de nuevos
                    requerimientos legales; de nuestras
                    propias necesidades relacionadas con
                    los productos o servicios que
                    ofrecemos; de nuestras prácticas de
                    privacidad; de cambios en nuestro
                    modelo de negocio, o por otras
                    causas. Nos comprometemos a mantener
                    actualizado este aviso y usted podrá
                    consultar sus modificaciones en{" "}
                    <a
                      href="https://tecnologiasadministrativas.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://tecnologiasadministrativas.com/
                    </a>
                    .
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

export default Aviso;