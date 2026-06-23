import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchTaecontaEmpresas } from "../../services/superadminService";

export default function TaecontaEmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaDetalle, setEmpresaDetalle] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await fetchTaecontaEmpresas(page);

      console.log("RESPUESTA EMPRESAS TAECONTA:", response);

      const data =
        response?.data?.data ??
        response?.data ??
        response?.empresas ??
        response?.raw?.data ??
        response?.raw?.empresas ??
        [];

      setEmpresas(Array.isArray(data) ? data : []);

      setPagination(
        response?.pagination ??
          response?.raw?.pagination ??
          {
            current_page: page,
            last_page: 1,
            total: Array.isArray(data) ? data.length : 0,
          }
      );
    } catch (error: any) {
      console.error("ERROR CARGANDO EMPRESAS:", error);

      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar las empresas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, [page]);

  return (
    <Box mt={2}>
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {!loading && errorMsg && (
        <Typography color="error" mb={2}>
          {errorMsg}
        </Typography>
      )}

      {!loading && !errorMsg && empresas.length === 0 && (
        <Typography color="text.secondary" mb={2}>
          No hay empresas para mostrar.
        </Typography>
      )}

      <Grid container spacing={2}>
        {empresas.map((empresa) => (
          <Grid item xs={12} sm={6} md={3} key={empresa.id}>
            <Card>
              <CardContent>
                <Typography fontWeight={800} noWrap>
                  {empresa.nombre || "Sin nombre"}
                </Typography>

                <Typography fontSize={14}>
                  RFC: {empresa.rfc || "Sin RFC"}
                </Typography>

                <Typography fontSize={14}>
                  Vence: {empresa.expires_at || "Sin fecha"}
                </Typography>

                <Typography fontSize={14}>
                  Teléfono: {empresa.telefono || "Sin teléfono"}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => setEmpresaDetalle(empresa)}
                >
                  Más información
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {empresas.length > 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={3}>
          <Button
            variant="outlined"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Anterior
          </Button>

          <Typography fontSize={14}>
            Página {pagination?.current_page || page} de {pagination?.last_page || 1}
          </Typography>

          <Button
            variant="outlined"
            disabled={pagination && pagination.current_page >= pagination.last_page}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </Box>
      )}

      <Dialog
        open={Boolean(empresaDetalle)}
        onClose={() => setEmpresaDetalle(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Más información</DialogTitle>

        <DialogContent>
          {empresaDetalle &&
            Object.entries(empresaDetalle).map(([campo, valor]) => (
              <Box key={campo} py={1}>
                <Typography fontWeight={700}>{campo}</Typography>
                <Typography fontSize={14}>
                  {valor === null || valor === undefined || valor === ""
                    ? "Sin dato"
                    : typeof valor === "object"
                    ? JSON.stringify(valor, null, 2)
                    : String(valor)}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}