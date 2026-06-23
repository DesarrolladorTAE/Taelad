import { useEffect, useState } from "react";
import { getSuperAdminDashboard } from "../../../services/superadminService";

export default function Metricas({ darkMode, volver }: any) {
  const [data, setData] = useState({
    total_usuarios: 0,
    total_administradores: 0,
    sistemas_activos: 0,
    facturacion_mensual: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuperAdminDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        console.error("Error cargando métricas:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Cargando métricas...</p>;
  }

  return (
    <section className="superadmin-section metricas-view">
      <div className="section-header">
        <button type="button" onClick={volver} className="superadmin-button">
          Volver
        </button>

        <h2>Métricas generales</h2>
        <p>Resumen operativo del panel SuperAdmin.</p>
      </div>

      <div className="superadmin-grid">
        <div className="superadmin-card card-blue">
          <span>Total usuarios</span>
          <strong>{data.total_usuarios}</strong>
        </div>

        <div className="superadmin-card card-green">
          <span>Sistemas activos</span>
          <strong>{data.sistemas_activos}</strong>
        </div>

        <div className="superadmin-card card-orange">
          <span>Facturación mensual</span>
          <strong>
            ${Number(data.facturacion_mensual || 0).toLocaleString("es-MX")}
          </strong>
        </div>

        <div className="superadmin-card card-purple">
          <span>Administradores</span>
          <strong>{data.total_administradores}</strong>
        </div>
      </div>
    </section>
  );
}