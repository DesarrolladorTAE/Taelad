import { useState } from "react";

import {
  alpha,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import TaecontaBanner from "./TaecontaBanner";
import TaecontaConfiguracionLogin from "./TaecontaConfiguracionLogin";
import TaecontaConfiguracionIndicadores from "./TaecontaConfiguracionIndicadores";
import TaecontaConfiguracionTerminos from "./TaecontaConfiguracionTerminos";

type PreferenciaSection =
  | "login"
  | "banner"
  | "indicadores"
  | "terminos";

const ITEMS: Array<{
  value: PreferenciaSection;
  label: string;
  description: string;
  icon: typeof ImageOutlinedIcon;
}> = [
  {
    value: "login",
    label: "Imagen login",
    description: "Personalización visual del acceso al sistema.",
    icon: ImageOutlinedIcon,
  },
  {
    value: "banner",
    label: "Banner principal",
    description: "Personalización visual del banner inicial.",
    icon: ViewCarouselOutlinedIcon,
  },
  {
    value: "indicadores",
    label: "Indicadores",
    description: "Gestión de etiquetas visuales para clasificaciones.",
    icon: FlagOutlinedIcon,
  },
  {
    value: "terminos",
    label: "Términos",
    description: "Contenido legal visible para usuarios finales.",
    icon: ArticleOutlinedIcon,
  },
];

export default function TaecontaPreferencias() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  const [section, setSection] =
    useState<PreferenciaSection>("login");

  const renderContent = () => {
    switch (section) {
      case "banner":
        return <TaecontaBanner />;

      case "indicadores":
        return <TaecontaConfiguracionIndicadores />;

      case "terminos":
        return <TaecontaConfiguracionTerminos />;

      case "login":
      default:
        return <TaecontaConfiguracionLogin />;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 0.75 }}
      >
        <TuneOutlinedIcon color="primary" />

        <Typography
          variant="h6"
          fontWeight={900}
        >
          Preferencias
        </Typography>
      </Stack>

      <Typography
        color="text.secondary"
        fontSize={14}
        sx={{ mb: 2 }}
      >
        Administra la configuración general de TAECONTA directamente
        desde Tecnologías.
      </Typography>

      {mobile ? (
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={section}
            onChange={(_event, value: PreferenciaSection) =>
              setSection(value)
            }
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 800,
                whiteSpace: "nowrap",
              },
            }}
          >
            {ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <Tab
                  key={item.value}
                  value={item.value}
                  icon={<Icon fontSize="small" />}
                  iconPosition="start"
                  label={item.label}
                />
              );
            })}
          </Tabs>
        </Paper>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "280px minmax(0, 1fr)",
          },
          gap: {
            xs: 1.5,
            md: 2,
          },
          alignItems: "start",
        }}
      >
        {!mobile ? (
          <Paper
            elevation={0}
            sx={{
              p: 1.25,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              position: "sticky",
              top: 16,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ px: 1, pt: 0.5, pb: 1 }}
            >
              <TuneOutlinedIcon
                color="primary"
                fontSize="small"
              />

              <Typography
                variant="caption"
                fontWeight={900}
                color="text.secondary"
                sx={{ letterSpacing: 0.8 }}
              >
                CONFIGURACIONES
              </Typography>
            </Stack>

            <List disablePadding>
              {ITEMS.map((item) => {
                const Icon = item.icon;
                const selected = section === item.value;

                return (
                  <ListItemButton
                    key={item.value}
                    selected={selected}
                    onClick={() =>
                      setSection(item.value)
                    }
                    sx={{
                      mb: 0.5,
                      borderRadius: 1.5,
                      alignItems: "flex-start",
                      borderLeft: "3px solid",
                      borderLeftColor: selected
                        ? "primary.main"
                        : "transparent",
                      bgcolor: selected
                        ? alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === "dark"
                              ? 0.16
                              : 0.07,
                          )
                        : "transparent",
                      "&.Mui-selected": {
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark"
                            ? 0.16
                            : 0.07,
                        ),
                      },
                      "&.Mui-selected:hover": {
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark"
                            ? 0.21
                            : 0.1,
                        ),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        mt: 0.25,
                        color: selected
                          ? "primary.main"
                          : "text.secondary",
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontSize: 13.5,
                        fontWeight: selected
                          ? 900
                          : 800,
                        color: selected
                          ? "primary.main"
                          : "text.primary",
                      }}
                      secondaryTypographyProps={{
                        fontSize: 11.5,
                        lineHeight: 1.35,
                        mt: 0.25,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        ) : null}

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}