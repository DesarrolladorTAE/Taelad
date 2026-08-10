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
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  getTaecontaSystemPlanes,
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

function siNo(
  value: unknown,
): string {
  return value === true ||
    value === 1 ||
    value === "1"
    ? "Sí"
    : "No";
}

export default function TaecontaPlanes() {
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
        await getTaecontaSystemPlanes();

      setItems(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible consultar los planes.",
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
            Planes
          </Typography>

          <Typography
            color="text.secondary"
            fontSize={14}
          >
            Planes disponibles actualmente en
            TAECONTA.
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
          No hay planes registrados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              key={String(
                item.id ?? index,
              )}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={900}
                    >
                      {texto(
                        item.nombre,
                        "Sin nombre",
                      )}
                    </Typography>

                    <Typography
                      fontSize={12}
                      color="text.secondary"
                    >
                      {texto(item.clave)}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={`ID ${texto(
                      item.id,
                    )}`}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  color="text.secondary"
                  fontSize={12}
                >
                  Precio anual
                </Typography>

                <Typography
                  fontWeight={900}
                  fontSize={22}
                  mb={2}
                >
                  ${texto(
                    item.precio_anual ??
                      item.precio,
                    "0",
                  )}
                </Typography>

                <Stack spacing={0.75}>
                  <Typography fontSize={13}>
                    <strong>
                      Máximo RFC:
                    </strong>{" "}
                    {texto(item.max_rfcs)}
                  </Typography>

                  <Typography fontSize={13}>
                    <strong>
                      Folios por RFC:
                    </strong>{" "}
                    {texto(
                      item.folios_por_rfc,
                    )}
                  </Typography>

                  <Typography fontSize={13}>
                    <strong>
                      Cotizaciones:
                    </strong>{" "}
                    {siNo(
                      item.incluye_cotizaciones,
                    )}
                  </Typography>

                  <Typography fontSize={13}>
                    <strong>
                      Contabilidad PF:
                    </strong>{" "}
                    {siNo(
                      item.incluye_contabilidad_pf,
                    )}
                  </Typography>

                  <Typography fontSize={13}>
                    <strong>
                      Soporte:
                    </strong>{" "}
                    {texto(
                      item.nivel_soporte,
                    )}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}