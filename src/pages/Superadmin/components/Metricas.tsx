export default function Metricas() {
  return (
    <section className="superadmin-section metricas-view">
      <div className="section-header">
        <h2>Métricas generales</h2>
        <p>Resumen operativo del panel SuperAdmin.</p>
      </div>

      <div className="superadmin-grid">
        <div className="superadmin-card card-blue">
          <span>Total usuarios</span>
          <strong>0</strong>
        </div>

        <div className="superadmin-card card-green">
          <span>Sistemas activos</span>
          <strong>0</strong>
        </div>

        <div className="superadmin-card card-orange">
          <span>Facturación mensual</span>
          <strong>$0.00</strong>
        </div>

        <div className="superadmin-card card-purple">
          <span>Administradores</span>
          <strong>0</strong>
        </div>
      </div>
    </section>
  );
}