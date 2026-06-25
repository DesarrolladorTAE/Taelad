import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
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
    descripcion: "Sistema de gestión para restaurantes, pedidos y control operativo",
    estado: "Activo",
  },
];

export default function Sistemas({ setView }: Props) {
  const navigate = useNavigate();

  const abrirSistema = (sistema: Sistema) => {
    if (!sistema?.id) return;

    if (sistema.id === "mitienda") {
  setView?.("mitienda-dashboard");
  return;
}

    if (sistema.id === "taeconta") {
      navigate(`/superadmin/taeconta/empresas`);
      return;
    }

    if (sistema.id === "telorecargo") {
      navigate(`/superadmin/telorecargo`);
      return;
    }

    if (sistema.id === "clicmenu") {
      navigate(`/superadmin/clicmenu`);
      return;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
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

                <Chip label={sistema.estado} size="small" sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}