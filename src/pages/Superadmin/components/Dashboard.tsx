import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
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
  const cardBg = darkMode ? "#171A21" : "#FFFFFF";
  const cardBgSoft = darkMode ? "#1F2430" : "#F9FAFB";
  const cardBorder = darkMode ? "1px solid #2B3140" : "1px solid #E5E7EB";
  const titleColor = darkMode ? "#F9FAFB" : "#111827";
  const textColor = darkMode ? "#B7C0D1" : "#6B7280";

  const metrics = [
    {
      title: "Usuarios totales",
      value: "0",
      icon: <People />,
    },
    {
      title: "Facturas emitidas",
      value: "0",
      icon: <ReceiptLong />,
    },
    {
      title: "Referencias",
      value: "0",
      icon: <AccountTree />,
    },
    {
      title: "Ganancias totales",
      value: "$0.00",
      icon: <MonetizationOn />,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #1577CE, #C77B1C)",
            color: "#FFFFFF",
          }}
        >
          <AdminPanelSettings />
        </Avatar>

        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: titleColor,
            }}
          >
            Panel SuperAdministrador
          </Typography>

          <Typography
            sx={{
              color: textColor,
              fontSize: 14,
              mt: 0.5,
            }}
          >
            Control general de métricas, flujo, facturación, referencias y
            rendimiento entre sistemas.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((item) => (
          <Grid item xs={12} md={3} key={item.title}>
            <Card
              sx={{
                height: "100%",
                background: cardBg,
                border: cardBorder,
                borderRadius: 4,
                boxShadow: darkMode
                  ? "0 16px 40px rgba(0,0,0,.35)"
                  : "0 14px 35px rgba(15,23,42,.08)",
              }}
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
                    sx={{
                      color: textColor,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      background: cardBgSoft,
                      color: darkMode ? "#FFFFFF" : "#1577CE",
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: titleColor,
                  }}
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              height: "100%",
              background: cardBg,
              border: cardBorder,
              borderRadius: 4,
              boxShadow: darkMode
                ? "0 16px 40px rgba(0,0,0,.35)"
                : "0 14px 35px rgba(15,23,42,.08)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background: cardBgSoft,
                    color: darkMode ? "#FFFFFF" : "#1577CE",
                  }}
                >
                  <AutoGraph />
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: titleColor,
                  }}
                >
                  Flujo entre sistemas
                </Typography>
              </Box>

              <Typography sx={{ color: textColor }}>
                Aquí se mostrará el concentrado de uso por sistema: usuarios,
                compras, facturas, referencias y rendimiento general.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: cardBg,
              border: cardBorder,
              borderRadius: 4,
              boxShadow: darkMode
                ? "0 16px 40px rgba(0,0,0,.35)"
                : "0 14px 35px rgba(15,23,42,.08)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background: cardBgSoft,
                    color: darkMode ? "#FFFFFF" : "#C77B1C",
                  }}
                >
                  <TrendingUp />
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: titleColor,
                  }}
                >
                  Ventajas detectadas
                </Typography>
              </Box>

              <Typography sx={{ color: textColor }}>
                Este bloque mostrará los beneficios generados por las referencias,
                ventas cruzadas y actividad entre plataformas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}