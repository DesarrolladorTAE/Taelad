import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";

import { useState } from "react";
import axiosClient from "../../../services/axiosClient";
import { useNavigate } from "react-router-dom";

type Sistema = {
  id: string;
  nombre: string;
  logo: string;
  descripcion: string;
  estado: string;
};

const sistemas: Sistema[] = [
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
  },
];

export default function Sistemas() {
  const navigate = useNavigate();

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
        data = [];
      }

      if (sistema.id === "mitienda") {
        const response = await axiosClient.get(
          "/superadmin/mitienda/tiendas"
        );
        data = response.data ?? [];
      }

      if (sistema.id === "clicmenu") {
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
    <Box sx={{ width: "100%" }}>
      {/* HEADER */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Sistemas
        </Typography>

        <Typography color="text.secondary">
          Control general de sistemas registrados.
        </Typography>
      </Box>

      {/* SISTEMAS */}
      <Grid container spacing={3}>
        {sistemas.map((sistema) => (
          <Grid item xs={12} md={4} key={sistema.id}>
            <Card
              onClick={() => abrirSistema(sistema)}
              sx={{
                cursor: "pointer",
                borderRadius: 4,
                transition: "0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <img
                    src={sistema.logo}
                    alt={sistema.nombre}
                    style={{ maxHeight: 70, objectFit: "contain" }}
                  />
                </Box>

                <Typography fontSize={18} fontWeight={800}>
                  {sistema.nombre}
                </Typography>

                <Typography fontSize={13} color="text.secondary">
                  {sistema.descripcion}
                </Typography>

                <Chip
                  label={sistema.estado}
                  size="small"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* EMPRESAS */}
      {sistemaActivo && (
        <Box mt={4}>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6">
            {sistemaActivo.nombre} - Empresas
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {empresas.length > 0 ? (
                empresas.map((empresa: any, i: number) => (
                  <Grid item xs={12} md={4} key={i}>
                    <Card>
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