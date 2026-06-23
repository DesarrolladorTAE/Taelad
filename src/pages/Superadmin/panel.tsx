import Shell from "./components/Shell";

import Dashboard from "./components/Dashboard";
import Metricas from "./components/Metricas";
import Sistemas from "./components/Sistemas";
import Facturacion from "./components/Facturacion";
import Usuarios from "./components/Usuarios";
import Administradores from "./components/Administradores";
import Configuracion from "./components/Configuracion";

import "./superadmin.css";


export default function SuperAdminPanel() {

  return (

    <Shell>

      {(darkMode, view, setView) => {

        const volverPanel = () => {
          setView("dashboard");
        };


        if (view === "metricas") {
          return (
            <Metricas
              darkMode={darkMode}
              volver={volverPanel}
            />
          );
        }


        if (view === "sistemas") {
          return (
            <Sistemas
              darkMode={darkMode}
              volver={volverPanel}
            />
          );
        }


        if (view === "facturacion") {
          return (
            <Facturacion
              darkMode={darkMode}
              volver={volverPanel}
            />
          );
        }


        if (view === "usuarios") {
          return (
            <Usuarios
              darkMode={darkMode}
              volver={volverPanel}
            />
          );
        }


        if (view === "administradores") {
          return (
            <Administradores
              darkMode={darkMode}
              volver={volverPanel}
            />
          );
        }


        if (view === "configuracion") {
          return (
            <Configuracion
              darkMode={darkMode}
              volver={volverPanel}
            />
          );
        }


        return (
          <Dashboard
            darkMode={darkMode}
          />
        );

      }}

    </Shell>

  );
}