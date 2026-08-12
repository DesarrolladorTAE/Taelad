import React, {
  Suspense,
} from "react";

import {
  Navigate,
  useParams,
  useRoutes,
} from "react-router-dom";

import Root from "./Root";

// MiTienda
import MiTiendaDetalle from "../pages/Superadmin/components/MiTiendaDetalle";
import MiTiendaDashboard from "../pages/Superadmin/components/MiTiendaDashboard";
import MiTiendaTiendas from "../pages/Superadmin/components/MiTiendaTiendas";
import MiTiendaVentas from "../pages/Superadmin/components/MiTiendaVentas";

// =========================
// LANDINGS
// =========================

const Index1 = React.lazy(
  () =>
    import(
      "../pages/landings/Index1"
    ),
);

const Index3 = React.lazy(
  () =>
    import(
      "../pages/landings/Index3"
    ),
);

const Index4 = React.lazy(
  () =>
    import(
      "../pages/landings/Index4"
    ),
);

const Index5 = React.lazy(
  () =>
    import(
      "../pages/landings/Index5"
    ),
);

const Index6 = React.lazy(
  () =>
    import(
      "../pages/landings/Index6"
    ),
);

const FacEle = React.lazy(
  () =>
    import(
      "../pages/landings/Index1/FacEle"
    ),
);

const ConEle = React.lazy(
  () =>
    import(
      "../pages/landings/Index1/ConEle"
    ),
);

const DisWeb = React.lazy(
  () =>
    import(
      "../pages/landings/Index1/DisWeb"
    ),
);

const ImaCor = React.lazy(
  () =>
    import(
      "../pages/landings/Index1/ImaCor"
    ),
);

const MarDig = React.lazy(
  () =>
    import(
      "../pages/landings/Index1/MarDig"
    ),
);

// =========================
// BLOG PÚBLICO
// =========================

const Blogs = React.lazy(
  () =>
    import(
      "../pages/landings/Index1/Blogs"
    ),
);

const BlogPostDetail =
  React.lazy(
    () =>
      import(
        "../pages/landings/Index1/BlogPostDetail"
      ),
  );

// =========================
// PANELES
// =========================

const Panel = React.lazy(
  () =>
    import(
      "../pages/users/panel"
    ),
);

const Superadmin =
  React.lazy(
    () =>
      import(
        "../pages/Superadmin/panel"
      ),
  );

// =========================
// TAECONTA
// =========================

const TaecontaEmpresasPage =
  React.lazy(
    () =>
      import(
        "../pages/taeconta/TaecontaEmpresasPage"
      ),
  );

const TaecontaTimbradoPage =
  React.lazy(
    () =>
      import(
        "../pages/Superadmin/taeconta/TaecontaTimbradoPage"
      ),
  );

// =========================
// TARJETAS
// =========================

const TarjetaJennys =
  React.lazy(
    () =>
      import(
        "../tarjetas/TarjetaJennys"
      ),
  );

const EnlacesTerrestres =
  React.lazy(
    () =>
      import(
        "../tarjetas/EnlacesTerrestres"
      ),
  );

const BalnearioSantaMaria =
  React.lazy(
    () =>
      import(
        "../tarjetas/balneario-rancho-santa-maria"
      ),
  );

// =========================
// FOOTER
// =========================

const Nosotros = React.lazy(
  () =>
    import(
      "../pages/TaeFooter/Nosotros"
    ),
);

const AvisoPrivacidad =
  React.lazy(
    () =>
      import(
        "../pages/TaeFooter/Aviso"
      ),
  );

const TerminosCondiciones =
  React.lazy(
    () =>
      import(
        "../pages/TaeFooter/TerCon"
      ),
  );

// =========================
// ERRORES
// =========================

const NotFound = React.lazy(
  () =>
    import(
      "../pages/errors/NotFound"
    ),
);

// =========================
// AUTH
// =========================

const Login = React.lazy(
  () =>
    import(
      "../pages/auth/Login"
    ),
);

const SignUp = React.lazy(
  () =>
    import(
      "../pages/auth/Signin"
    ),
);

type LoadComponentProps = {
  component:
    React.ComponentType;
};

function Loading() {
  return (
    <div
      style={{
        padding: 20,
      }}
    >
      Cargando…
    </div>
  );
}

function LoadComponent({
  component: Component,
}: LoadComponentProps) {
  return (
    <Suspense
      fallback={
        <Loading />
      }
    >
      <Component />
    </Suspense>
  );
}

function LegacyBlogPostRedirect() {
  const {
    postSlug = "",
  } = useParams<{
    postSlug: string;
  }>();

  if (!postSlug) {
    return (
      <Navigate
        to="/blogs"
        replace
      />
    );
  }

  return (
    <Navigate
      to={`/blogs/${encodeURIComponent(
        postSlug,
      )}`}
      replace
    />
  );
}

type SuperadminViewRedirectProps = {
  view: string;
};

function SuperadminViewRedirect({
  view,
}: SuperadminViewRedirectProps) {
  if (
    typeof window !==
    "undefined"
  ) {
    localStorage.setItem(
      "superadmin_view",
      view,
    );
  }

  return (
    <Navigate
      to="/superadmin/"
      replace
    />
  );
}

export default function AllRoutes() {
  return useRoutes([
    {
      path: "/",

      element: <Root />,

      children: [
        {
          index: true,

          element: (
            <LoadComponent
              component={
                Index1
              }
            />
          ),
        },

        // =========================
        // LANDINGS
        // =========================

        {
          path:
            "landing",

          element: (
            <Navigate
              to="/"
              replace
            />
          ),
        },

        {
          path:
            "index3",

          element: (
            <LoadComponent
              component={
                Index3
              }
            />
          ),
        },

        {
          path:
            "index4",

          element: (
            <LoadComponent
              component={
                Index4
              }
            />
          ),
        },

        {
          path:
            "index5",

          element: (
            <LoadComponent
              component={
                Index5
              }
            />
          ),
        },

        {
          path:
            "index6",

          element: (
            <LoadComponent
              component={
                Index6
              }
            />
          ),
        },

        {
          path:
            "facturacion",

          element: (
            <LoadComponent
              component={
                FacEle
              }
            />
          ),
        },

        {
          path:
            "contabilidad",

          element: (
            <LoadComponent
              component={
                ConEle
              }
            />
          ),
        },

        {
          path:
            "desarrollo",

          element: (
            <LoadComponent
              component={
                DisWeb
              }
            />
          ),
        },

        {
          path:
            "diseno",

          element: (
            <LoadComponent
              component={
                ImaCor
              }
            />
          ),
        },

        {
          path:
            "marketing",

          element: (
            <LoadComponent
              component={
                MarDig
              }
            />
          ),
        },

        // =========================
        // BLOG PÚBLICO
        // =========================

        {
          path:
            "blogs",

          element: (
            <LoadComponent
              component={
                Blogs
              }
            />
          ),
        },

        {
          path:
            "blogs/:postSlug",

          element: (
            <LoadComponent
              component={
                BlogPostDetail
              }
            />
          ),
        },

        {
          path:
            "blog",

          element: (
            <Navigate
              to="/blogs"
              replace
            />
          ),
        },

        {
          path:
            "blog/:postSlug",

          element: (
            <LegacyBlogPostRedirect />
          ),
        },

        {
          path:
            "blogs/:systemSlug/:blogSlug/posts/:postSlug",

          element: (
            <LegacyBlogPostRedirect />
          ),
        },

        // =========================
        // FOOTER
        // =========================

        {
          path:
            "nosotros",

          element: (
            <LoadComponent
              component={
                Nosotros
              }
            />
          ),
        },

        {
          path:
            "aviso-privacidad",

          element: (
            <LoadComponent
              component={
                AvisoPrivacidad
              }
            />
          ),
        },

        {
          path:
            "terminos-condiciones",

          element: (
            <LoadComponent
              component={
                TerminosCondiciones
              }
            />
          ),
        },

        // =========================
        // TARJETAS
        // =========================

        {
          path:
            "jennysbananasandfruits",

          element: (
            <LoadComponent
              component={
                TarjetaJennys
              }
            />
          ),
        },

        {
          path:
            "enlaces-terrestres",

          element: (
            <LoadComponent
              component={
                EnlacesTerrestres
              }
            />
          ),
        },

        {
          path:
            "balneario-rancho-santa-maria",

          element: (
            <LoadComponent
              component={
                BalnearioSantaMaria
              }
            />
          ),
        },

        // =========================
        // MI TIENDA
        // =========================

        {
          path:
            "superadmin/mitienda/:id/dashboard",

          element: (
            <MiTiendaDashboard />
          ),
        },

        {
          path:
            "superadmin/mitienda/:id/tiendas",

          element: (
            <MiTiendaTiendas />
          ),
        },

        {
          path:
            "superadmin/mitienda/:id/ventas",

          element: (
            <MiTiendaVentas />
          ),
        },

        {
          path:
            "superadmin/mitienda/tiendas/:tiendaId",

          element: (
            <MiTiendaDetalle />
          ),
        },

        // =========================
        // TAECONTA
        // =========================

        {
          path:
            "taeconta/empresas",

          element: (
            <LoadComponent
              component={
                TaecontaEmpresasPage
              }
            />
          ),
        },

        /*
         * Compatibilidad con la URL
         * anterior de empresas.
         *
         * Ahora entra al módulo dentro
         * del Shell del Superadmin.
         */
        {
          path:
            "superadmin/taeconta/empresas",

          element: (
            <SuperadminViewRedirect
              view="taeconta-informacion"
            />
          ),
        },

        /*
         * Entrada nueva de TAECONTA.
         *
         * Abre directamente el Dashboard real dentro
         * del Shell del Superadmin.
         *
         * "taeconta-inicio" ya no se usa para esta ruta.
         */
        {
          path:
            "superadmin/systems/taeconta",

          element: (
            <SuperadminViewRedirect
              view="taeconta-informacion"
            />
          ),
        },

        /*
         * Entrada directa a información
         * manteniendo el Shell.
         */
        {
          path:
            "superadmin/systems/taeconta/informacion",

          element: (
            <SuperadminViewRedirect
              view="taeconta-informacion"
            />
          ),
        },

        {
          path:
            "superadmin/facturacion/timbrado",

          element: (
            <LoadComponent
              component={
                TaecontaTimbradoPage
              }
            />
          ),
        },

        // =========================
        // AUTH
        // =========================

        {
          path:
            "auth",

          element: (
            <Navigate
              to="/auth/login"
              replace
            />
          ),
        },

        {
          path:
            "auth/login",

          element: (
            <LoadComponent
              component={
                Login
              }
            />
          ),
        },

        {
          path:
            "auth/signup",

          element: (
            <LoadComponent
              component={
                SignUp
              }
            />
          ),
        },

        // =========================
        // PANELES
        // =========================

        {
          path:
            "panel/*",

          element: (
            <LoadComponent
              component={
                Panel
              }
            />
          ),
        },

        {
          path:
            "superadmin/*",

          element: (
            <LoadComponent
              component={
                Superadmin
              }
            />
          ),
        },

        // =========================
        // 404
        // =========================

        {
          path: "*",

          element: (
            <LoadComponent
              component={
                NotFound
              }
            />
          ),
        },
      ],
    },
  ]);
}