import { Helmet } from "react-helmet-async";

import { Hero1 } from "../../../components/heros";
import { Navbar1 } from "../../../components/navbar";

import HowItWork from "../../../components/HowItWork";
import Features1 from "../../../components/Features1";
import Features2 from "../../../components/Features2";
import Testimonial from "../../../components/Testimonial";
import Slider from "../../../components/Slider";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

const SITE_URL =
  "https://tecnologiasadministrativas.com";

const HOME_CANONICAL_URL =
  `${SITE_URL}/`;

const HOME_TITLE =
  "Tecnologías Administrativas ELAD | Soluciones digitales para empresas";

const HOME_DESCRIPTION =
  "Desarrollo de software, tiendas en línea, puntos de venta, automatización, marketing digital y soluciones administrativas para impulsar empresas y negocios.";

const HOME_KEYWORDS = [
  "tecnologías administrativas",
  "desarrollo de software",
  "software empresarial",
  "tiendas en línea",
  "punto de venta",
  "automatización empresarial",
  "marketing digital",
  "transformación digital",
];

const HOME_IMAGE_URL =
  `${SITE_URL}/logo192.png`;

const HOME_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Tecnologías Administrativas ELAD",
      url: HOME_CANONICAL_URL,
      logo: {
        "@type": "ImageObject",
        url: HOME_IMAGE_URL,
      },
      description: HOME_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: HOME_CANONICAL_URL,
      name: "Tecnologías Administrativas ELAD",
      description: HOME_DESCRIPTION,
      inLanguage: "es-MX",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: HOME_CANONICAL_URL,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: "es-MX",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
  ],
};

function Index1() {
  return (
    <>
      <Helmet>
        <html lang="es-MX" />

        <title>{HOME_TITLE}</title>

        <meta
          name="description"
          content={HOME_DESCRIPTION}
        />

        <meta
          name="keywords"
          content={HOME_KEYWORDS.join(", ")}
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href={HOME_CANONICAL_URL}
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
          content={HOME_TITLE}
        />

        <meta
          property="og:description"
          content={HOME_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={HOME_CANONICAL_URL}
        />

        <meta
          property="og:image"
          content={HOME_IMAGE_URL}
        />

        <meta
          property="og:image:alt"
          content="Tecnologías Administrativas ELAD"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={HOME_TITLE}
        />

        <meta
          name="twitter:description"
          content={HOME_DESCRIPTION}
        />

        <meta
          name="twitter:image"
          content={HOME_IMAGE_URL}
        />

        <meta
          name="twitter:image:alt"
          content="Tecnologías Administrativas ELAD"
        />

        <script type="application/ld+json">
          {JSON.stringify(
            HOME_STRUCTURED_DATA
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
          <Hero1 />
          <HowItWork />
        </section>

        <section id="features">
          <Features1 />
        </section>

        <section id="screenshot">
          <Features2 />
          <Slider />
        </section>

        <Testimonial />

        <section id="pricing" />

        <TaeFooter />

        <BackToTop />
      </main>
    </>
  );
}

export default Index1;
