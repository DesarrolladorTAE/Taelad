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
  `${SITE_URL}/terminos-condiciones`;

const PAGE_TITLE =
  "Términos y condiciones | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Consulta los términos y condiciones de uso y contratación de los productos y servicios ofrecidos por Tecnologías Administrativas ELAD.";

const PAGE_KEYWORDS = [
  "términos y condiciones",
  "condiciones de uso",
  "contratación de servicios",
  "servicios tecnológicos",
  "Tecnologías Administrativas ELAD",
];

const PAGE_IMAGE_URL =
  new URL(
    bgImg,
    SITE_URL
  ).toString();

const LAST_UPDATED =
  "2025-06-09";

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
      dateModified: LAST_UPDATED,
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

const termsText = `INFORMACIÓN GENERAL
📄 Términos y Condiciones de Uso
Tecnologías Administrativas ELAD®

Última actualización: 9 de junio de 2025

1. Introducción
Los presentes Términos y Condiciones regulan el uso y contratación de los productos y servicios ofrecidos por Tecnologías Administrativas ELAD® (en adelante "ELAD"), una empresa mexicana dedicada al desarrollo de soluciones tecnológicas y digitales para negocios.

Los servicios incluyen, pero no se limitan a:

Desarrollo Web

Marketing Digital

Sistema Contable y de Facturación (TAECONTA®)

Plataforma de Tienda en Línea y Punto de Venta (Mitiendaenlineamx.com.mx®)

Sistema de Recargas Telefónicas (Telorecargo.com®)

Diseño de Logotipos

Desarrollo de Chatbots y CRM Automatizado (Chatingbot®)

Al contratar cualquier servicio, el cliente declara haber leído, comprendido y aceptado estos términos en su totalidad.

2. Alcance y Objeto del Servicio
Cada producto y servicio se proporciona conforme al plan o paquete contratado, el cual especifica características, tiempos de entrega, alcance técnico y limitaciones. El cliente es responsable de revisar esta información antes de confirmar su compra.

3. Obligaciones del Cliente
Entrega de contenido: El cliente deberá enviar textos, imágenes, datos y cualquier material requerido en los tiempos acordados.

Información veraz: Todo contenido debe ser original, legal y libre de derechos de terceros.

Participación activa: En proyectos colaborativos (como desarrollo web o branding), el cliente deberá dar seguimiento y responder a solicitudes en tiempo y forma.

Cumplimiento de pagos: El cliente deberá cubrir los importes establecidos según las fechas acordadas.

4. Entrega de Servicios
Los plazos de entrega y desarrollo comienzan una vez recibido el pago inicial y toda la información necesaria por parte del cliente.

Servicios y condiciones:
Desarrollo Web: Sitios institucionales, landing pages o e-commerce. Incluye revisiones limitadas según el paquete.

Marketing Digital: Gestión de redes sociales, publicidad, SEO y branding.

TAECONTA®: Plataforma fiscal mexicana para contabilidad y facturación electrónica (CFDI 4.0). Cumple con los requisitos del SAT.

Mitiendaenlineamx®: Sistema de e-commerce y punto de venta con funciones como tickets, lector de código de barras, reporte de ventas, y facturación automática.

Telorecargo®: Venta de recargas electrónicas. Incluye acceso a plataforma, tarifas preferenciales y soporte básico. Comisión basada en volumen.

Chatingbot®: Desarrollo de Chatbots conectados a WhatsApp, CRM personalizado, seguimiento de clientes, flujos automatizados.

Diseño de Logotipos: Propuestas profesionales con revisiones limitadas. Entrega en formatos digitales estándar.

5. Pagos y Facturación
Formas de pago: Transferencia, plataformas autorizadas, o métodos en línea indicados en cada producto.

Planes mensuales, trimestrales o anuales: Requieren renovación puntual. El retraso en el pago puede causar suspensión del servicio.

Facturación fiscal: Disponible para todos los servicios. Se debe solicitar en el mismo mes del pago.

6. Penalizaciones y Suspensiones
Si el cliente no entrega la información necesaria en un plazo máximo de 30 días naturales, el proyecto podrá suspenderse y no se garantizará reembolso.

En servicios activos, la falta de pago en tiempo implicará suspensión automática tras 3 días de tolerancia.

7. Propiedad Intelectual
Tecnologías Administrativas ELAD® conserva la propiedad intelectual de sus plataformas (TAECONTA, Telorecargo, Mitiendaenlineamx, Chatingbot).

El cliente conserva derechos sobre sus propios contenidos entregados.

Los diseños personalizados (logotipos, sitios web) se transfieren al cliente una vez liquidado el pago completo.

8. Soporte y Actualizaciones
El soporte técnico está disponible según el paquete contratado. Puede ser básico (chat/WhatsApp) o avanzado (resolución prioritaria).

Las actualizaciones de software están incluidas en los servicios en suscripción activa.

9. Confidencialidad y Protección de Datos
ELAD se compromete a proteger la información y datos del cliente conforme a la legislación vigente en México (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).

La información no será compartida con terceros sin autorización expresa, salvo que lo exija la ley.

10. Modificaciones a los Términos
ELAD podrá actualizar estos Términos y Condiciones cuando lo considere necesario. Las modificaciones se notificarán a los clientes activos con al menos 7 días naturales de anticipación.

11. Limitación de Responsabilidad
TAELAD no será responsable por:

Retrasos causados por terceros (como proveedores de hosting, WhatsApp, SAT, entre otros).

Daños derivados del mal uso del sistema por parte del cliente.

Interrupciones temporales por mantenimiento.

12. Jurisdicción y Legislación Aplicable
Estos Términos se rigen por las leyes mexicanas. Para cualquier controversia, ambas partes se someten a los tribunales competentes de Cuernavaca, Morelos, México, renunciando a cualquier otro fuero.
Preguntas acerca de los Términos de Servicio deben ser enviadas a raul.alvarez@tecnologiasadministrativas.com`;

const TerminosCondiciones: React.FC = () => {
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
          content="Términos y condiciones de Tecnologías Administrativas ELAD"
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
          content="Términos y condiciones de Tecnologías Administrativas ELAD"
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
              fontSize: "2.3rem",
              letterSpacing: 1,
            }}
          >
            Términos y Condiciones
          </h1>
        </header>

        <section
          aria-labelledby="terms-content-title"
        >
          <h2
            id="terms-content-title"
            className="visually-hidden"
          >
            Contenido de los términos y condiciones
          </h2>

          <Container className="py-5">
            <Row className="justify-content-center">
              <Col md={11} lg={10}>
                <article style={contentCardStyle}>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      fontSize: "1.08rem",
                    }}
                  >
                    {termsText}
                  </div>
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

export default TerminosCondiciones;