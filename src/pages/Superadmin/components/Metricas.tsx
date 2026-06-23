import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AppsIcon from "@mui/icons-material/Apps";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function Metricas() {
  const items = [
    {
      title: "Total usuarios",
      value: "0",
      icon: <PeopleIcon />,
    },
    {
      title: "Sistemas activos",
      value: "0",
      icon: <AppsIcon />,
    },
    {
      title: "Facturación mensual",
      value: "$0.00",
      icon: <ReceiptLongIcon />,
    },
    {
      title: "Administradores",
      value: "0",
      icon: <AdminPanelSettingsIcon />,
    },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight={800}>
          Métricas generales
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Resumen operativo del panel SuperAdmin.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Card
              sx={(theme) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                },
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
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {item.title}
                  </Typography>

                  <Box
                    sx={(theme) => ({
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.primary.main,
                    })}
                  >
                    {item.icon}
                  </Box>
                </Box>

                <Typography variant="h4" fontWeight={800}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}