import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";
import { Box, Typography, CircularProgress, Card, CardContent } from "@mui/material";

export default function MiTiendaTiendaDetalle() {
  const { tiendaId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      try {
        const res = await axiosClient.get(
          `/superadmin/mitienda/tienda/${tiendaId}`
        );

        setData(res.data?.data ?? res.data ?? null);
      } catch (error) {
        console.error(error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (tiendaId) fetch();
  }, [tiendaId]);

  if (loading) return <CircularProgress />;

  if (!data) return <Typography>No se encontró la tienda</Typography>;

  return (
    <Box sx={{ p: 2 }}>

      {/* HEADER */}
      <Typography variant="h5" fontWeight={800}>
        {data.nombre}
      </Typography>

      <Typography color="text.secondary">
        {data.email} | {data.telefono}
      </Typography>

      {/* PLAN */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={700}>Plan</Typography>

          <Typography>
            {data.plan?.nombre_plan}
          </Typography>

          <Typography>
            Estado: {data.plan?.estado}
          </Typography>

          <Typography>
            Vence: {data.plan?.vence}
          </Typography>
        </CardContent>
      </Card>

      {/* FISCAL */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={700}>Datos fiscales</Typography>

          <Typography>RFC: {data.datos_fiscales?.rfc ?? "N/A"}</Typography>
          <Typography>
            Razón social: {data.datos_fiscales?.razon_social ?? "N/A"}
          </Typography>
        </CardContent>
      </Card>

      {/* TAECONTA */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={700}>TAECONTA</Typography>

          <Typography>
            Correo: {data.taeconta?.correo_tae ?? "N/A"}
          </Typography>
        </CardContent>
      </Card>

    </Box>
  );
}