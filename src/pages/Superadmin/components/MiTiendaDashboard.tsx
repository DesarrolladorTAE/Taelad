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
    }
  ];


  return (
    <Box sx={{ width: "100%" }}>

      {/* HEADER */}
      <Box mb={4}>

        <Typography
          variant="h4"
          fontWeight={900}
        >
          Mi Tienda
        </Typography>


        <Typography color="text.secondary">
          Administración general del sistema Mi Tienda en Línea MX
        </Typography>

      </Box>



      {/* ACCESOS */}
      <Grid container spacing={3}>

        {cards.map((item) => (

          <Grid 
            item 
            xs={12} 
            md={4} 
            key={item.title}
          >

            <Card
              onClick={() => setView?.(item.view)}
              sx={{
                cursor: "pointer",
                borderRadius: 5,
                height: 170,
                transition: "0.25s",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.08)",

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow:
                    "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >

              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >


                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "primary.main",
                  }}
                >

                  {item.icon}

                </Avatar>



                <Box>

                  <Typography
                    fontSize={20}
                    fontWeight={900}
                  >
                    {item.title}
                  </Typography>


                  <Typography
                    mt={1}
                    fontSize={14}
                    color="text.secondary"
                  >
                    {item.description}
                  </Typography>


                </Box>


              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>



      {/* RESUMEN */}
      <Card
        sx={{
          mt:4,
          borderRadius:5,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >

        <CardContent>

          <Typography
            fontWeight={900}
            fontSize={18}
            mb={1}
          >
            Resumen del sistema
          </Typography>


          <Typography color="text.secondary">

            Información general, estadísticas y actividad reciente
            del sistema.

          </Typography>

        </CardContent>

      </Card>

    </Box>
  );
}