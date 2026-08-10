import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  getTaecontaSystemIndicadores,
  type TaecontaSystemRecord,
} from "../../../services/superadminService";

export default function TaecontaIndicadores() {
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
        await getTaecontaSystemIndicadores();

      setItems(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible consultar los indicadores.",
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
            Indicadores
          </Typography>

          <Typography
            color="text.secondary"
            fontSize={14}
          >
            Catálogo actual de indicadores de
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
        <Alert severity="error">
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
          No hay indicadores registrados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, index) => {
            const color =
              typeof item.color ===
                "string" &&
              item.color.trim()
                ? item.color
                : "#64748B";

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={String(
                  item.id ?? index,
                )}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: "100%",
                    border: "1px solid",
                    borderColor:
                      "divider",
                    borderRadius: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 42,
                        borderRadius: 1,
                        bgcolor: color,
                        flexShrink: 0,
                      }}
                    />

                    <Box minWidth={0}>
                      <Typography
                        fontWeight={900}
                      >
                        {String(
                          item.nombre ??
                            "Sin nombre",
                        )}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        fontSize={12}
                      >
                        ID:{" "}
                        {String(
                          item.id ?? "—",
                        )}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        fontSize={12}
                      >
                        {color}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );
}