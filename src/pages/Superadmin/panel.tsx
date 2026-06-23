import Shell from "./components/Shell";

import Dashboard from "./components/Dashboard";
import Usuarios from "./components/Usuarios";
import Metricas from "./components/Metricas";
import Sistemas from "./components/Sistemas";
import Facturacion from "./components/Facturacion";
import Administradores from "./components/Administradores";
import Configuracion from "./components/Configuracion";


export default function SuperAdminPanel() {
  return (
    <Shell>
      {(_, view, setView) => {
        const volverPanel = () => setView("dashboard");

        switch (view) {
          case "metricas":
            return <Metricas />;

          case "sistemas":
            return <Sistemas />;

          case "facturacion":
            return <Facturacion />;

          case "usuarios":
            return <Usuarios />;

          case "administradores":
            return <Administradores />;

          case "configuracion":
            return <Configuracion />;

          default:
            return <Dashboard />;
        }
      }}
    </Shell>
  );
}