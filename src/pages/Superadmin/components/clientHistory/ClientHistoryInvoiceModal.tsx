import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  obtenerPrevisualizacionFacturaTaeconta,
  timbrarCompraTaeconta,
} from "../../../../services/taecontaTimbrado.service";
import {
  TaecontaFacturaPreviewResponse,
} from "../../../../types/taecontaTimbrado";

type Props = {
  open: boolean;
  historialClienteId: number | null;
  onClose: () => void;
  onTimbrado: () => Promise<void> | void;
};

type FormularioFiscal = {
  uso_cfdi: string;
  metodo_pago: "PUE";
  forma_pago: string;
};

const FORMULARIO_INICIAL: FormularioFiscal = {
  uso_cfdi: "G03",
  metodo_pago: "PUE",
  forma_pago: "03",
};

function mensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
          data?: {
            faltantes?: string[];
          };
        }
      | undefined;

    const primerError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;

    if (primerError) {
      return primerError;
    }

    if (data?.data?.faltantes?.length) {
      return data.data.faltantes[0];
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible procesar la solicitud.";
}

function seisDecimales(valor: string | null | undefined): string {
  if (!valor) {
    return "0.000000";
  }

  const normalizado = String(valor).trim();
  const negativo = normalizado.startsWith("-");
  const absoluto = negativo ? normalizado.slice(1) : normalizado;
  const [entero = "0", decimal = ""] = absoluto.split(".");
  const decimales = decimal.padEnd(6, "0").slice(0, 6);

  return `${negativo ? "-" : ""}${entero}.${decimales}`;
}

function CampoFiscal({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string | null | undefined;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        height: "100%",
        borderRadius: 2.5,
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
      >
        {etiqueta}
      </Typography>

      <Typography mt={0.4} fontWeight={850} sx={{ wordBreak: "break-word" }}>
        {valor || "No registrado"}
      </Typography>
    </Paper>
  );
}

export default function ClientHistoryInvoiceModal({
  open,
  historialClienteId,
  onClose,
  onTimbrado,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [preview, setPreview] =
    useState<TaecontaFacturaPreviewResponse | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioFiscal>(FORMULARIO_INICIAL);

  const [cargando, setCargando] = useState(false);
  const [timbrando, setTimbrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarPreview = useCallback(async () => {
    if (!historialClienteId) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const response =
        await obtenerPrevisualizacionFacturaTaeconta(
          historialClienteId
        );

      setPreview(response);

      setFormulario({
        uso_cfdi:
          response.data.opciones_sugeridas.uso_cfdi || "G03",
        metodo_pago: "PUE",
        forma_pago:
          response.data.opciones_sugeridas.forma_pago || "03",
      });
    } catch (requestError) {
      setPreview(null);
      setError(mensajeError(requestError));
    } finally {
      setCargando(false);
    }
  }, [historialClienteId]);

  useEffect(() => {
    if (!open) {
      setPreview(null);
      setFormulario(FORMULARIO_INICIAL);
      setError(null);
      setMensaje(null);
      return;
    }

    void cargarPreview();
  }, [open, cargarPreview]);

  const timbradoBloqueante =
    preview?.data.timbrado?.estatus === "timbrada" ||
    preview?.data.timbrado?.estatus === "procesando";

  const puedeTimbrar =
    Boolean(preview?.can_invoice) &&
    !timbradoBloqueante &&
    !cargando &&
    !timbrando;

  async function confirmarTimbrado() {
    if (!historialClienteId || !puedeTimbrar) {
      return;
    }

    if (!/^[A-Z0-9]{3,4}$/.test(formulario.uso_cfdi.trim().toUpperCase())) {
      setError("El uso de CFDI no tiene un formato válido.");
      return;
    }

    if (!/^[0-9]{2}$/.test(formulario.forma_pago)) {
      setError("La forma de pago debe contener dos dígitos.");
      return;
    }

    setTimbrando(true);
    setError(null);
    setMensaje(null);

    try {
      const response = await timbrarCompraTaeconta({
        historial_cliente_id: historialClienteId,
        uso_cfdi: formulario.uso_cfdi.trim().toUpperCase(),
        metodo_pago: "PUE",
        forma_pago: formulario.forma_pago,
      });

      const referencia =
        response.data.serie && response.data.folio
          ? `${response.data.serie}-${response.data.folio}`
          : null;

      setMensaje(
        referencia
          ? `${response.message} ${referencia}`
          : response.message
      );

      await onTimbrado();
      await cargarPreview();
    } catch (requestError) {
      setError(mensajeError(requestError));
    } finally {
      setTimbrando(false);
    }
  }

  const cliente = preview?.data.cliente;
  const producto = preview?.data.producto;
  const totales = preview?.data.totales;
  const timbrado = preview?.data.timbrado;

  return (
    <Dialog
      open={open}
      onClose={() => !timbrando && onClose()}
      fullWidth
      fullScreen={isMobile}
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: {
            xs: 0,
            sm: 4,
          },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <RequestQuoteRoundedIcon color="primary" />

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Facturación CFDI
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Movimiento #{historialClienteId ?? "—"}
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} disabled={timbrando}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {cargando ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress />
              <Typography color="text.secondary">
                Validando información fiscal...
              </Typography>
            </Stack>
          </Box>
        ) : preview ? (
          <Stack spacing={2.5}>
            {mensaje ? <Alert severity="success">{mensaje}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}

            {preview.can_invoice ? (
              <Alert severity="success">{preview.message}</Alert>
            ) : (
              <Alert severity="warning">{preview.message}</Alert>
            )}

            {preview.data.faltantes.length > 0 ? (
              <Alert severity="error">
                <Typography fontWeight={900} mb={0.75}>
                  Datos que deben corregirse
                </Typography>

                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
                  {preview.data.faltantes.map((faltante) => (
                    <Typography component="li" key={faltante}>
                      {faltante}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            ) : null}

            {preview.data.advertencias.length > 0 ? (
              <Alert severity="info">
                {preview.data.advertencias.join(" ")}
              </Alert>
            ) : null}

            {timbrado ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor:
                    timbrado.estatus === "timbrada"
                      ? "success.main"
                      : "action.hover",
                  color:
                    timbrado.estatus === "timbrada"
                      ? "success.contrastText"
                      : "text.primary",
                }}
              >
                <Typography fontWeight={900}>
                  Estado del CFDI: {timbrado.estatus}
                </Typography>

                <Typography variant="body2">
                  Serie / folio: {timbrado.serie}
                  {timbrado.folio ? `-${timbrado.folio}` : ""}
                </Typography>

                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  UUID: {timbrado.uuid || "Pendiente"}
                </Typography>
              </Paper>
            ) : null}

            <Box>
              <Typography variant="h6" fontWeight={900} mb={1.5}>
                Datos del receptor
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <CampoFiscal etiqueta="Nombre o razón social" valor={cliente?.nombre} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CampoFiscal etiqueta="RFC" valor={cliente?.rfc} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CampoFiscal etiqueta="Régimen fiscal" valor={cliente?.regimen_fiscal} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CampoFiscal etiqueta="Código postal fiscal" valor={cliente?.codigo_postal_fiscal} />
                </Grid>

                <Grid item xs={12}>
                  <CampoFiscal etiqueta="Correo" valor={cliente?.correo} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" fontWeight={900} mb={1.5}>
                Producto y cálculo fiscal
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <CampoFiscal etiqueta="Producto" valor={producto?.nombre} />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <CampoFiscal etiqueta="Clave SAT" valor={producto?.clave_producto} />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <CampoFiscal etiqueta="Unidad SAT" valor={producto?.clave_unidad} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CampoFiscal
                    etiqueta="Cantidad"
                    valor={seisDecimales(producto?.cantidad)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CampoFiscal
                    etiqueta="Precio unitario con IVA"
                    valor={`$${seisDecimales(producto?.precio_unitario_con_iva)}`}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CampoFiscal
                    etiqueta="Precio unitario sin IVA"
                    valor={`$${seisDecimales(producto?.precio_unitario_sin_iva)}`}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CampoFiscal
                    etiqueta="Subtotal"
                    valor={`$${seisDecimales(totales?.subtotal)}`}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CampoFiscal
                    etiqueta="IVA 16 %"
                    valor={`$${seisDecimales(totales?.iva)}`}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CampoFiscal
                    etiqueta="Total"
                    valor={`$${seisDecimales(totales?.total)}`}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" fontWeight={900} mb={1.5}>
                Opciones del CFDI
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Uso de CFDI"
                    value={formulario.uso_cfdi}
                    inputProps={{ maxLength: 4 }}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        uso_cfdi: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Método de pago"
                    value="PUE - Pago en una exhibición"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Forma de pago"
                    value={formulario.forma_pago}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        forma_pago: event.target.value,
                      }))
                    }
                  >
                    <MenuItem value="01">01 - Efectivo</MenuItem>
                    <MenuItem value="02">02 - Cheque nominativo</MenuItem>
                    <MenuItem value="03">03 - Transferencia electrónica</MenuItem>
                    <MenuItem value="04">04 - Tarjeta de crédito</MenuItem>
                    <MenuItem value="28">28 - Tarjeta de débito</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        ) : (
          <Alert severity="error">
            {error || "No fue posible cargar la previsualización fiscal."}
          </Alert>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button onClick={onClose} disabled={timbrando}>
          Cerrar
        </Button>

        <Button
          variant="contained"
          onClick={() => void confirmarTimbrado()}
          disabled={!puedeTimbrar}
          startIcon={
            timbrando ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <RequestQuoteRoundedIcon />
            )
          }
        >
          {timbrando
            ? "Timbrando..."
            : timbrado?.estatus === "timbrada"
              ? "CFDI timbrado"
              : "Confirmar y timbrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}