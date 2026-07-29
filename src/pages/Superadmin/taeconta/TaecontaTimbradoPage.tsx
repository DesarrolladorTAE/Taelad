import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
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
  Divider,
  IconButton,
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
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  obtenerTimbradosTaeconta,
  timbrarCfdiTaeconta,
} from "../../../services/taecontaTimbrado.service";
import {
  TaecontaProducto,
  TaecontaTimbrado,
  TaecontaTimbradoEstatus,
  TimbrarCfdiTaecontaPayload,
} from "../../../types/taecontaTimbrado";

const PRODUCTO_INICIAL: TaecontaProducto = {
  descripcion: "",
  cantidad: 1,
  claveUnidad: "E48",
  claveProducto: "",
  precio: 0,
  iva: "0xxxx",
  riva: "0xxxx",
  risr: "0xxxx",
  ieps: "0xxxx",
  ish: "0xxxx",
  total: 0,
  descuento: 0,
  tipoFactor: "Tasa",
};

function fechaLocalActual(): string {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());

  return fecha.toISOString().slice(0, 19);
}

function formularioInicial(): TimbrarCfdiTaecontaPayload {
  return {
    folio: "",
    serie: "",
    fecha: fechaLocalActual(),
    metodoPago: "PUE",
    formaPago: "03",
    usoCfdi: "G03",
    clienteRFC: "",
    RegimenFiscalReceptor: "",
    DomicilioFiscalReceptor: "",
    clienteCorreo: "",
    Nombre: "",
    productos: [{ ...PRODUCTO_INICIAL }],
  };
}

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
        }
      | undefined;

    if (data?.message) return data.message;
    if (data?.error) return data.error;

    const primerError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;

    if (primerError) return primerError;
  }

  return "Ocurrió un error al procesar la solicitud.";
}

function obtenerIva(iva: string): number {
  const coincidencia = iva.trim().match(/^(\d+(?:\.\d+)?)ti/i);

  return coincidencia ? Number(coincidencia[1]) : 0;
}

function formatoMoneda(valor: number | string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor || 0));
}

function colorEstatus(
  estatus: TaecontaTimbradoEstatus
): "default" | "success" | "error" | "warning" {
  switch (estatus) {
    case "timbrado":
      return "success";
    case "rechazado":
    case "error":
      return "error";
    case "pendiente":
      return "warning";
    default:
      return "default";
  }
}

export default function TaecontaTimbradoPage() {
  const [tab, setTab] = useState(0);
  const [formulario, setFormulario] =
    useState<TimbrarCfdiTaecontaPayload>(formularioInicial);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [timbrados, setTimbrados] = useState<TaecontaTimbrado[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estatus, setEstatus] = useState<TaecontaTimbradoEstatus | "">("");

  const totales = useMemo(() => {
    return formulario.productos.reduce(
      (acumulado, producto) => {
        acumulado.subtotal +=
          Number(producto.cantidad || 0) * Number(producto.precio || 0);
        acumulado.descuento += Number(producto.descuento || 0);
        acumulado.iva += obtenerIva(producto.iva);
        acumulado.total += Number(producto.total || 0);

        return acumulado;
      },
      {
        subtotal: 0,
        descuento: 0,
        iva: 0,
        total: 0,
      }
    );
  }, [formulario.productos]);

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
      setUltimaPagina(response.last_page);
      setTotalRegistros(response.total);
    } catch (requestError) {
      setError(obtenerMensajeError(requestError));
    } finally {
      setCargandoHistorial(false);
    }
  }, [pagina, busqueda, estatus]);

  useEffect(() => {
    if (tab === 1) {
      cargarHistorial();
    }
  }, [tab, cargarHistorial]);

  const cambiarTab = (_event: SyntheticEvent, nuevoTab: number) => {
    setTab(nuevoTab);
    setMensaje(null);
    setError(null);
  };

  const actualizarCampo = <K extends keyof TimbrarCfdiTaecontaPayload>(
    campo: K,
    valor: TimbrarCfdiTaecontaPayload[K]
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const actualizarProducto = (
    indice: number,
    cambios: Partial<TaecontaProducto>
  ) => {
    setFormulario((actual) => ({
      ...actual,
      productos: actual.productos.map((producto, posicion) =>
        posicion === indice ? { ...producto, ...cambios } : producto
      ),
    }));
  };

  const agregarProducto = () => {
    setFormulario((actual) => ({
      ...actual,
      productos: [...actual.productos, { ...PRODUCTO_INICIAL }],
    }));
  };

  const eliminarProducto = (indice: number) => {
    if (formulario.productos.length === 1) return;

    setFormulario((actual) => ({
      ...actual,
      productos: actual.productos.filter(
        (_producto, posicion) => posicion !== indice
      ),
    }));
  };

  const validarFormulario = (): string | null => {
    if (!formulario.folio.trim()) return "El folio es obligatorio.";
    if (!formulario.serie.trim()) return "La serie es obligatoria.";
    if (!formulario.clienteRFC.trim()) return "El RFC del receptor es obligatorio.";
    if (!formulario.Nombre.trim()) return "El nombre del receptor es obligatorio.";
    if (!formulario.RegimenFiscalReceptor.trim()) {
      return "El régimen fiscal del receptor es obligatorio.";
    }
    if (!formulario.DomicilioFiscalReceptor.trim()) {
      return "El código postal fiscal es obligatorio.";
    }

    const productoInvalido = formulario.productos.find(
      (producto) =>
        !producto.descripcion.trim() ||
        !producto.claveUnidad.trim() ||
        !producto.claveProducto.trim() ||
        Number(producto.cantidad) <= 0
    );

    if (productoInvalido) {
      return "Complete correctamente todos los conceptos.";
    }

    return null;
  };

  const enviarTimbrado = async () => {
    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setEnviando(true);
    setMensaje(null);
    setError(null);

    try {
      const payload: TimbrarCfdiTaecontaPayload = {
        ...formulario,
        folio: formulario.folio.trim(),
        serie: formulario.serie.trim(),
        clienteRFC: formulario.clienteRFC.trim().toUpperCase(),
        Nombre: formulario.Nombre.trim().toUpperCase(),
        RegimenFiscalReceptor:
          formulario.RegimenFiscalReceptor.trim(),
        DomicilioFiscalReceptor:
          formulario.DomicilioFiscalReceptor.trim(),
        clienteCorreo: formulario.clienteCorreo?.trim() || null,
        productos: formulario.productos.map((producto) => ({
          ...producto,
          descripcion: producto.descripcion.trim(),
          claveUnidad: producto.claveUnidad.trim().toUpperCase(),
          claveProducto: producto.claveProducto.trim(),
          cantidad: Number(producto.cantidad),
          precio: Number(producto.precio),
          total: Number(producto.total),
          descuento: Number(producto.descuento),
        })),
      };

      const response = await timbrarCfdiTaeconta(payload);

      setMensaje(
        response.data.uuid
          ? `${response.message} UUID: ${response.data.uuid}`
          : response.message
      );

      setFormulario(formularioInicial());
      setPagina(1);
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
          Timbrado CFDI Taeconta
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Generación, timbrado y consulta de comprobantes fiscales.
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
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tab === 0 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Datos del comprobante
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
                  label="Serie"
                  value={formulario.serie}
                  onChange={(event) =>
                    actualizarCampo("serie", event.target.value)
                  }
                  required
                  fullWidth
                />

                <TextField
                  label="Folio"
                  value={formulario.folio}
                  onChange={(event) =>
                    actualizarCampo("folio", event.target.value)
                  }
                  required
                  fullWidth
                />

               <TextField
  label="Fecha"
  type="datetime-local"
  value={formulario.fecha}
  onChange={(event) => actualizarCampo("fecha", event.target.value)}
  InputLabelProps={{ shrink: true }}
  required
  fullWidth
/>

                <TextField
                  select
                  label="Método de pago"
                  value={formulario.metodoPago}
                  onChange={(event) =>
                    actualizarCampo(
                      "metodoPago",
                      event.target.value as "PUE" | "PPD"
                    )
                  }
                  fullWidth
                >
                  <MenuItem value="PUE">PUE</MenuItem>
                  <MenuItem value="PPD">PPD</MenuItem>
                </TextField>

                <TextField
                  label="Forma de pago SAT"
                  value={formulario.formaPago}
                  onChange={(event) =>
                    actualizarCampo("formaPago", event.target.value)
                  }
                  inputProps={{ maxLength: 2 }}
                  required
                  fullWidth
                />

                <TextField
                  label="Uso CFDI"
                  value={formulario.usoCfdi}
                  onChange={(event) =>
                    actualizarCampo(
                      "usoCfdi",
                      event.target.value.toUpperCase()
                    )
                  }
                  required
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Receptor
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="RFC"
                  value={formulario.clienteRFC}
                  onChange={(event) =>
                    actualizarCampo(
                      "clienteRFC",
                      event.target.value.toUpperCase()
                    )
                  }
                  inputProps={{ maxLength: 13 }}
                  required
                  fullWidth
                />

                <TextField
                  label="Razón social"
                  value={formulario.Nombre}
                  onChange={(event) =>
                    actualizarCampo("Nombre", event.target.value)
                  }
                  required
                  fullWidth
                />

                <TextField
                  label="Régimen fiscal"
                  value={formulario.RegimenFiscalReceptor}
                  onChange={(event) =>
                    actualizarCampo(
                      "RegimenFiscalReceptor",
                      event.target.value
                    )
                  }
                  inputProps={{ maxLength: 3 }}
                  required
                  fullWidth
                />

                <TextField
                  label="Código postal fiscal"
                  value={formulario.DomicilioFiscalReceptor}
                  onChange={(event) =>
                    actualizarCampo(
                      "DomicilioFiscalReceptor",
                      event.target.value
                    )
                  }
                  inputProps={{ maxLength: 5 }}
                  required
                  fullWidth
                />

                <TextField
                  label="Correo"
                  type="email"
                  value={formulario.clienteCorreo ?? ""}
                  onChange={(event) =>
                    actualizarCampo("clienteCorreo", event.target.value)
                  }
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Conceptos
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={agregarProducto}
                >
                  Agregar concepto
                </Button>
              </Stack>

              <Stack spacing={2}>
                {formulario.productos.map((producto, indice) => (
                  <Paper
                    key={indice}
                    variant="outlined"
                    sx={{ p: 2, position: "relative" }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Typography fontWeight={700}>
                        Concepto {indice + 1}
                      </Typography>

                      <IconButton
                        color="error"
                        disabled={formulario.productos.length === 1}
                        onClick={() => eliminarProducto(indice)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>

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
                        label="Descripción"
                        value={producto.descripcion}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            descripcion: event.target.value,
                          })
                        }
                        required
                        fullWidth
                        sx={{ gridColumn: { lg: "span 2" } }}
                      />

                      <TextField
                        label="Cantidad"
                        type="number"
                        value={producto.cantidad}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            cantidad: Number(event.target.value),
                          })
                        }
                        inputProps={{ min: 0.01, step: 0.01 }}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Precio unitario"
                        type="number"
                        value={producto.precio}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            precio: Number(event.target.value),
                          })
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Clave de unidad"
                        value={producto.claveUnidad}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            claveUnidad: event.target.value.toUpperCase(),
                          })
                        }
                        required
                        fullWidth
                      />

                      <TextField
                        label="Clave de producto SAT"
                        value={producto.claveProducto}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            claveProducto: event.target.value,
                          })
                        }
                        inputProps={{ maxLength: 8 }}
                        required
                        fullWidth
                      />

                      <TextField
                        label="IVA"
                        value={producto.iva}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            iva: event.target.value,
                          })
                        }
                        helperText="Ejemplo: 160ti16 o 0xxxx"
                        required
                        fullWidth
                      />

                      <TextField
                        select
                        label="Tipo de factor"
                        value={producto.tipoFactor}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            tipoFactor: event.target
                              .value as TaecontaProducto["tipoFactor"],
                          })
                        }
                        fullWidth
                      >
                        <MenuItem value="Tasa">Tasa</MenuItem>
                        <MenuItem value="Cuota">Cuota</MenuItem>
                        <MenuItem value="Exento">Exento</MenuItem>
                      </TextField>

                      <TextField
                        label="Retención IVA"
                        value={producto.riva}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            riva: event.target.value,
                          })
                        }
                        required
                        fullWidth
                      />

                      <TextField
                        label="Retención ISR"
                        value={producto.risr}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            risr: event.target.value,
                          })
                        }
                        required
                        fullWidth
                      />

                      <TextField
                        label="IEPS"
                        value={producto.ieps}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            ieps: event.target.value,
                          })
                        }
                        required
                        fullWidth
                      />

                      <TextField
                        label="ISH"
                        value={producto.ish}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            ish: event.target.value,
                          })
                        }
                        required
                        fullWidth
                      />

                      <TextField
                        label="Descuento"
                        type="number"
                        value={producto.descuento}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            descuento: Number(event.target.value),
                          })
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Total con impuestos"
                        type="number"
                        value={producto.total}
                        onChange={(event) =>
                          actualizarProducto(indice, {
                            total: Number(event.target.value),
                          })
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        fullWidth
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Totales
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography fontWeight={700}>
                    {formatoMoneda(totales.subtotal)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Descuento
                  </Typography>
                  <Typography fontWeight={700}>
                    {formatoMoneda(totales.descuento)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    IVA
                  </Typography>
                  <Typography fontWeight={700}>
                    {formatoMoneda(totales.iva)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatoMoneda(totales.total)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={enviando}
                  onClick={enviarTimbrado}
                  startIcon={
                    enviando ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : undefined
                  }
                >
                  {enviando ? "Timbrando..." : "Generar y timbrar CFDI"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
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
                placeholder="Folio, serie, RFC, nombre o UUID"
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
                    event.target.value as TaecontaTimbradoEstatus | ""
                  );
                  setPagina(1);
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="timbrado">Timbrado</MenuItem>
                <MenuItem value="rechazado">Rechazado</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </TextField>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarHistorial}
                disabled={cargandoHistorial}
              >
                Actualizar
              </Button>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
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
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : timbrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    timbrados.map((timbrado) => (
                      <TableRow key={timbrado.id} hover>
                        <TableCell>
                          <Typography fontWeight={700}>
                            {timbrado.serie} - {timbrado.folio}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
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
                            sx={{ wordBreak: "break-all" }}
                          >
                            {timbrado.uuid || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          {formatoMoneda(timbrado.total)}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={timbrado.estatus}
                            color={colorEstatus(timbrado.estatus)}
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          {new Date(timbrado.created_at).toLocaleString(
                            "es-MX"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
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
              <Typography variant="body2" color="text.secondary">
                {totalRegistros} registros
              </Typography>

              <Pagination
                count={ultimaPagina}
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