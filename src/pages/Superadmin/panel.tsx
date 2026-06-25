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
import MiTiendaMetricas from "./components/MiTiendaMetricas";
import MiTiendaSuscripcionesGlobal from "./components/MiTiendaSuscripcionesGlobal";

export default function SuperAdminPanel() {
  return (
    <Shell>
      {(_, view, setView) => {
        switch (view) {
          case "metricas":
            return <Metricas />;

          case "sistemas":
            return <Sistemas setView={setView} />;

          case "facturacion":
            return <Facturacion />;

          case "usuarios":
            return <Usuarios />;

          case "administradores":
            return <Administradores />;

          case "configuracion":
            return <Configuracion />;

          case "mitienda-dashboard":
            return <MiTiendaDashboard setView={setView} />;

          case "mitienda-tiendas":
            return <MiTiendaTiendas setView={setView} />;

          case "mitienda-ventas":
            return <MiTiendaVentas setView={setView} />;

          case "mitienda-metricas":
            return <MiTiendaMetricas setView={setView} />;

                     case "mitienda-suscripciones":
            return <MiTiendaSuscripcionesGlobal setView={setView} />;

          default:
            return <Dashboard />;
        }
      }}
    </Shell>
  );
}