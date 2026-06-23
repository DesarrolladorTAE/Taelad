export default function Facturacion() {
  return (
    <section className="superadmin-section">
      <h2>Facturación</h2>

      <div className="superadmin-panel">
        <p>Control general de pagos, suscripciones y movimientos.</p>

        <table className="superadmin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Sin registros</td>
              <td>-</td>
              <td>$0.00</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}