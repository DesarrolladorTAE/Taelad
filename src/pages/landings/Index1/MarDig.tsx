import { Helmet } from "react-helmet-async";

import { Navbar1 } from "../../../components/navbar";
import MDHero from "../../../components/MarDig/MDHero";
import Creamos from "../../../components/MarDig/Creamos";
import Servicios from "../../../components/MarDig/Servicios";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const PAGE_CANONICAL_URL =
  `${SITE_URL}/marketing`;

const PAGE_TITLE =
  "Marketing digital para empresas | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Servicios de marketing digital, estrategia de contenidos, presencia en redes sociales y campañas en línea para fortalecer marcas, empresas y negocios.";

const PAGE_KEYWORDS = [
  "marketing digital",
  "redes sociales",
  "estrategia de contenidos",
  "publicidad digital",
  "campañas en línea",
  "posicionamiento de marca",
  "marketing para empresas",
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
      name: "Marketing digital",
      serviceType:
        "Estrategia y servicios de marketing digital para empresas",
      description: PAGE_DESCRIPTION,
      url: PAGE_CANONICAL_URL,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "México",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de marketing digital",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Estrategia de contenidos",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Gestión de redes sociales",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Publicidad digital",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Posicionamiento de marca",
            },
          },
        ],
      },
    },
  ],
};

function MarDig() {
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
          content="Servicio de marketing digital de Tecnologías Administrativas ELAD"
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
          content="Servicio de marketing digital de Tecnologías Administrativas ELAD"
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
        <section id="home">
          <MDHero />
          <Creamos />
        </section>

        <section id="features">
          <Servicios />
        </section>

        <TaeFooter />

        <BackToTop />
      </main>
    </>
  );
}

export default MarDig;