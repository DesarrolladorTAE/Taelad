import type { KeyboardEvent } from "react";

import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

type LogoMode =
  | "normal"
  | "remove-white-dark";

type Sistema = {
  id: string;
  nombre: string;
  logo: string;
  descripcion: string;
  estado: string;
  logoMode?: LogoMode;
};

type Props = {
  setView?: (
    view: string,
  ) => void;
};

const sistemas: Sistema[] = [
  {
    id: "taeconta",
    nombre: "TAECONTA",
    logo: "/app/taeconta.png",
    descripcion:
      "Sistema contable, fiscal y administrativo",
    estado: "Activo",
  },
  {
    id: "telorecargo",
    nombre: "TELORECARGO",
    logo: "/app/telorecargo.png",
    descripcion:
      "Sistema de recargas electrónicas y servicios",
    estado: "Activo",
  },
  {
    id: "mitienda",
    nombre: "MI TIENDA",
    logo: "/app/mitienda.png",
    descripcion:
      "Sistema de tienda en línea y punto de venta",
    estado: "Activo",
  },
  {
    id: "clicmenu",
    nombre: "CLICMENU",
    logo:
      "/logo/clicmenu-naranja.png",
    descripcion:
      "Sistema de gestión para restaurantes, pedidos y control operativo",
    estado: "Activo",
  },
  {
    id: "elad",
    nombre:
      "TECNOLOGÍAS ADMINISTRATIVAS ELAD",
    logo: "/logo/logo.png",
    descripcion:
      "Administración del blog institucional de Tecnologías Administrativas ELAD",
    estado: "Activo",
    logoMode:
      "remove-white-dark",
  },
];

export default function Sistemas({
  setView,
}: Props) {
  const navigate =
    useNavigate();

  const theme = useTheme();

  const isDark =
    theme.palette.mode ===
    "dark";

  const abrirSistema = (
    sistema: Sistema,
  ) => {
    if (!sistema?.id) {
      return;
    }

    switch (sistema.id) {
      case "mitienda":
        setView?.(
          "mitienda-dashboard",
        );

        navigate(
          "/superadmin/",
        );

        return;

      case "clicmenu":
        setView?.(
          "clicmenu-inicio",
        );

        navigate(
          "/superadmin/",
        );

        return;

      case "taeconta":
        /*
         * Entrada normal desde Sistemas.
         *
         * Debe abrir directamente el Dashboard completo
         * de TAECONTA, desde arriba.
         *
         * Se limpia cualquier filtro/focus que pudiera
         * venir de Métricas o Alertas.
         */
        sessionStorage.setItem(
          "taeconta_cuentas_vigencia",
          "todas",
        );

        sessionStorage.removeItem(
          "taeconta_cuentas_focus",
        );

        navigate(
          "/superadmin/systems/taeconta",
        );

        return;

      case "telorecargo":
        navigate(
          "/superadmin/telorecargo",
        );

        return;

      case "elad":
        setView?.(
          "elad-blog",
        );

        navigate(
          "/superadmin/",
        );

        return;

      default:
        return;
    }
  };

  const manejarTeclado = (
    event: KeyboardEvent<HTMLDivElement>,
    sistema: Sistema,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      abrirSistema(
        sistema,
      );
    }
  };

  const getLogoFilter = (
    sistema: Sistema,
  ) => {
    if (!isDark) {
      return "none";
    }

    if (
      sistema.logoMode ===
      "remove-white-dark"
    ) {
      return [
        "invert(1)",
        "hue-rotate(180deg)",
        "saturate(1.28)",
        "contrast(1.12)",
        "brightness(1.15)",
        "drop-shadow(0 3px 8px rgba(0,0,0,.28))",
      ].join(" ");
    }

    return [
      "drop-shadow(0 0 1px rgba(255,255,255,.60))",
      "drop-shadow(0 3px 8px rgba(0,0,0,.25))",
    ].join(" ");
  };

  return (
    <Box
      sx={{
        width: "100%",

        minWidth: 0,

        pb: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Box
        mb={{
          xs: 2.5,
          md: 3.5,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{
            fontSize: {
              xs: 28,
              sm: 32,
              md: 36,
            },

            lineHeight: 1.1,
          }}
        >
          Sistemas
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.8,

            fontSize: {
              xs: 14,
              md: 15,
            },
          }}
        >
          Control general de sistemas
          registrados.
        </Typography>
      </Box>

      <Grid
        container
        spacing={{
          xs: 2,
          sm: 2.5,
          md: 3,
        }}
      >
        {sistemas.map(
          (sistema) => {
            const isElad =
              sistema.id ===
              "elad";

            const removeWhiteBackground =
              isDark &&
              sistema.logoMode ===
                "remove-white-dark";

            return (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={
                  sistema.id
                }
              >
                <Card
                  role="button"
                  tabIndex={0}
                  aria-label={`Abrir ${sistema.nombre}`}
                  onClick={() =>
                    abrirSistema(
                      sistema,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) =>
                    manejarTeclado(
                      event,
                      sistema,
                    )
                  }
                  elevation={0}
                  sx={{
                    height:
                      "100%",

                    minHeight: {
                      xs: 290,
                      sm: 310,
                      md: 320,
                    },

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    cursor:
                      "pointer",

                    borderRadius:
                      {
                        xs: 3,
                        md: 4,
                      },

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    bgcolor:
                      "background.paper",

                    color:
                      "text.primary",

                    overflow:
                      "hidden",

                    outline:
                      "none",

                    boxShadow:
                      isDark
                        ? "0 16px 36px rgba(0,0,0,.24)"
                        : "0 16px 36px rgba(15,23,42,.07)",

                    transition:
                      "transform .2s ease, box-shadow .2s ease, border-color .2s ease",

                    "&:hover": {
                      transform:
                        "translateY(-4px)",

                      borderColor:
                        "primary.main",

                      boxShadow:
                        isDark
                          ? "0 22px 48px rgba(0,0,0,.36)"
                          : "0 22px 48px rgba(15,23,42,.13)",
                    },

                    "&:focus-visible":
                      {
                        borderColor:
                          "primary.main",

                        boxShadow: `0 0 0 3px ${alpha(
                          theme
                            .palette
                            .primary
                            .main,
                          0.22,
                        )}`,
                      },
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 2,
                        sm: 2.5,
                        md: 3,
                      },

                      "&:last-child":
                        {
                          pb: {
                            xs: 2,
                            sm: 2.5,
                            md: 3,
                          },
                        },

                      flex: 1,

                      display:
                        "flex",

                      flexDirection:
                        "column",
                    }}
                  >
                    <Box
                      sx={{
                        width:
                          "100%",

                        height: {
                          xs: 100,
                          sm: 108,
                          md: 116,
                        },

                        mb: {
                          xs: 2,
                          md: 2.5,
                        },

                        px: {
                          xs: 1.5,
                          md: 2,
                        },

                        py: 1.5,

                        display:
                          "grid",

                        placeItems:
                          "center",

                        overflow:
                          "hidden",

                        borderRadius:
                          3,

                        border:
                          "1px solid",

                        borderColor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.11,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.07,
                              ),

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.018,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.018,
                              ),

                        backgroundImage:
                          isDark
                            ? `radial-gradient(
                                circle at center,
                                ${alpha(
                                  theme
                                    .palette
                                    .common
                                    .white,
                                  0.035,
                                )} 0%,
                                transparent 70%
                              )`
                            : `linear-gradient(
                                145deg,
                                ${alpha(
                                  theme
                                    .palette
                                    .common
                                    .white,
                                  0.84,
                                )},
                                ${alpha(
                                  theme
                                    .palette
                                    .common
                                    .black,
                                  0.018,
                                )}
                              )`,

                        boxShadow:
                          isDark
                            ? `inset 0 0 0 1px ${alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.018,
                              )}`
                            : `inset 0 1px 0 ${alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.84,
                              )}`,
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          sistema.logo
                        }
                        alt={`Logo de ${sistema.nombre}`}
                        loading="lazy"
                        draggable={
                          false
                        }
                        sx={{
                          display:
                            "block",

                          width:
                            isElad
                              ? {
                                  xs: 170,
                                  sm: 190,
                                  md: 205,
                                }
                              : "auto",

                          height:
                            "auto",

                          maxWidth:
                            isElad
                              ? {
                                  xs: "92%",
                                  sm: "90%",
                                  md: "88%",
                                }
                              : {
                                  xs: "88%",
                                  sm: "84%",
                                  md: "80%",
                                },

                          maxHeight:
                            isElad
                              ? {
                                  xs: 88,
                                  sm: 94,
                                  md: 100,
                                }
                              : {
                                  xs: 64,
                                  sm: 70,
                                  md: 76,
                                },

                          objectFit:
                            "contain",

                          objectPosition:
                            "center",

                          pointerEvents:
                            "none",

                          userSelect:
                            "none",

                          mixBlendMode:
                            removeWhiteBackground
                              ? "screen"
                              : "normal",

                          filter:
                            getLogoFilter(
                              sistema,
                            ),

                          opacity:
                            removeWhiteBackground
                              ? 0.98
                              : 1,

                          transition:
                            "filter .2s ease, opacity .2s ease, transform .2s ease",

                          ".MuiCard-root:hover &":
                            {
                              transform:
                                "scale(1.025)",
                            },
                        }}
                      />
                    </Box>

                    <Typography
                      component="h2"
                      fontWeight={
                        900
                      }
                      sx={{
                        fontSize:
                          {
                            xs: 18,
                            md: 20,
                          },

                        lineHeight:
                          1.25,

                        minHeight:
                          {
                            xs: "auto",

                            md: isElad
                              ? 50
                              : 25,
                          },
                      }}
                    >
                      {
                        sistema.nombre
                      }
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.8,

                        fontSize:
                          {
                            xs: 13,
                            md: 14,
                          },

                        lineHeight:
                          1.55,
                      }}
                    >
                      {
                        sistema.descripcion
                      }
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      mt="auto"
                      pt={2.5}
                    >
                      <Chip
                        label={
                          sistema.estado
                        }
                        size="small"
                        color={
                          sistema.estado ===
                          "Activo"
                            ? "success"
                            : "default"
                        }
                        sx={{
                          fontWeight:
                            800,

                          borderRadius:
                            2,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          },
        )}
      </Grid>
    </Box>
  );
}