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
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  getTaecontaSystemBanner,
  type TaecontaSystemBanner,
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

export default function TaecontaBanner() {
  const [banner, setBanner] =
    useState<TaecontaSystemBanner | null>(
      null,
    );

  const [activo, setActivo] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getTaecontaSystemBanner();

      setActivo(
        Boolean(response?.activo),
      );

      setBanner(
        response?.data ?? null,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible consultar el banner.",
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
            Banner principal
          </Typography>

          <Typography
            color="text.secondary"
            fontSize={14}
          >
            Banner actualmente configurado en
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
      ) : !activo || !banner ? (
        <Alert severity="info">
          Actualmente TAECONTA no tiene un
          banner activo.
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {banner.url_imagen && (
            <Box
              sx={{
                width: "100%",
                minHeight: 200,
                bgcolor: "action.hover",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Box
                component="img"
                src={banner.url_imagen}
                alt={
                  banner.nombre_imagen ||
                  "Banner TAECONTA"
                }
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          <Box p={2.5}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  fontWeight={900}
                  fontSize={18}
                >
                  {texto(
                    banner.nombre_imagen,
                    "Banner TAECONTA",
                  )}
                </Typography>

                <Typography
                  color="text.secondary"
                  fontSize={13}
                  mt={0.5}
                >
                  ID: {banner.id}
                </Typography>
              </Box>

              <Chip
                color="success"
                label="Activo"
              />
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={3}
              mt={2}
            >
              <Typography fontSize={13}>
                <strong>
                  Inicio:
                </strong>{" "}
                {texto(
                  banner.fecha_inicio,
                )}
              </Typography>

              <Typography fontSize={13}>
                <strong>Fin:</strong>{" "}
                {texto(
                  banner.fecha_fin,
                )}
              </Typography>
            </Stack>
          </Box>
        </Paper>
      )}
    </Paper>
  );
}