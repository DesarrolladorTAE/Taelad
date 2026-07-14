import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

type Sistema = {
  id: string;
  nombre: string;
  logo: string;
  descripcion: string;
  estado: string;
};

type Props = {
  setView?: (view: string) => void;
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
    descripcion:
      "Sistema de gestión para restaurantes, pedidos y control operativo",
    estado: "Activo",
  },
];

export default function Sistemas({ setView }: Props) {
  const navigate = useNavigate();

  const abrirSistema = (sistema: Sistema) => {
    if (!sistema?.id) return;

    if (sistema.id === "mitienda") {
      setView?.("mitienda-dashboard");
      navigate("/superadmin/");
      return;
    }

   if (sistema.id === "clicmenu") {
  setView?.("clicmenu-inicio");
  navigate("/superadmin/");
  return;

    }

    if (sistema.id === "taeconta") {
      navigate("/superadmin/taeconta/empresas");
      return;
    }

    if (sistema.id === "telorecargo") {
      navigate("/superadmin/telorecargo");
      return;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={900}>
          Sistemas
        </Typography>

        <Typography color="text.secondary">
          Control general de sistemas registrados.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {sistemas.map((sistema) => (
          <Grid item xs={12} md={4} key={sistema.id}>
            <Card
              onClick={() => abrirSistema(sistema)}
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 220,
                cursor: "pointer",
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: "0.18s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
                  borderColor: "primary.main",
                },
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box
                    sx={{
                      height: 86,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={sistema.logo}
                      alt={sistema.nombre}
                      style={{
                        maxHeight: 76,
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>

                  <Typography fontSize={20} fontWeight={900} mb={0.5}>
                    {sistema.nombre}
                  </Typography>

                  <Typography
                    fontSize={14}
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.45,
                      minHeight: 42,
                    }}
                  >
                    {sistema.descripcion}
                  </Typography>
                </Box>

                <Stack direction="row" justifyContent="flex-start" mt={2}>
                  <Chip
                    label={sistema.estado}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: "action.hover",
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
