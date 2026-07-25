import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import {
  createSuperAdminService,
  deleteSuperAdminService,
  getSuperAdminServices,
  updateSuperAdminService,
  type SuperAdminService,
  type SuperAdminServicePayload,
} from "../../../services/superadminService";

type Props = {
  volver: () => void;
};

type ServiceForm = {
  name: string;
  descripcion: string;
  tipo_product: string;
  precio: string;
  url_imagen: string;
};

type NotificationState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

const CATEGORIAS = [
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "renovaciones-dominio",
    label: "Renovaciones de dominio",
  },
  {
    value: "tickets",
    label: "Tickets",
  },
  {
    value: "crm",
    label: "CRM",
  },
  {
    value: "correos-corporativos",
    label: "Correos corporativos",
  },
] as const;

const TIPOS_SERVICIOS = new Set<string>(
  CATEGORIAS.map((categoria) => categoria.value),
);

const FORM_INICIAL: ServiceForm = {
  name: "",
  descripcion: "",
  tipo_product: "marketing",
  precio: "",
  url_imagen: "",
};

function obtenerNombreCategoria(tipoProduct: string): string {
  return (
    CATEGORIAS.find(
      (categoria) => categoria.value === tipoProduct,
    )?.label ||
    tipoProduct ||
    "Sin categoría"
  );
}

function obtenerServiciosRespuesta(
  response: any,
): SuperAdminService[] {
  const posiblesListados = [
    response?.data?.data,
    response?.data,
    response?.services,
    response,
  ];

  const listado = posiblesListados.find((item) =>
    Array.isArray(item),
  );

  return Array.isArray(listado) ? listado : [];
}

function formatearPrecio(
  precio: number | string,
): string {
  const valor = Number(precio);

  if (!Number.isFinite(valor)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
}

function formatearFecha(fecha: string | null): string {
  if (!fecha) {
    return "-";
  }

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function obtenerMensajeError(
  error: any,
  mensajeDefault: string,
): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    mensajeDefault
  );
}

export default function TablaServices({
  volver,
}: Props) {
  const [servicios, setServicios] = useState<
    SuperAdminService[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] =
    useState("todos");

  const [form, setForm] =
    useState<ServiceForm>(FORM_INICIAL);

  const [
    servicioSeleccionado,
    setServicioSeleccionado,
  ] = useState<SuperAdminService | null>(null);

  const [dialogFormulario, setDialogFormulario] =
    useState(false);
  const [dialogDetalle, setDialogDetalle] =
    useState(false);
  const [dialogEliminar, setDialogEliminar] =
    useState(false);

  const [notification, setNotification] =
    useState<NotificationState>({
      open: false,
      message: "",
      severity: "success",
    });

  const cargarServicios = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getSuperAdminServices({
        page: 1,
        perPage: 100,
      });

      setServicios(
        obtenerServiciosRespuesta(response),
      );
    } catch (error) {
      console.error(
        "Error cargando servicios:",
        error,
      );

      setNotification({
        open: true,
        message: obtenerMensajeError(
          error,
          "No fue posible cargar los servicios.",
        ),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarServicios();
  }, [cargarServicios]);

  const serviciosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return servicios.filter((servicio) => {
      const perteneceAlModulo =
        TIPOS_SERVICIOS.has(
          servicio.tipo_product,
        );

      const coincideCategoria =
        categoriaFiltro === "todos" ||
        servicio.tipo_product === categoriaFiltro;

      const nombre =
        servicio.name?.toLowerCase() || "";

      const descripcion =
        servicio.descripcion?.toLowerCase() || "";

      const categoria = obtenerNombreCategoria(
        servicio.tipo_product,
      ).toLowerCase();

      const coincideBusqueda =
        !texto ||
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto);

      return (
        perteneceAlModulo &&
        coincideCategoria &&
        coincideBusqueda
      );
    });
  }, [
    servicios,
    busqueda,
    categoriaFiltro,
  ]);

  const mostrarNotificacion = (
    message: string,
    severity: "success" | "error",
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const cerrarNotificacion = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const abrirCrear = () => {
    setServicioSeleccionado(null);
    setForm(FORM_INICIAL);
    setDialogFormulario(true);
  };

  const abrirEditar = (
    servicio: SuperAdminService,
  ) => {
    setServicioSeleccionado(servicio);

    setForm({
      name: servicio.name || "",
      descripcion: servicio.descripcion || "",
      tipo_product:
        servicio.tipo_product || "marketing",
      precio: String(servicio.precio ?? ""),
      url_imagen: servicio.url_imagen || "",
    });

    setDialogFormulario(true);
  };

  const abrirDetalle = (
    servicio: SuperAdminService,
  ) => {
    setServicioSeleccionado(servicio);
    setDialogDetalle(true);
  };

  const abrirEliminar = (
    servicio: SuperAdminService,
  ) => {
    setServicioSeleccionado(servicio);
    setDialogEliminar(true);
  };

  const cerrarFormulario = () => {
    if (saving) {
      return;
    }

    setDialogFormulario(false);
    setServicioSeleccionado(null);
    setForm(FORM_INICIAL);
  };

  const cerrarDetalle = () => {
    setDialogDetalle(false);
    setServicioSeleccionado(null);
  };

  const cerrarEliminar = () => {
    if (deleting) {
      return;
    }

    setDialogEliminar(false);
    setServicioSeleccionado(null);
  };

  const guardarServicio = async () => {
    const nombre = form.name.trim();
    const descripcion = form.descripcion.trim();
    const tipoProduct = form.tipo_product.trim();
    const precio = Number(form.precio);
    const urlImagen = form.url_imagen.trim();

    if (!nombre) {
      mostrarNotificacion(
        "El nombre es obligatorio.",
        "error",
      );
      return;
    }

    if (!tipoProduct) {
      mostrarNotificacion(
        "La categoría es obligatoria.",
        "error",
      );
      return;
    }

    if (!TIPOS_SERVICIOS.has(tipoProduct)) {
      mostrarNotificacion(
        "La categoría seleccionada no es válida.",
        "error",
      );
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      mostrarNotificacion(
        "Ingresa un precio válido.",
        "error",
      );
      return;
    }

    const payload: SuperAdminServicePayload = {
      name: nombre,
      descripcion: descripcion || null,
      tipo_product: tipoProduct,
      precio,
      url_imagen: urlImagen || null,
    };

    const editando = Boolean(
      servicioSeleccionado,
    );

    setSaving(true);

    try {
      if (servicioSeleccionado) {
        await updateSuperAdminService(
          servicioSeleccionado.id,
          payload,
        );
      } else {
        await createSuperAdminService(payload);
      }

      setDialogFormulario(false);
      setServicioSeleccionado(null);
      setForm(FORM_INICIAL);

      mostrarNotificacion(
        editando
          ? "Servicio actualizado correctamente."
          : "Servicio creado correctamente.",
        "success",
      );

      await cargarServicios();
    } catch (error) {
      console.error(
        "Error guardando servicio:",
        error,
      );

      mostrarNotificacion(
        obtenerMensajeError(
          error,
          "No fue posible guardar el servicio.",
        ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminarServicio = async () => {
    if (!servicioSeleccionado) {
      return;
    }

    setDeleting(true);

    try {
      await deleteSuperAdminService(
        servicioSeleccionado.id,
      );

      setDialogEliminar(false);
      setServicioSeleccionado(null);

      mostrarNotificacion(
        "Servicio eliminado correctamente.",
        "success",
      );

      await cargarServicios();
    } catch (error) {
      console.error(
        "Error eliminando servicio:",
        error,
      );

      mostrarNotificacion(
        obtenerMensajeError(
          error,
          "No fue posible eliminar el servicio.",
        ),
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box
        mb={3}
        display="flex"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        justifyContent="space-between"
        flexDirection={{
          xs: "column",
          md: "row",
        }}
        gap={2}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Button
            variant="contained"
            onClick={volver}
          >
            Volver
          </Button>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              Servicios
            </Typography>

            <Typography
              color="text.secondary"
              mt={0.5}
            >
              Administración de productos y
              servicios comerciales.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={abrirCrear}
        >
          Crear producto
        </Button>
      </Box>

      <Card
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 4,
        })}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
            mb={3}
          >
            <TextField
              fullWidth
              label="Buscar producto"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Categoría"
              value={categoriaFiltro}
              onChange={(event) =>
                setCategoriaFiltro(
                  event.target.value,
                )
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 280,
                },
              }}
            >
              <MenuItem value="todos">
                Todos
              </MenuItem>

              {CATEGORIAS.map(
                (categoria) => (
                  <MenuItem
                    key={categoria.value}
                    value={categoria.value}
                  >
                    {categoria.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Stack>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              py={6}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              sx={{
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 1050,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">
                      Precio
                    </TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="center">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {serviciosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 5 }}
                      >
                        Sin productos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    serviciosFiltrados.map(
                      (servicio) => (
                        <TableRow
                          hover
                          key={servicio.id}
                        >
                          <TableCell>
                            {servicio.id}
                          </TableCell>

                          <TableCell>
                            <Typography
                              fontWeight={700}
                            >
                              {servicio.name || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={obtenerNombreCategoria(
                                servicio.tipo_product,
                              )}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              maxWidth: 320,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {servicio.descripcion ||
                                "-"}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              fontWeight={700}
                              noWrap
                            >
                              {formatearPrecio(
                                servicio.precio,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {formatearFecha(
                              servicio.created_at,
                            )}
                          </TableCell>

                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="center"
                            >
                              <Tooltip title="Ver">
                                <IconButton
                                  color="info"
                                  onClick={() =>
                                    abrirDetalle(
                                      servicio,
                                    )
                                  }
                                >
                                  <VisibilityRoundedIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Editar">
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    abrirEditar(
                                      servicio,
                                    )
                                  }
                                >
                                  <EditRoundedIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    abrirEliminar(
                                      servicio,
                                    )
                                  }
                                >
                                  <DeleteRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ),
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogFormulario}
        onClose={cerrarFormulario}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {servicioSeleccionado
            ? "Editar producto"
            : "Crear producto"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              required
              fullWidth
            />

            <TextField
              select
              label="Categoría"
              value={form.tipo_product}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  tipo_product:
                    event.target.value,
                }))
              }
              required
              fullWidth
            >
              {CATEGORIAS.map(
                (categoria) => (
                  <MenuItem
                    key={categoria.value}
                    value={categoria.value}
                  >
                    {categoria.label}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  descripcion:
                    event.target.value,
                }))
              }
              multiline
              minRows={4}
              fullWidth
            />

            <TextField
              label="Precio"
              type="number"
              value={form.precio}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  precio: event.target.value,
                }))
              }
              inputProps={{
                min: 0,
                step: "0.01",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    $
                  </InputAdornment>
                ),
              }}
              required
              fullWidth
            />

            <TextField
              label="Ruta de imagen"
              value={form.url_imagen}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  url_imagen:
                    event.target.value,
                }))
              }
              placeholder="/img/services/producto.png"
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={cerrarFormulario}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void guardarServicio()
            }
            disabled={saving}
          >
            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : servicioSeleccionado ? (
              "Guardar cambios"
            ) : (
              "Crear producto"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogDetalle}
        onClose={cerrarDetalle}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Detalle del producto
        </DialogTitle>

        <DialogContent>
          {servicioSeleccionado && (
            <Stack spacing={2} mt={1}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Nombre
                </Typography>

                <Typography fontWeight={700}>
                  {servicioSeleccionado.name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Categoría
                </Typography>

                <Box mt={0.5}>
                  <Chip
                    label={obtenerNombreCategoria(
                      servicioSeleccionado.tipo_product,
                    )}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Descripción
                </Typography>

                <Typography>
                  {servicioSeleccionado.descripcion ||
                    "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Precio
                </Typography>

                <Typography fontWeight={700}>
                  {formatearPrecio(
                    servicioSeleccionado.precio,
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Imagen
                </Typography>

                <Typography
                  sx={{
                    wordBreak: "break-all",
                  }}
                >
                  {servicioSeleccionado.url_imagen ||
                    "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Fecha de registro
                </Typography>

                <Typography>
                  {formatearFecha(
                    servicioSeleccionado.created_at,
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Última actualización
                </Typography>

                <Typography>
                  {formatearFecha(
                    servicioSeleccionado.updated_at,
                  )}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarDetalle}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogEliminar}
        onClose={cerrarEliminar}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Eliminar producto
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Deseas eliminar el producto{" "}
            <strong>
              {servicioSeleccionado?.name}
            </strong>
            ?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={cerrarEliminar}
            disabled={deleting}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() =>
              void eliminarServicio()
            }
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={cerrarNotificacion}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={cerrarNotificacion}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
