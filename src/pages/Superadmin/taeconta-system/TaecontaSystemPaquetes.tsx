import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  getTaecontaSystemPaquetes,
  type TaecontaSystemRecord,
} from "../../../services/superadminService";

function texto(
  value: unknown,
  fallback = "—",
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

export default function TaecontaPaquetes() {
  const [items, setItems] =
    useState<TaecontaSystemRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getTaecontaSystemPaquetes();

      setItems(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible consultar los paquetes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Paquetes
          </Typography>

          <Typography
            color="text.secondary"
            fontSize={14}
          >
            Catálogo de paquetes y timbres.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={
            <RefreshOutlinedIcon />
          }
          onClick={cargar}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          minHeight={220}
          display="grid"
          sx={{ placeItems: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info">
          No hay paquetes registrados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, index) => {
            const activo =
              item.activo === true ||
              item.activo === 1 ||
              item.activo === "1";

            const imagen =
              typeof item.url_imagen ===
              "string"
                ? item.url_imagen
                : typeof item.imagen ===
                    "string"
                  ? item.imagen
                  : null;

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                xl={3}
                key={String(
                  item.id ?? index,
                )}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor:
                      "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {imagen && (
                    <Box
                      sx={{
                        height: 130,
                        display: "grid",
                        placeItems:
                          "center",
                        bgcolor:
                          "action.hover",
                        borderBottom:
                          "1px solid",
                        borderColor:
                          "divider",
                        p: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={imagen}
                        alt={texto(
                          item.nombre,
                        )}
                        sx={{
                          maxWidth:
                            "100%",
                          maxHeight:
                            "100%",
                          objectFit:
                            "contain",
                        }}
                      />
                    </Box>
                  )}

                  <Box p={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        fontWeight={900}
                      >
                        {texto(
                          item.nombre,
                          "Sin nombre",
                        )}
                      </Typography>

                      <Chip
                        size="small"
                        color={
                          activo
                            ? "success"
                            : "default"
                        }
                        label={
                          activo
                            ? "Activo"
                            : "Inactivo"
                        }
                      />
                    </Stack>

                    <Typography
                      color="text.secondary"
                      fontSize={12}
                      mt={0.5}
                    >
                      ID:{" "}
                      {texto(item.id)}
                    </Typography>

                    <Typography
                      fontSize={13}
                      mt={2}
                    >
                      <strong>
                        Costo:
                      </strong>{" "}
                      $
                      {texto(
                        item.costo ??
                          item.precio,
                        "0",
                      )}
                    </Typography>

                    <Typography
                      fontSize={13}
                      mt={0.5}
                    >
                      <strong>
                        Timbres:
                      </strong>{" "}
                      {texto(
                        item.cantidad_timbres,
                        "0",
                      )}
                    </Typography>

                    <Typography
                      fontSize={13}
                      mt={0.5}
                    >
                      <strong>
                        Tipo de timbre:
                      </strong>{" "}
                      {texto(
                        item.tipo_timbre_id,
                      )}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );
}