import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";

export default function MiTiendaMetricas() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await axiosClient.get(
        `/superadmin/mitienda/${id}/metricas`
      );

      setData(res.data?.data ?? null);
    };

    if (id) fetch();
  }, [id]);

  return (
    <div>
      <h2>Métricas</h2>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}