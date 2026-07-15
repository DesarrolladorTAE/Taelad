import Shell from "./components/Shell";

import Dashboard from "./components/Dashboard";
import Usuarios from "./components/Usuarios";
import Metricas from "./components/Metricas";
import Sistemas from "./components/Sistemas";
import Facturacion from "./components/Facturacion";
import Administradores from "./components/Administradores";
import Configuracion from "./components/Configuracion";

import MiTiendaDashboard from "./components/MiTiendaDashboard";
import MiTiendaTiendas from "./components/MiTiendaTiendas";
import MiTiendaVentas from "./components/MiTiendaVentas";
import MiTiendaSuscripcionesGlobal from "./components/MiTiendaSuscripcionesGlobal";

import ClicMenuDashboard from "./components/ClicMenu/ClicMenuDashboard";
import ClicMenuInicio from "./components/ClicMenu/ClicMenuInicio";

import TeaTeDaMas from "./components/TeaTeDaMas";

import BlogAdminShell from "./components/Blogs/BlogAdminShell";

export default function SuperAdminPanel() {
  return (
    <Shell>
      {(darkMode, view, setView) => {
        switch (view) {
          case "dashboard":
            return <Dashboard darkMode={darkMode} />;

          case "metricas":
            return <Metricas darkMode={darkMode} />;

          case "sistemas":
            return <Sistemas setView={setView} />;

          case "tea-te-da-mas":
            return <TeaTeDaMas />;

          case "facturacion":
            return <Facturacion />;

          case "usuarios":
            return <Usuarios />;

          case "administradores":
            return <Administradores />;

          case "configuracion":
            return <Configuracion />;

          /*
          |--------------------------------------------------------------------------
          | MI TIENDA
          |--------------------------------------------------------------------------
          */

          case "mitienda-dashboard":
            return <MiTiendaDashboard setView={setView} />;

          case "mitienda-tiendas":
            return <MiTiendaTiendas setView={setView} />;

          case "mitienda-ventas":
            return <MiTiendaVentas setView={setView} />;

          case "mitienda-suscripciones":
            return <MiTiendaSuscripcionesGlobal setView={setView} />;

        case "mitienda-blogs":
  return (
    <BlogAdminShell
      systemId={2}
      systemName="Mi Tienda en Línea MX"
      backView="mitienda-dashboard"
      setView={setView}
    />
  );

/*
|--------------------------------------------------------------------------
| CLICMENU
|--------------------------------------------------------------------------
*/

case "clicmenu-inicio":
  return <ClicMenuInicio setView={setView} />;

case "clicmenu":
  return <ClicMenuDashboard />;

case "clicmenu-blogs":
  return (
    <BlogAdminShell
      systemId={3}
      systemName="ClicMenu"
      backView="clicmenu-inicio"
      setView={setView}
    />
  );
  case "elad-blog":
  return (
    <BlogAdminShell
      systemId={5}
      systemName="Tecnologías Administrativas ELAD"
      backView="sistemas"
      setView={setView}
    />
  );


default:
  return <Dashboard darkMode={darkMode} />;
        }
      }}
    </Shell>
  );

}