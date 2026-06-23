export default function Sistemas() {
  return (
    <section className="superadmin-section sistemas-view">
      <div className="section-header">
        <h2>Sistemas</h2>
        <p>Control de sistemas registrados dentro de la plataforma.</p>
      </div>

      <div className="superadmin-panel panel-sistemas">
        <table className="superadmin-table">
          <thead>
            <tr>
              <th>Sistema</th>
              <th>Estado</th>
              <th>Usuarios</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Sin sistemas registrados</td>
              <td><span className="badge neutral">Pendiente</span></td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}