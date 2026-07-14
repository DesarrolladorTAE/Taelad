import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";

type Props = {
  setView: (view: string) => void;
};

type ModuleCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetView: string;
};

const modules: ModuleCard[] = [
  {
    id: "administracion",
    title: "Administración general",
    description:
      "Consulta métricas, ventas, propietarios, restaurantes, sucursales y suscripciones.",
    icon: <DashboardIcon />,
    targetView: "clicmenu",
  },
  {
    id: "blogs",
    title: "Blogs",
    description:
      "Administra publicaciones, categorías, etiquetas, imágenes y contenido público.",
    icon: <ArticleIcon />,
    targetView: "clicmenu-blogs",
  },
];

export default function ClicMenuInicio({ setView }: Props) {
  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              ClicMenu
            </Typography>

            <Typography color="text.secondary">
              Selecciona el módulo que deseas administrar.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setView("sistemas")}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2.5,
            }}
          >
            Volver a sistemas
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid item xs={12} sm={6} lg={4} key={module.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 230,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  overflow: "hidden",
                  transition: "0.18s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.12)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => setView(module.targetView)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "stretch",
                  }}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mb: 2.5,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      {module.icon}
                    </Avatar>

                    <Typography variant="h6" fontWeight={900} mb={1}>
                      {module.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                      }}
                    >
                      {module.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}