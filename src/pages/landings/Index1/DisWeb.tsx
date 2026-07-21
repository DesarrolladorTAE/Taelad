import { Helmet } from "react-helmet-async";

import { Navbar1 } from "../../../components/navbar";
import DWHero from "../../../components/DisWeb/DWHero";
import PaqDW from "../../../components/DisWeb/PaqDW";
import PaqMan from "../../../components/DisWeb/PaqMan";
import PaqWP from "../../../components/DisWeb/PaqWP";
import PaqSEO from "../../../components/DisWeb/PaqSEO";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const PAGE_CANONICAL_URL =
  `${SITE_URL}/desarrollo`;

const PAGE_TITLE =
  "Desarrollo web y software para empresas | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Desarrollo de sitios web, sistemas empresariales, mantenimiento, soluciones WordPress y optimización SEO para empresas y negocios.";

const PAGE_KEYWORDS = [
  "desarrollo web",
  "desarrollo de software",
  "sistemas empresariales",
  "diseño de páginas web",
  "mantenimiento web",
  "WordPress",
  "posicionamiento SEO",
  "software a la medida",
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
      name: "Desarrollo web y software",
      serviceType:
        "Desarrollo de software y soluciones web para empresas",
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
        name: "Servicios de desarrollo digital",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Desarrollo de sitios web",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Mantenimiento web",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Desarrollo con WordPress",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Optimización SEO",
            },
          },
        ],
      },
    },
  ],
};

function DisWeb() {
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
          content="Servicio de desarrollo web y software de Tecnologías Administrativas ELAD"
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
          content="Servicio de desarrollo web y software de Tecnologías Administrativas ELAD"
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
          <DWHero />
          <PaqDW />
        </section>

        <section id="features">
          <PaqMan />
          <PaqWP />
          <PaqSEO />
        </section>

        <TaeFooter />

        <BackToTop />
      </main>
    </>
  );
}

export default DisWeb;
