import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ArticleIcon from "@mui/icons-material/Article";

type Props = {
  setView?: (view: string) => void;
};

export default function MiTiendaDashboard({ setView }: Props) {
  const cards = [
    {
      title: "Tiendas",
      description: "Administración de tiendas registradas",
      icon: <StorefrontIcon />,
      view: "mitienda-tiendas",
    },
    {
      title: "Ventas",
      description: "Resumen y seguimiento de ventas",
      icon: <PointOfSaleIcon />,
      view: "mitienda-ventas",
    },
    {
      title: "Métricas",
      description: "Indicadores generales del sistema",
      icon: <QueryStatsIcon />,
      view: "mitienda-metricas",
    },
    {
      title: "Suscripciones",
      description: "Administración global de planes y complementos",
      icon: <CardMembershipIcon />,
      view: "mitienda-suscripciones",
    },
    {
      title: "Blogs",
      description:
        "Administración de publicaciones, categorías, etiquetas y multimedia",
      icon: <ArticleIcon />,
      view: "mitienda-blogs",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900}>
          Mi Tienda
        </Typography>

        <Typography color="text.secondary">
          Administración general del sistema Mi Tienda en Línea MX
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              onClick={() => setView?.(item.view)}
              elevation={0}
              sx={{
                cursor: "pointer",
                borderRadius: 5,
                height: 170,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: "0.25s",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",

                "&:hover": {
                  transform: "translateY(-6px)",
                  borderColor: "primary.main",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  p: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  {item.icon}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontSize={20} fontWeight={900}>
                    {item.title}
                  </Typography>

                  <Typography
                    mt={1}
                    fontSize={14}
                    color="text.secondary"
                    sx={{ lineHeight: 1.5 }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        elevation={0}
        sx={{
          mt: 4,
          borderRadius: 5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography fontWeight={900} fontSize={18} mb={1}>
            Resumen del sistema
          </Typography>

          <Typography color="text.secondary">
            Información general, estadísticas y actividad reciente del sistema.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}