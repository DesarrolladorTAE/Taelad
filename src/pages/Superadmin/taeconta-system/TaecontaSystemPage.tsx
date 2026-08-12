import {
  useState,
  type MouseEvent,
} from "react";

import {
  alpha,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  useTheme,
} from "@mui/material";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import TaecontaResumen from "./TaecontaResumen";
import TaecontaTimbres from "./TaecontaTimbres";
import TaecontaSystemEmpresas from "./TaecontaSystemEmpresas";
import TaecontaSystemTimbrados from "./TaecontaSystemTimbrados";
import TaecontaPlanes from "./TaecontaPlanes";
import TaecontaSystemPaquetes from "./TaecontaSystemPaquetes";
import TaecontaBanner from "./TaecontaBanner";
import TaecontaReporteVentas from "./TaecontaReporteVentas";

import type {
  TaecontaEmpresaFilters,
  TaecontaSection,
  TaecontaTimbreDetail,
} from "./types";

/*
|--------------------------------------------------------------------------
| VALORES INICIALES
|--------------------------------------------------------------------------
*/

const INITIAL_EMPRESA_FILTERS: TaecontaEmpresaFilters = {
  search: "",
  month: "",
  year: "",
  indicadorId: "",
};

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

export default function TaecontaSystemPage() {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  /*
  |--------------------------------------------------------------------------
  | SECCIÓN ACTIVA
  |--------------------------------------------------------------------------
  */

  const [
    section,
    setSection,
  ] = useState<TaecontaSection>(
    "dashboard",
  );

  /*
  |--------------------------------------------------------------------------
  | DETALLE DE TIMBRES
  |--------------------------------------------------------------------------
  */

  const [
    timbreDetail,
    setTimbreDetail,
  ] =
    useState<TaecontaTimbreDetail>(
      "total",
    );

  /*
  |--------------------------------------------------------------------------
  | FILTROS DE EMPRESAS
  |--------------------------------------------------------------------------
  */

  const [
    empresaFilters,
    setEmpresaFilters,
  ] =
    useState<TaecontaEmpresaFilters>(
      INITIAL_EMPRESA_FILTERS,
    );

  /*
  |--------------------------------------------------------------------------
  | MENÚ FLOTANTE
  |--------------------------------------------------------------------------
  */

  const [
    menuAnchor,
    setMenuAnchor,
  ] =
    useState<HTMLElement | null>(
      null,
    );

  const menuOpen =
    Boolean(menuAnchor);

  /*
  |--------------------------------------------------------------------------
  | HANDLERS DEL MENÚ
  |--------------------------------------------------------------------------
  */

  const handleOpenMenu = (
    event: MouseEvent<HTMLElement>,
  ) => {
    setMenuAnchor(
      event.currentTarget,
    );
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleChangeSection = (
    nextSection: TaecontaSection,
  ) => {
    setSection(nextSection);

    handleCloseMenu();
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLERS DE TIMBRES
  |--------------------------------------------------------------------------
  */

  const handleOpenTimbreDetail = (
    detail: TaecontaTimbreDetail,
  ) => {
    setTimbreDetail(detail);

    setSection("historial");
  };

  const handleChangeTimbreDetail = (
    detail: TaecontaTimbreDetail,
  ) => {
    setTimbreDetail(detail);
  };

  const handleBackToDashboard =
    () => {
      setSection("dashboard");
    };

  /*
  |--------------------------------------------------------------------------
  | ESTILO DE OPCIONES DEL MENÚ
  |--------------------------------------------------------------------------
  */

  const getMenuItemSx = (
    selected: boolean,
  ) => ({
    minHeight: 42,

    mx: 0.75,

    borderRadius: 1,

    color: selected
      ? "primary.main"
      : "text.primary",

    bgcolor: selected
      ? alpha(
          theme.palette.primary.main,
          isDark ? 0.18 : 0.08,
        )
      : "transparent",

    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        isDark ? 0.14 : 0.06,
      ),
    },

    "&.Mui-selected": {
      color: "primary.main",

      bgcolor: alpha(
        theme.palette.primary.main,
        isDark ? 0.18 : 0.08,
      ),
    },

    "&.Mui-selected:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        isDark ? 0.22 : 0.1,
      ),
    },

    "& .MuiListItemIcon-root": {
      minWidth: 34,

      color: selected
        ? "primary.main"
        : "text.secondary",
    },
  });

  /*
  |--------------------------------------------------------------------------
  | CONTENIDO DE LA SECCIÓN ACTIVA
  |--------------------------------------------------------------------------
  */

  const renderContent = () => {
    /*
    |--------------------------------------------------------------------------
    | HISTORIAL CFDI
    |--------------------------------------------------------------------------
    */

    if (
      section === "historial"
    ) {
      return (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <TaecontaSystemTimbrados
            type={timbreDetail}
            onBack={
              handleBackToDashboard
            }
            onChangeType={
              handleChangeTimbreDetail
            }
          />
        </Box>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PLANES
    |--------------------------------------------------------------------------
    */

    if (
      section === "planes"
    ) {
      return (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <TaecontaPlanes />
        </Box>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAQUETES
    |--------------------------------------------------------------------------
    */

    if (
      section === "paquetes"
    ) {
      return (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <TaecontaSystemPaquetes />
        </Box>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BANNER
    |--------------------------------------------------------------------------
    */

    if (
      section === "banner"
    ) {
      return (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <TaecontaBanner />
        </Box>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REPORTE DE VENTAS
    |--------------------------------------------------------------------------
    */

    if (
      section === "reporte-ventas"
    ) {
      return (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <TaecontaReporteVentas />
        </Box>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    return (
      <Box
        sx={{
          width: "100%",
          minWidth: 0,

          display: "flex",

          flexDirection:
            "column",

          gap: {
            xs: 1.25,
            sm: 1.5,
            md: 2,
          },
        }}
      >
        {/* ===================================================
            RESUMEN + TIMBRES
        =================================================== */}

        <Box
          sx={{
            width: "100%",
            minWidth: 0,

            display: "grid",

            gridTemplateColumns: {
              xs:
                "minmax(0, 1fr)",

              lg:
                "minmax(0, 1.8fr) minmax(360px, 0.9fr)",
            },

            gap: {
              xs: 1.25,
              sm: 1.5,
              md: 2,
            },

            alignItems:
              "stretch",
          }}
        >
          {/* RESUMEN */}

          <Box
            sx={{
              width: "100%",
              minWidth: 0,

              "& > .MuiPaper-root":
                {
                  height: "100%",
                },
            }}
          >
            <TaecontaResumen
              filters={
                empresaFilters
              }
              onFiltersChange={
                setEmpresaFilters
              }
            />
          </Box>

          {/* TIMBRES */}

          <Box
            sx={{
              width: "100%",
              minWidth: 0,

              "& > .MuiPaper-root":
                {
                  height: "100%",
                },
            }}
          >
            <TaecontaTimbres
              onOpenDetail={
                handleOpenTimbreDetail
              }
            />
          </Box>
        </Box>

        <Divider />

        {/* ===================================================
            EMPRESAS
        =================================================== */}

        <Box
          sx={{
            width: "100%",
            minWidth: 0,

            overflow:
              "hidden",
          }}
        >
          <TaecontaSystemEmpresas
            filters={
              empresaFilters
            }
          />
        </Box>
      </Box>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER PRINCIPAL
  |--------------------------------------------------------------------------
  */

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        minWidth: 0,

        px: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },

        py: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },

        bgcolor:
          "background.default",

        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",

          width: "100%",

          maxWidth: 1720,

          minWidth: 0,

          mx: "auto",
        }}
      >
        {/* ===================================================
            CARD ÚNICO DE TAECONTA
        =================================================== */}

        <Paper
          elevation={0}
          sx={{
            position: "relative",

            width: "100%",

            minWidth: 0,

            border:
              "1px solid",

            borderColor:
              "divider",

            borderRadius: {
              xs: 1.5,
              md: 2,
            },

            bgcolor:
              "background.paper",

            overflow: "visible",
          }}
        >
          {/* =================================================
              BOTÓN FLOTANTE PANEL
          ================================================= */}

          <Tooltip
            title="Panel"
            placement="top"
            arrow
          >
            <IconButton
              id="taeconta-panel-button"
              aria-label="Abrir panel TAECONTA"
              aria-haspopup="true"
              aria-controls={
                menuOpen
                  ? "taeconta-panel-menu"
                  : undefined
              }
              aria-expanded={
                menuOpen
                  ? "true"
                  : undefined
              }
              onClick={
                handleOpenMenu
              }
              sx={{
                position:
                  "absolute",

                left: {
                  xs: 10,
                  md: -18,
                },

                top: {
                  xs: 10,
                  md: 28,
                },

                zIndex: 20,

                width: {
                  xs: 36,
                  md: 38,
                },

                height: {
                  xs: 36,
                  md: 38,
                },

                borderRadius:
                  1.25,

                bgcolor:
                  "primary.main",

                color:
                  "primary.contrastText",

                boxShadow:
                  theme.shadows[3],

                "&:hover": {
                  bgcolor:
                    "primary.dark",
                },
              }}
            >
              <MenuOutlinedIcon
                sx={{
                  fontSize: 21,
                }}
              />
            </IconButton>
          </Tooltip>

          {/* =================================================
              MENÚ DEL PANEL
          ================================================= */}

          <Menu
            id="taeconta-panel-menu"
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={
              handleCloseMenu
            }
            MenuListProps={{
              dense: true,

              "aria-labelledby":
                "taeconta-panel-button",
            }}
            PaperProps={{
              elevation: 6,

              sx: {
                width: 230,

                mt: 0.75,

                border:
                  "1px solid",

                borderColor:
                  "divider",

                borderRadius:
                  1.5,

                bgcolor:
                  "background.paper",

                backgroundImage:
                  "none",
              },
            }}
          >
            {/* DASHBOARD */}

            <MenuItem
              selected={
                section ===
                "dashboard"
              }
              onClick={() =>
                handleChangeSection(
                  "dashboard",
                )
              }
              sx={getMenuItemSx(
                section ===
                  "dashboard",
              )}
            >
              <ListItemIcon>
                <DashboardOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  fontSize: 13,

                  fontWeight:
                    800,
                }}
              />
            </MenuItem>

            <Divider
              sx={{
                my: 0.75,
              }}
            />

            {/* PLANES */}

            <MenuItem
              selected={
                section ===
                "planes"
              }
              onClick={() =>
                handleChangeSection(
                  "planes",
                )
              }
              sx={getMenuItemSx(
                section ===
                  "planes",
              )}
            >
              <ListItemIcon>
                <WorkspacePremiumOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Planes"
                primaryTypographyProps={{
                  fontSize: 13,

                  fontWeight:
                    700,
                }}
              />
            </MenuItem>

            {/* PAQUETES */}

            <MenuItem
              selected={
                section ===
                "paquetes"
              }
              onClick={() =>
                handleChangeSection(
                  "paquetes",
                )
              }
              sx={getMenuItemSx(
                section ===
                  "paquetes",
              )}
            >
              <ListItemIcon>
                <Inventory2OutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Paquetes"
                primaryTypographyProps={{
                  fontSize: 13,

                  fontWeight:
                    700,
                }}
              />
            </MenuItem>

            {/* BANNER */}

            <MenuItem
              selected={
                section ===
                "banner"
              }
              onClick={() =>
                handleChangeSection(
                  "banner",
                )
              }
              sx={getMenuItemSx(
                section ===
                  "banner",
              )}
            >
              <ListItemIcon>
                <ImageOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Banner"
                primaryTypographyProps={{
                  fontSize: 13,

                  fontWeight:
                    700,
                }}
              />
            </MenuItem>

            {/* REPORTE DE VENTAS */}

            <MenuItem
              selected={
                section ===
                "reporte-ventas"
              }
              onClick={() =>
                handleChangeSection(
                  "reporte-ventas",
                )
              }
              sx={getMenuItemSx(
                section ===
                  "reporte-ventas",
              )}
            >
              <ListItemIcon>
                <BarChartOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Reporte de ventas"
                primaryTypographyProps={{
                  fontSize: 13,

                  fontWeight:
                    700,
                }}
              />
            </MenuItem>

            <Divider
              sx={{
                my: 0.75,
              }}
            />

            {/* HISTORIAL */}

            <MenuItem
              selected={
                section ===
                "historial"
              }
              onClick={() => {
                setTimbreDetail(
                  "total",
                );

                handleChangeSection(
                  "historial",
                );
              }}
              sx={getMenuItemSx(
                section ===
                  "historial",
              )}
            >
              <ListItemIcon>
                <ReceiptLongOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Historial CFDI"
                primaryTypographyProps={{
                  fontSize: 13,

                  fontWeight:
                    700,
                }}
              />
            </MenuItem>
          </Menu>

          {/* =================================================
              CONTENIDO DEL CARD
          ================================================= */}

          <Box
            sx={{
              width: "100%",

              minWidth: 0,

              pt: {
                xs: 6,
                md: 2,
              },

              px: {
                xs: 1,
                sm: 1.5,
                md: 2,
              },

              pb: {
                xs: 1,
                sm: 1.5,
                md: 2,
              },

              "& > *": {
                minWidth: 0,

                maxWidth:
                  "100%",
              },
            }}
          >
            {renderContent()}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}