import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

type Props = {
  setView: (view: string) => void;
};

export default function TaecontaInicio({
  setView,
}: Props) {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  const abrirInformacion = () => {
    setView(
      "taeconta-informacion",
    );
  };

  const volverASistemas = () => {
    setView("sistemas");
  };

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        minWidth: 0,
        pb: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: {
            xs: 2.5,
            md: 3.5,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: {
                xs: 54,
                md: 64,
              },

              height: {
                xs: 54,
                md: 64,
              },

              flexShrink: 0,

              display: "grid",

              placeItems: "center",

              borderRadius: 2,

              border: "1px solid",

              borderColor: "divider",

              bgcolor:
                "background.paper",

              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src="/app/taeconta.png"
              alt="TAECONTA"
              sx={{
                width: "82%",
                height: "82%",
                objectFit: "contain",
              }}
            />
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              component="h1"
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: 26,
                  sm: 30,
                  md: 34,
                },

                lineHeight: 1.15,
              }}
            >
              TAECONTA
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,

                fontSize: {
                  xs: 13,
                  md: 14,
                },
              }}
            >
              Administración general del
              sistema contable, fiscal y
              administrativo.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          size="small"
          startIcon={
            <ArrowBackOutlinedIcon />
          }
          onClick={
            volverASistemas
          }
          sx={{
            minHeight: 38,

            textTransform: "none",

            fontWeight: 700,

            borderRadius: 1.5,

            whiteSpace: "nowrap",
          }}
        >
          Volver a Sistemas
        </Button>
      </Stack>

      <Box
        sx={{
          width: "100%",

          maxWidth: 780,
        }}
      >
        <Card
          role="button"
          tabIndex={0}
          aria-label="Abrir administración TAECONTA"
          onClick={
            abrirInformacion
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              abrirInformacion();
            }
          }}
          elevation={0}
          sx={{
            width: "100%",

            minHeight: {
              xs: 220,
              sm: 250,
              md: 270,
            },

            display: "flex",

            flexDirection: "column",

            cursor: "pointer",

            borderRadius: 2,

            border: "1px solid",

            borderColor: "divider",

            bgcolor:
              "background.paper",

            overflow: "hidden",

            outline: "none",

            boxShadow: isDark
              ? "0 12px 30px rgba(0,0,0,.22)"
              : "0 12px 30px rgba(15,23,42,.06)",

            transition:
              "border-color .2s ease, box-shadow .2s ease, transform .2s ease",

            "&:hover": {
              transform:
                "translateY(-2px)",

              borderColor:
                "primary.main",

              boxShadow: isDark
                ? "0 18px 38px rgba(0,0,0,.30)"
                : "0 18px 38px rgba(15,23,42,.10)",
            },

            "&:focus-visible": {
              borderColor:
                "primary.main",

              boxShadow: `0 0 0 3px ${alpha(
                theme.palette.primary
                  .main,
                0.2,
              )}`,
            },
          }}
        >
          <CardContent
            sx={{
              flex: 1,

              p: {
                xs: 2.5,
                sm: 3,
                md: 3.5,
              },

              "&:last-child": {
                pb: {
                  xs: 2.5,
                  sm: 3,
                  md: 3.5,
                },
              },

              display: "flex",

              flexDirection:
                "column",
            }}
          >
            <Box
              sx={{
                width: 52,

                height: 52,

                display: "grid",

                placeItems: "center",

                borderRadius: 1.5,

                bgcolor: alpha(
                  theme.palette.primary
                    .main,
                  isDark
                    ? 0.2
                    : 0.09,
                ),

                color: "primary.main",

                mb: 2.5,
              }}
            >
              <DashboardOutlinedIcon
                sx={{
                  fontSize: 28,
                }}
              />
            </Box>

            <Typography
              component="h2"
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: 20,
                  md: 23,
                },

                lineHeight: 1.2,
              }}
            >
              Administración TAECONTA
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,

                maxWidth: 600,

                fontSize: {
                  xs: 14,
                  md: 15,
                },

                lineHeight: 1.6,
              }}
            >
              Consulta empresas, vigencias,
              timbres CFDI, indicadores,
              planes, paquetes, banner e
              historial del sistema.
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                mt: "auto",

                pt: 3,

                color:
                  "primary.main",
              }}
            >
              <Typography
                fontSize={14}
                fontWeight={800}
              >
                Abrir administración
              </Typography>

              <ArrowForwardOutlinedIcon
                sx={{
                  fontSize: 19,
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}