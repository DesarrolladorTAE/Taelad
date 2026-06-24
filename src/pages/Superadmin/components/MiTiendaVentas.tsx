import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";

export default function MiTiendaVentas() {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axiosClient.get(
        `/superadmin/mitienda/${id}/ventas`
      );

      setData(res.data?.data ?? []);
    };

    if (id) fetch();
  }, [id]);

  return (
    <div>
      <h2>Ventas</h2>

      {data.map((v, i) => (
        <div key={i}>
          {v.total}
        </div>
      ))}
    </div>
  );
}