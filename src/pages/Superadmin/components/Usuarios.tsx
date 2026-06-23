import { useEffect, useState } from "react";
import { getSuperAdminUsers } from "../../../services/superadminService";


export default function Usuarios() {

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    getSuperAdminUsers()
      .then((res) => {

        setUsuarios(res.data || []);

      })
      .catch((error) => {

        console.error("Error cargando usuarios:", error);

      })
      .finally(() => {

        setLoading(false);

      });


  }, []);



  return (

    <section className="superadmin-section usuarios-view">


      <div className="section-header">

        <h2>Usuarios</h2>

        <p>
          Administración de usuarios registrados en el sistema.
        </p>

      </div>



      <div className="superadmin-panel panel-usuarios">


        {loading ? (

          <p>Cargando usuarios...</p>

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


              {usuarios.length === 0 ? (

                <tr>
                  <td colSpan={5}>
                    Sin usuarios registrados
                  </td>
                </tr>


              ) : (


                usuarios.map((usuario) => (


                  <tr key={usuario.id}>

                    <td>{usuario.id}</td>

                    <td>
                      {usuario.name || "-"}
                    </td>

                    <td>
                      {usuario.email || "-"}
                    </td>


                    <td>

                      <span className="badge neutral">

                        {
                          usuario.role_id === 1 ||
                          usuario.role_id === "1"
                            ? "Administrador"
                            : "Usuario"
                        }

                      </span>

                    </td>


                    <td>
                      {
                        usuario.created_at
                          ? new Date(usuario.created_at)
                              .toLocaleDateString("es-MX")
                          : "-"
                      }
                    </td>


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