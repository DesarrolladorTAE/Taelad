import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";

import { useState } from "react";
import axiosClient from "../../../services/axiosClient";
import { fetchMiTiendaTiendas } from "../../../services/superadminService";

const sistemas = [
  {
    id: "taeconta",
    nombre: "TAECONTA",
    logo: "/app/taeconta.png",
    descripcion: "Sistema contable, fiscal y administrativo",
    estado: "Activo",
  },
  {
    id: "telorecargo",
    nombre: "TELORECARGO",
    logo: "/app/telorecargo.png",
    descripcion: "Sistema de recargas electrónicas y servicios",
    estado: "Activo",
  },
  {
    id: "mitienda",
    nombre: "MI TIENDA",
    logo: "/app/mitienda.png",
    descripcion: "Sistema de tienda en línea y punto de venta",
    estado: "Activo",
  },
  {
  id: "clicmenu",
  nombre: "CLICMENU",
  logo: "/logo/clicmenu-naranja.png",
  descripcion: "Sistema de gestión para restaurantes, pedidos y control operativo",
  estado: "Activo",
}
];

type Sistema = {
  id: string;
  nombre: string;
  logo: string;
  descripcion: string;
  estado: string;
};

export default function Sistemas() {
  const [sistemaActivo, setSistemaActivo] = useState<Sistema | null>(null);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const abrirSistema = async (sistema: Sistema) => {
    setSistemaActivo(sistema);
    setLoading(true);

    try {
      let data: any[] = [];

      if (sistema.id === "taeconta") {
        const response = await axiosClient.get(
          "/superadmin/taeconta/empresas"
        );

        data = response.data?.data ?? [];
      }

      if (sistema.id === "telorecargo") {
        console.log("TELRECARGO aún no conectado");
        data = [];
      }

      if (sistema.id === "mitienda") {
        const response = await fetchMiTiendaTiendas();
       setEmpresas(response.data ?? []);
      }
      if (sistema.id === "ClicMenu") {
        console.log("ClicMenu aún no conectado");
        data = [];
      }
      

      setEmpresas(data);
    } catch (error) {
      console.error("Error cargando sistema:", error);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {/* HEADER */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Sistemas
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Control general de sistemas registrados.
        </Typography>
      </Box>

      {/* SISTEMAS */}
      <Grid container spacing={3} sx={{ width: "100%" }}>
        {sistemas.map((sistema) => (
          <Grid item xs={12} md={4} key={sistema.id} sx={{ minWidth: 0 }}>
            <Card
              onClick={() => abrirSistema(sistema)}
              sx={(theme) => ({
                width: "100%",
                minWidth: 0,
                cursor: "pointer",
                borderRadius: 4,
                transition: "0.2s",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#1C1F26"
                    : "#ffffff",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 6px 20px rgba(0,0,0,0.6)"
                    : "0 6px 20px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              })}
            >
              <CardContent sx={{ width: "100%", minWidth: 0 }}>

  {/* LOGO CORREGIDO */}
  <Box
    sx={{
      width: "100%",
      height: 90,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 2,
    }}
  >
    <Box
      component="img"
      src={sistema.logo}
      alt={sistema.nombre}
      sx={{
        maxWidth: "100%",
        maxHeight: 70,
        objectFit: "contain",
        display: "block",
       }}
      />
     </Box>

     {/* NOMBRE */}
     <Typography
      fontSize={22}
      fontWeight={800}
      sx={{
      whiteSpace: "normal",
      wordBreak: "break-word",
    }}
  >
    {sistema.nombre}
  </Typography>

  {/* DESCRIPCIÓN */}
  <Typography
    fontSize={14}
    color="text.secondary"
    sx={{
      whiteSpace: "normal",
      wordBreak: "break-word",
    }}
  >
    {sistema.descripcion}
  </Typography>

  {/* ESTADO */}
  <Box mt={2}>
    <Chip
      label={sistema.estado}
      sx={(theme) => ({
        backgroundColor:
          theme.palette.mode === "dark"
            ? "#2E7D32"
            : "#4CAF50",
        color: "#fff",
        fontWeight: 600,
      })}
      size="small"
    />
  </Box>

</CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* EMPRESAS */}
      {sistemaActivo && (
        <Box mt={4} sx={{ width: "100%", minWidth: 0 }}>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="h5" fontWeight={800} mb={2}>
            {sistemaActivo.nombre} - Empresas registradas
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2} sx={{ width: "100%" }}>
              {empresas.length > 0 ? (
                empresas.map((empresa: any, index: number) => (
                  <Grid item xs={12} md={4} key={index} sx={{ minWidth: 0 }}>
                    <Card sx={{ width: "100%", minWidth: 0 }}>
                      <CardContent>
                        <Typography fontWeight={700}>
                          {empresa.nombre ?? "Sin nombre"}
                        </Typography>

                        <Typography variant="body2">
                          RFC: {empresa.rfc ?? "N/A"}
                        </Typography>

                        <Typography variant="body2">
                          Estado: {empresa.estado ?? "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography color="text.secondary">
                  No hay empresas registradas.
                </Typography>
              )}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}