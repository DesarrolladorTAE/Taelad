import { Helmet } from "react-helmet-async";

import { Navbar1 } from "../../../components/navbar";
import FEHero from "../../../components/FacEle/FEHero";
import Intro from "../../../components/FacEle/Intro";
import Precios from "../../../components/FacEle/Precios";
import Beneficios from "../../../components/FacEle/Beneficios";
import Contactanos from "../../../components/FacEle/Contactanos";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const PAGE_CANONICAL_URL =
  `${SITE_URL}/facturacion`;

const PAGE_TITLE =
  "Facturación electrónica para empresas | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Soluciones de facturación electrónica para emitir, administrar y consultar comprobantes fiscales digitales desde una plataforma diseñada para empresas y negocios.";

const PAGE_KEYWORDS = [
  "facturación electrónica",
  "CFDI",
  "sistema de facturación",
  "facturas electrónicas",
  "software de facturación",
  "facturación para empresas",
  "administración de CFDI",
];

const PAGE_IMAGE_URL =
  `${SITE_URL}/logo192.png`;

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
        url: PAGE_IMAGE_URL,
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
    },
    {
      "@type": "Service",
      "@id": `${PAGE_CANONICAL_URL}#service`,
      name: "Facturación electrónica",
      serviceType: "Software de facturación electrónica",
      description: PAGE_DESCRIPTION,
      url: PAGE_CANONICAL_URL,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "México",
      },
    },
  ],
};

function FacEle() {
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
          content="Servicio de facturación electrónica de Tecnologías Administrativas ELAD"
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
          content="Servicio de facturación electrónica de Tecnologías Administrativas ELAD"
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
        <FEHero />

        <Intro />

        <Precios />

        <Beneficios />

        <Contactanos />

        <TaeFooter />

        <BackToTop />
      </main>
    </>
  );
}

export default FacEle;
