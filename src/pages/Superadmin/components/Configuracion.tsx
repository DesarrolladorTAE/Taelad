export default function Configuracion() {
  return (
    <section className="superadmin-section configuracion-view">
      <div className="section-header">
        <h2>Configuración</h2>
        <p>Ajustes generales del panel SuperAdmin.</p>
      </div>

      <div className="superadmin-panel panel-configuracion">
        <div className="superadmin-form-group">
          <label>Nombre del sistema</label>
          <input type="text" placeholder="Nombre del sistema" />
        </div>

        <div className="superadmin-form-group">
          <label>Correo de soporte</label>
          <input type="email" placeholder="soporte@dominio.com" />
        </div>

        <div className="superadmin-form-group">
          <label>Estado general</label>
          <select>
            <option>Activo</option>
            <option>Mantenimiento</option>
            <option>Inactivo</option>
          </select>
        </div>

        <button className="superadmin-button" type="button">
          Guardar configuración
        </button>
      </div>
    </section>
  );
}