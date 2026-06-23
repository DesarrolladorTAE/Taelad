import { useEffect, useState } from "react";
import { getSuperAdminAdministrators } from "../../../services/superadminService";

export default function Administradores({ volver }: any) {
  const [administradores, setAdministradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuperAdminAdministrators()
      .then((res) => {
        setAdministradores(res.data || []);
      })
      .catch((error) => {
        console.error("Error cargando administradores:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="superadmin-section administradores-view">
      <div className="section-header">
        <button type="button" onClick={volver} className="superadmin-button">
          Volver
        </button>

        <h2>Administradores</h2>
        <p>Usuarios con permisos administrativos.</p>
      </div>

      <div className="superadmin-panel panel-administradores">
        {loading ? (
          <p>Cargando administradores...</p>
        ) : (
          <table className="superadmin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Registro</th>
              </tr>
            </thead>

            <tbody>
              {administradores.length === 0 ? (
                <tr>
                  <td colSpan={5}>Sin administradores registrados</td>
                </tr>
              ) : (
                administradores.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>{admin.name || "-"}</td>
                    <td>{admin.email || "-"}</td>
                    <td>
                      <span className="badge neutral">Administrador</span>
                    </td>
                    <td>{admin.created_at || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}