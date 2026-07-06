import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  GlobalStyles,
} from "@mui/material";

import {
  AdminPanelSettings,
  People,
  ReceiptLong,
  AccountTree,
  MonetizationOn,
  TrendingUp,
  AutoGraph,
} from "@mui/icons-material";

type Props = {
  darkMode: boolean;
};

export default function Dashboard({ darkMode }: Props) {
  const metrics = [
    { title: "Usuarios totales", value: "0", icon: <People /> },
    { title: "Facturas emitidas", value: "0", icon: <ReceiptLong /> },
    { title: "Referencias", value: "0", icon: <AccountTree /> },
    { title: "Ganancias totales", value: "$0.00", icon: <MonetizationOn /> },
  ];

  return (
    <>
      <GlobalStyles
        styles={(theme) => ({
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor:
              theme.palette.mode === "dark"
                ? "#334155 transparent"
                : "#CBD5E1 transparent",
          },

          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },

          "*::-webkit-scrollbar-track": {
            background: "transparent",
          },

          "*::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#334155" : "#CBD5E1",
            borderRadius: "10px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },

          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#475569" : "#94A3B8",
          },

          body: {
            overflowX: "hidden",
            backgroundColor: theme.palette.background.default,
          },

          "#root": {
            minHeight: "100vh",
            backgroundColor: theme.palette.background.default,
          },
        })}
      />

      <Box
        sx={(theme) => ({
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
        })}
      >
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg,#1577CE,#C77B1C)",
            }}
          >
            <AdminPanelSettings />
          </Avatar>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              Panel SuperAdministrador
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Control general de métricas, flujo, facturación, referencias y
              rendimiento entre sistemas.
            </Typography>
          </Box>
        </Box>

        {/* METRICS */}
        <Grid container spacing={3}>
          {metrics.map((item) => (
            <Grid item xs={12} md={3} key={item.title}>
              <Card
                sx={(theme) => ({
                  height: "100%",
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: darkMode
                    ? "0 16px 40px rgba(0,0,0,.35)"
                    : "0 14px 35px rgba(15,23,42,.08)",
                })}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {item.title}
                    </Typography>

                    <Avatar
                      sx={(theme) => ({
                        width: 38,
                        height: 38,
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.primary.main,
                      })}
                    >
                      {item.icon}
                    </Avatar>
                  </Box>

                  <Typography variant="h4" fontWeight={800}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FLOW + INSIGHTS */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Card
              sx={(theme) => ({
                height: "100%",
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
              })}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={(theme) => ({
                      width: 38,
                      height: 38,
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.primary.main,
                    })}
                  >
                    <AutoGraph />
                  </Avatar>

                  <Typography variant="h6" fontWeight={800}>
                    Flujo entre sistemas
                  </Typography>
                </Box>

                <Typography color="text.secondary">
                  Aquí se mostrará el concentrado de uso por sistema: usuarios,
                  compras, facturas, referencias y rendimiento general.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={(theme) => ({
                height: "100%",
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
              })}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={(theme) => ({
                      width: 38,
                      height: 38,
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.secondary.main,
                    })}
                  >
                    <TrendingUp />
                  </Avatar>

                  <Typography variant="h6" fontWeight={800}>
                    Ventajas detectadas
                  </Typography>
                </Box>

                <Typography color="text.secondary">
                  Este bloque mostrará los beneficios generados por las referencias,
                  ventas cruzadas y actividad entre plataformas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}