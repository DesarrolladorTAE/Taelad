import {
  ReceiptLong as ReceiptLongIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import {
  FormEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  obtenerTimbradosTaeconta,
  timbrarCompraTaeconta,
} from "../../../services/taecontaTimbrado.service";
import {
  TAE_CONTA_SERIE,
  TaecontaTimbrado,
  TaecontaTimbradoEstatus,
  TimbrarCompraTaecontaPayload,
} from "../../../types/taecontaTimbrado";

type FormularioTimbrado = {
  historial_cliente_id: string;
  uso_cfdi: string;
  metodo_pago: "PUE" | "PPD";
  forma_pago: string;
};

const FORMULARIO_INICIAL: FormularioTimbrado = {
  historial_cliente_id: "",
  uso_cfdi: "G03",
  metodo_pago: "PUE",
  forma_pago: "03",
};

const ETIQUETAS_ESTATUS: Record<TaecontaTimbradoEstatus, string> = {
  pendiente: "Pendiente",
  procesando: "Procesando",
  timbrada: "Timbrada",
  rechazado: "Rechazado",
  error: "Error",
  cancelada: "Cancelada",
};

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
        }
      | undefined;

    if (data?.errors) {
      const primerError = Object.values(data.errors).flat()[0];

      if (primerError) {
        return primerError;
      }
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocurrió un error al procesar la solicitud.";
}

function formatoMoneda(valor: number | string | null): string {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isFinite(numero) ? numero : 0);
}

function formatoFecha(fecha: string | null): string {
  if (!fecha) {
    return "—";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-MX");
}

function colorEstatus(
  estatus: TaecontaTimbradoEstatus
): "default" | "success" | "error" | "warning" | "info" {
  switch (estatus) {
    case "timbrada":
      return "success";

    case "rechazado":
    case "error":
      return "error";

    case "pendiente":
      return "warning";

    case "procesando":
      return "info";

    case "cancelada":
    default:
      return "default";
  }
}

function obtenerHistorialClienteId(
  timbrado: TaecontaTimbrado
): number | null {
  return timbrado.compra?.historial_cliente_id ?? null;
}

export default function TaecontaTimbradoPage() {
  const [tab, setTab] = useState(0);

  const [formulario, setFormulario] =
    useState<FormularioTimbrado>(FORMULARIO_INICIAL);

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [timbrados, setTimbrados] = useState<TaecontaTimbrado[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estatus, setEstatus] =
    useState<TaecontaTimbradoEstatus | "">("");

  const cargarHistorial = useCallback(async () => {
    setCargandoHistorial(true);
    setError(null);

    try {
      const response = await obtenerTimbradosTaeconta({
        page: pagina,
        per_page: 15,
        search: busqueda,
        estatus,
      });

      setTimbrados(response.data);
      setUltimaPagina(Math.max(response.last_page, 1));
      setTotalRegistros(response.total);
    } catch (requestError) {
      setError(obtenerMensajeError(requestError));
    } finally {
      setCargandoHistorial(false);
    }
  }, [pagina, busqueda, estatus]);

  useEffect(() => {
    if (tab !== 1) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void cargarHistorial();
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [tab, cargarHistorial]);

  const cambiarTab = (_event: SyntheticEvent, nuevoTab: number) => {
    setTab(nuevoTab);
    setMensaje(null);
    setError(null);
  };

  const actualizarCampo = <K extends keyof FormularioTimbrado>(
    campo: K,
    valor: FormularioTimbrado[K]
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const validarFormulario = (): string | null => {
    const historialClienteId = Number(
      formulario.historial_cliente_id
    );

    if (
      !formulario.historial_cliente_id.trim() ||
      !Number.isInteger(historialClienteId) ||
      historialClienteId <= 0
    ) {
      return "Ingrese un ID de movimiento del historial válido.";
    }

    if (
      !/^[A-Z0-9]{3,4}$/.test(
        formulario.uso_cfdi.trim().toUpperCase()
      )
    ) {
      return "El uso de CFDI no tiene un formato válido.";
    }

    if (!["PUE", "PPD"].includes(formulario.metodo_pago)) {
      return "El método de pago debe ser PUE o PPD.";
    }

    if (!/^[0-9]{2}$/.test(formulario.forma_pago.trim())) {
      return "La forma de pago debe contener dos dígitos.";
    }

    if (
      formulario.metodo_pago === "PPD" &&
      formulario.forma_pago !== "99"
    ) {
      return "Cuando el método de pago es PPD, la forma de pago debe ser 99.";
    }

    return null;
  };

  const enviarTimbrado = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setEnviando(true);
    setMensaje(null);
    setError(null);

    try {
      const payload: TimbrarCompraTaecontaPayload = {
        historial_cliente_id: Number(
          formulario.historial_cliente_id
        ),
        uso_cfdi: formulario.uso_cfdi.trim().toUpperCase(),
        metodo_pago: formulario.metodo_pago,
        forma_pago: formulario.forma_pago.trim(),
      };

      const response = await timbrarCompraTaeconta(payload);

      const datosRespuesta = [
        response.data.serie && response.data.folio
          ? `${response.data.serie}-${response.data.folio}`
          : null,
        response.data.uuid
          ? `UUID: ${response.data.uuid}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

      setMensaje(
        datosRespuesta
          ? `${response.message} ${datosRespuesta}`
          : response.message
      );

      setFormulario(FORMULARIO_INICIAL);
      setPagina(1);
      setTab(1);
    } catch (requestError) {
      setError(obtenerMensajeError(requestError));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Timbrado CFDI TaeConta
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Generación y consulta de CFDI vinculados al historial de
          ventas de los clientes.
        </Typography>
      </Stack>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={cambiarTab}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Generar CFDI" />
          <Tab label="Historial de timbrados" />
        </Tabs>
      </Paper>

      {mensaje && (
        <Alert
          severity="success"
          onClose={() => setMensaje(null)}
          sx={{ mb: 2 }}
        >
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {tab === 0 && (
        <Box
          component="form"
          onSubmit={enviarTimbrado}
          noValidate
        >
          <Stack spacing={3}>
            <Alert severity="info">
              Seleccione el ID del movimiento registrado en el historial
              de ventas. El receptor, producto, claves SAT, precios,
              IVA y total se obtienen automáticamente. La serie es fija
              y el folio se solicita directamente a TaeConta.
            </Alert>

            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 2 }}
                >
                  Movimiento a facturar
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="ID del historial de ventas"
                    type="number"
                    value={formulario.historial_cliente_id}
                    onChange={(event) =>
                      actualizarCampo(
                        "historial_cliente_id",
                        event.target.value
                      )
                    }
                    inputProps={{
                      min: 1,
                      step: 1,
                    }}
                    helperText="ID del movimiento en historial_clientes"
                    required
                    fullWidth
                  />

                  <TextField
                    label="Serie"
                    value={TAE_CONTA_SERIE}
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText="Serie fija del sistema"
                    fullWidth
                  />

                  <TextField
                    select
                    label="Método de pago"
                    value={formulario.metodo_pago}
                    onChange={(event) => {
                      const metodoPago = event.target.value as
                        | "PUE"
                        | "PPD";

                      setFormulario((actual) => ({
                        ...actual,
                        metodo_pago: metodoPago,
                        forma_pago:
                          metodoPago === "PPD"
                            ? "99"
                            : actual.forma_pago === "99"
                              ? "03"
                              : actual.forma_pago,
                      }));
                    }}
                    required
                    fullWidth
                  >
                    <MenuItem value="PUE">
                      PUE - Pago en una sola exhibición
                    </MenuItem>

                    <MenuItem value="PPD">
                      PPD - Pago en parcialidades o diferido
                    </MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Forma de pago"
                    value={formulario.forma_pago}
                    onChange={(event) =>
                      actualizarCampo(
                        "forma_pago",
                        event.target.value
                      )
                    }
                    disabled={formulario.metodo_pago === "PPD"}
                    required
                    fullWidth
                  >
                    <MenuItem value="01">01 - Efectivo</MenuItem>

                    <MenuItem value="02">
                      02 - Cheque nominativo
                    </MenuItem>

                    <MenuItem value="03">
                      03 - Transferencia electrónica
                    </MenuItem>

                    <MenuItem value="04">
                      04 - Tarjeta de crédito
                    </MenuItem>

                    <MenuItem value="28">
                      28 - Tarjeta de débito
                    </MenuItem>

                    <MenuItem value="99">
                      99 - Por definir
                    </MenuItem>
                  </TextField>

                  <TextField
                    label="Uso de CFDI"
                    value={formulario.uso_cfdi}
                    onChange={(event) =>
                      actualizarCampo(
                        "uso_cfdi",
                        event.target.value.toUpperCase()
                      )
                    }
                    inputProps={{
                      maxLength: 4,
                    }}
                    helperText="Ejemplo: G03 o S01"
                    required
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 2 }}
                >
                  Información obtenida automáticamente
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Receptor
                    </Typography>

                    <Typography fontWeight={600}>
                      Datos fiscales del cliente
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Concepto
                    </Typography>

                    <Typography fontWeight={600}>
                      Movimiento del historial de ventas
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Importes
                    </Typography>

                    <Typography fontWeight={600}>
                      Snapshot fiscal con 6 decimales
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Folio
                    </Typography>

                    <Typography fontWeight={600}>
                      Asignado por TaeConta
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="warning" sx={{ mt: 3 }}>
                  El movimiento debe estar pagado y el producto debe tener
                  una clave SAT de producto y una clave SAT de unidad
                  válidas. En caso contrario, el backend impedirá el
                  timbrado antes de enviar información a TaeConta.
                </Alert>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 3,
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={enviando}
                    startIcon={
                      enviando ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : (
                        <ReceiptLongIcon />
                      )
                    }
                  >
                    {enviando
                      ? "Timbrando..."
                      : "Generar y timbrar CFDI"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <TextField
                label="Buscar"
                placeholder="Movimiento, folio, RFC, nombre o UUID"
                value={busqueda}
                onChange={(event) => {
                  setBusqueda(event.target.value);
                  setPagina(1);
                }}
                fullWidth
              />

              <TextField
                select
                label="Estatus"
                value={estatus}
                onChange={(event) => {
                  setEstatus(
                    event.target.value as
                      | TaecontaTimbradoEstatus
                      | ""
                  );
                  setPagina(1);
                }}
                sx={{
                  width: {
                    xs: "100%",
                    md: 210,
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="procesando">Procesando</MenuItem>
                <MenuItem value="timbrada">Timbrada</MenuItem>
                <MenuItem value="rechazado">Rechazado</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </TextField>

              <Button
                variant="outlined"
                startIcon={
                  cargandoHistorial ? (
                    <CircularProgress size={18} />
                  ) : (
                    <RefreshIcon />
                  )
                }
                onClick={() => void cargarHistorial()}
                disabled={cargandoHistorial}
                sx={{
                  whiteSpace: "nowrap",
                }}
              >
                Actualizar
              </Button>
            </Stack>

            <TableContainer>
              <Table sx={{ minWidth: 950 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Movimiento</TableCell>
                    <TableCell>Serie / Folio</TableCell>
                    <TableCell>Receptor</TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Estatus</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cargandoHistorial ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : timbrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    timbrados.map((timbrado) => {
                      const historialClienteId =
                        obtenerHistorialClienteId(timbrado);

                      return (
                        <TableRow key={timbrado.id} hover>
                          <TableCell>
                            <Typography fontWeight={700}>
                              {historialClienteId
                                ? `#${historialClienteId}`
                                : "—"}
                            </Typography>

                            {timbrado.historial_compra_id && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Snapshot fiscal #
                                {timbrado.historial_compra_id}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={700}>
                              {timbrado.serie}
                              {timbrado.folio
                                ? ` - ${timbrado.folio}`
                                : " - Pendiente"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {timbrado.receptor_nombre}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {timbrado.receptor_rfc}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 260,
                                wordBreak: "break-all",
                              }}
                            >
                              {timbrado.uuid || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            {formatoMoneda(timbrado.total)}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                ETIQUETAS_ESTATUS[
                                  timbrado.estatus
                                ]
                              }
                              color={colorEstatus(
                                timbrado.estatus
                              )}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            {formatoFecha(timbrado.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mt: 3 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {totalRegistros} registros
              </Typography>

              <Pagination
                count={Math.max(ultimaPagina, 1)}
                page={pagina}
                onChange={(_event, nuevaPagina) =>
                  setPagina(nuevaPagina)
                }
                color="primary"
              />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}