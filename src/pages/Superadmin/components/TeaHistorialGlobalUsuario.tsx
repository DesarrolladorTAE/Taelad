import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";

import {
  obtenerTeaHistorialGlobalUsuario,
  type TeaHistorialGlobalUsuarioItem,
} from "../../../services/teaReferidosService";

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatoMoneda(value?: unknown) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(toNumber(value));
}

type Props = {
  userId: number | string;
  onBack: () => void;
};

type HistorialTotales = {
  total_referidos: number;
  confirmados: number;
  pendientes: number;
  ganancia_total: number;
};

const totalesIniciales: HistorialTotales = {
  total_referidos: 0,
  confirmados: 0,
  pendientes: 0,
  ganancia_total: 0,
};

function MobileInfoRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      sx={{ minWidth: 0 }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flexShrink: 0 }}
      >
        {label}
      </Typography>

      <Typography
        fontWeight={bold ? 900 : 700}
        sx={{
          textAlign: "right",
          wordBreak: "break-word",
          minWidth: 0,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function TeaHistorialGlobalUsuario({ userId, onBack }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [rows, setRows] = useState<TeaHistorialGlobalUsuarioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(16);
  const [totales, setTotales] = useState<HistorialTotales>(totalesIniciales);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 16,
    total: 0,
  });

  const cargarHistorial = async (
    pageIndex = page,
    perPage = rowsPerPage,
  ) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError("");

      const response = await obtenerTeaHistorialGlobalUsuario(userId, {
        page: pageIndex + 1,
        per_page: perPage,
      });

      const rowsResponse = Array.isArray(response?.data) ? response.data : [];
      const totalesResponse = response?.totales;

      setRows(rowsResponse);

      setTotales({
        total_referidos:
          totalesResponse?.total_referidos !== undefined
            ? toNumber(totalesResponse.total_referidos)
            : rowsResponse.reduce(
                (acc, item) => acc + toNumber(item.total_referidos),
                0,
              ),

        confirmados:
          totalesResponse?.confirmados !== undefined
            ? toNumber(totalesResponse.confirmados)
            : rowsResponse.reduce(
                (acc, item) => acc + toNumber(item.confirmados),
                0,
              ),

        pendientes:
          totalesResponse?.pendientes !== undefined
            ? toNumber(totalesResponse.pendientes)
            : rowsResponse.reduce(
                (acc, item) => acc + toNumber(item.pendientes),
                0,
              ),

        ganancia_total:
          totalesResponse?.ganancia_total !== undefined
            ? toNumber(totalesResponse.ganancia_total)
            : rowsResponse.reduce(
                (acc, item) => acc + toNumber(item.ganancia_total),
                0,
              ),
      });

      setPagination({
        current_page: response?.current_page || 1,
        last_page: response?.last_page || 1,
        per_page: response?.per_page || perPage,
        total: response?.total || 0,
      });

      setPage((response?.current_page || 1) - 1);
    } catch (err: any) {
      console.error("Error cargando historial global:", err);

      setRows([]);
      setTotales(totalesIniciales);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "No fue posible cargar el historial global del usuario.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    cargarHistorial(0, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.25, sm: 1.5, md: 2 },
        borderRadius: { xs: 2.5, md: 4 },
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={1.5}
        mb={2}
      >
        <Box minWidth={0}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight={900}
            sx={{ wordBreak: "break-word" }}
          >
            Historial total
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ wordBreak: "break-word" }}
          >
            Referidos y ganancias acumuladas por mes desde el inicio.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          size={isMobile ? "small" : "medium"}
          sx={{
            width: { xs: "100%", md: "fit-content" },
            textTransform: "none",
            flexShrink: 0,
          }}
        >
          Regresar a mensual
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.25}>
              {rows.map((row) => (
                <Paper
                  key={`${row.anio}-${row.mes}`}
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Stack spacing={0.85}>
                    <Typography
                      fontWeight={900}
                      sx={{
                        wordBreak: "break-word",
                        lineHeight: 1.2,
                      }}
                    >
                      {row.periodo || `${row.mes_nombre} ${row.anio}`}
                    </Typography>

                    <Divider />

                    <MobileInfoRow
                      label="Total referidos"
                      value={toNumber(row.total_referidos)}
                    />

                    <MobileInfoRow
                      label="Confirmados"
                      value={toNumber(row.confirmados)}
                    />

                    <MobileInfoRow
                      label="Pendientes"
                      value={toNumber(row.pendientes)}
                    />

                    <MobileInfoRow
                      label="Ganancia total"
                      value={formatoMoneda(row.ganancia_total)}
                      bold
                    />
                  </Stack>
                </Paper>
              ))}

              {rows.length === 0 && (
                <Typography color="text.secondary" align="center" py={3}>
                  No hay historial global para este usuario.
                </Typography>
              )}
            </Stack>
          ) : (
            <TableContainer
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  width: "100%",
                  "& td, & th": {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    verticalAlign: "top",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "24%" }}>Periodo</TableCell>

                    <TableCell align="right" sx={{ width: "19%" }}>
                      Total referidos
                    </TableCell>

                    <TableCell align="right" sx={{ width: "19%" }}>
                      Confirmados
                    </TableCell>

                    <TableCell align="right" sx={{ width: "19%" }}>
                      Pendientes
                    </TableCell>

                    <TableCell align="right" sx={{ width: "19%" }}>
                      Ganancia total
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={`${row.anio}-${row.mes}`}>
                      <TableCell>
                        <Typography fontWeight={800}>
                          {row.periodo || `${row.mes_nombre} ${row.anio}`}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {toNumber(row.total_referidos)}
                      </TableCell>

                      <TableCell align="right">
                        {toNumber(row.confirmados)}
                      </TableCell>

                      <TableCell align="right">
                        {toNumber(row.pendientes)}
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={900}>
                          {formatoMoneda(row.ganancia_total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay historial global para este usuario.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[16, 32, 64]}
            onPageChange={(_, newPage) => {
              setPage(newPage);
              cargarHistorial(newPage, rowsPerPage);
            }}
            onRowsPerPageChange={(event) => {
              const newRowsPerPage = parseInt(event.target.value, 10);

              setRowsPerPage(newRowsPerPage);
              setPage(0);
              cargarHistorial(0, newRowsPerPage);
            }}
            labelRowsPerPage="Filas por página"
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              "& .MuiTablePagination-toolbar": {
                px: { xs: 0, sm: 2 },
                flexWrap: "wrap",
                justifyContent: { xs: "center", sm: "flex-end" },
                gap: { xs: 0.5, sm: 1 },
              },
              "& .MuiTablePagination-spacer": {
                display: { xs: "none", sm: "block" },
              },
              "& .MuiTablePagination-selectLabel": {
                display: { xs: "none", sm: "block" },
              },
              "& .MuiTablePagination-displayedRows": {
                m: 0,
                fontSize: { xs: 12, sm: 14 },
              },
            }}
          />

          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: { xs: 1.25, sm: 1.5, md: 2 },
              borderRadius: { xs: 2.5, md: 3 },
              bgcolor: "background.default",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <Stack spacing={1.5}>
              <Box minWidth={0}>
                <Typography fontWeight={900}>Total histórico</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "break-word" }}
                >
                  Total acumulado de todos los meses del usuario.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.1, sm: 2 }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Referidos
                  </Typography>

                  <Typography fontWeight={900}>
                    {totales.total_referidos}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Confirmados
                  </Typography>

                  <Typography fontWeight={900}>{totales.confirmados}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pendientes
                  </Typography>

                  <Typography fontWeight={900}>{totales.pendientes}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ganancia total
                  </Typography>

                  <Typography
                    fontWeight={900}
                    sx={{
                      fontSize: { xs: 18, sm: 20 },
                      wordBreak: "break-word",
                    }}
                  >
                    {formatoMoneda(totales.ganancia_total)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </>
      )}
    </Paper>
  );
}