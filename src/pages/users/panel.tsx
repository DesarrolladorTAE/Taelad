
import React from "react";
import { Routes, Route } from "react-router-dom";
import Shell from "./components/Shell";
import Dashboard from "./components/Dashboard";
import MiCuenta from "./components/MiCuenta";
import DatosFiscales from "./components/DatosFiscales";
import Configuracion from "./components/Configuracion";
import ProductosTae from "./components/ProductosTae";
import HistorialCompras from "./components/HistorialCompras";
import TaeTeDaMas from "./components/TaeTeDaMas";
import SistemaDetalle from "./components/SistemaDetalle";

export default function UsersApp() {
  return (
    <Routes>
      <Route path="/" element={<Shell title="Panel de Sistemas"><Dashboard/></Shell>} />
      <Route path="/mi-cuenta" element={<Shell title="Mi cuenta"><MiCuenta/></Shell>} />
      <Route path="/datos-fiscales" element={<Shell title="Datos fiscales"><DatosFiscales/></Shell>} />
      <Route path="/configuracion" element={<Shell title="Configuración"><Configuracion/></Shell>} />

      {/* Secciones nuevas */}
      <Route path="/productos-tae" element={<Shell title="Productos TAE"><ProductosTae/></Shell>} />
      <Route path="/historial-compras" element={<Shell title="Historial de compras"><HistorialCompras/></Shell>} />
      <Route path="/tae-te-da-mas" element={<Shell title="TAE te da más"><TaeTeDaMas/></Shell>} />

      {/* Detalles por sistema */}
      <Route path="/sistema/taeconta" element={<Shell title="TAECONTA"><SistemaDetalle title="TAECONTA" image="/app/taeconta.png" /></Shell>} />
      <Route path="/sistema/mitienda" element={<Shell title="MiTiendaEnLineaMX"><SistemaDetalle title="MiTiendaEnLineaMX" image="/app/mitienda.png" /></Shell>} />
      <Route path="/sistema/telorecargo" element={<Shell title="Te Lo Recargo"><SistemaDetalle title="Te Lo Recargo" image="/app/telorecargo.png" /></Shell>} />
      <Route path="/sistema/tbt" element={<Shell title="The Business Ticket"><SistemaDetalle title="The Business Ticket" image="/app/thebusinessticket.svg" /></Shell>} />
    </Routes>

  );
}
