import { Helmet } from "react-helmet-async";

import { Navbar1 } from "../../../components/navbar";
import CEHero from "../../../components/ConEle/CEHero";
import Iconos from "../../../components/ConEle/Iconos";
import Nube from "../../../components/ConEle/Nube";
import Correo from "../../../components/ConEle/Correo";
import AltaClientes from "../../../components/ConEle/AltaClientes";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const PAGE_CANONICAL_URL =
  `${SITE_URL}/contabilidad`;

const PAGE_TITLE =
  "Contabilidad electrónica para empresas | Tecnologías Administrativas ELAD";

const PAGE_DESCRIPTION =
  "Soluciones de contabilidad electrónica para administrar información fiscal, clientes, documentos y procesos contables desde una plataforma digital.";

const PAGE_KEYWORDS = [
  "contabilidad electrónica",
  "software contable",
  "sistema contable",
  "contabilidad para empresas",
  "administración fiscal",
  "procesos contables",
  "plataforma contable",
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
      name: "Contabilidad electrónica",
      serviceType:
        "Software de contabilidad electrónica",
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

function ConEle() {
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
          content="Servicio de contabilidad electrónica de Tecnologías Administrativas ELAD"
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
          content="Servicio de contabilidad electrónica de Tecnologías Administrativas ELAD"
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
          <CEHero />
          <Iconos />
        </section>

        <section id="features">
          <Nube />
          <Correo />
          <AltaClientes />
        </section>

        <TaeFooter />

        <BackToTop />
      </main>
    </>
  );
}

export default ConEle;
