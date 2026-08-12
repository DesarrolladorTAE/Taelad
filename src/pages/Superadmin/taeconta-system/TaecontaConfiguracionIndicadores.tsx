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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import {
  createTaecontaSystemConfiguracionIndicador,
  deleteTaecontaSystemConfiguracionIndicador,
  getTaecontaSystemConfiguracionIndicadores,
  updateTaecontaSystemConfiguracionIndicador,
  type TaecontaSystemConfiguracionIndicador,
} from "../../../services/superadminService";

const DEFAULT_COLOR = "#1976d2";

function getErrorMessage(
  err: any,
  fallback: string,
): string {
  const validationErrors =
    err?.response?.data?.errors;

  const firstValidationError =
    validationErrors &&
    typeof validationErrors === "object"
      ? Object.values(validationErrors)
          .flat()
          .find(
            (value) =>
              typeof value === "string" &&
              value.trim() !== "",
          )
      : null;

  return typeof firstValidationError === "string"
    ? firstValidationError
    : err?.response?.data?.message ||
        err?.message ||
        fallback;
}

function normalizeColor(
  value: string,
): string {
  const color = value.trim();

  if (
    /^#[0-9a-fA-F]{6}$/.test(
      color,
    )
  ) {
    return color;
  }

  return DEFAULT_COLOR;
}

export default function TaecontaConfiguracionIndicadores() {
  const [
    indicadores,
    setIndicadores,
  ] = useState<
    TaecontaSystemConfiguracionIndicador[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [newName, setNewName] =
    useState("");

  const [newColor, setNewColor] =
    useState(DEFAULT_COLOR);

  const [editing, setEditing] =
    useState<TaecontaSystemConfiguracionIndicador | null>(
      null,
    );

  const [editName, setEditName] =
    useState("");

  const [editColor, setEditColor] =
    useState(DEFAULT_COLOR);

  const [deleteTarget, setDeleteTarget] =
    useState<TaecontaSystemConfiguracionIndicador | null>(
      null,
    );

  const cargar = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const response =
          await getTaecontaSystemConfiguracionIndicadores();

        setIndicadores(
          Array.isArray(
            response?.data,
          )
            ? response.data
            : [],
        );
      } catch (err: any) {
        console.error(
          "ERROR CONFIG INDICADORES TAECONTA:",
          err,
        );

        setError(
          getErrorMessage(
            err,
            "No fue posible consultar los indicadores.",
          ),
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(
    () => {
      const term =
        search
          .trim()
          .toLocaleLowerCase();

      if (!term) {
        return indicadores;
      }

      return indicadores.filter(
        (item) =>
          item.nombre
            .toLocaleLowerCase()
            .includes(term) ||
          String(item.id).includes(
            term,
          ),
      );
    },
    [indicadores, search],
  );

  const crear = async () => {
    const nombre =
      newName.trim();

    if (!nombre) {
      setError(
        "Escribe el nombre del indicador.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await createTaecontaSystemConfiguracionIndicador({
          nombre,
          color:
            normalizeColor(
              newColor,
            ),
        });

      if (
        response?.success !== true
      ) {
        throw new Error(
          response?.message ||
            "No fue posible crear el indicador.",
        );
      }

      setNewName("");
      setNewColor(DEFAULT_COLOR);

      setSuccess(
        response?.message ||
          "Indicador creado correctamente.",
      );

      await cargar(false);
    } catch (err: any) {
      console.error(
        "ERROR CREANDO INDICADOR:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "No fue posible crear el indicador.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const abrirEditar = (
    item: TaecontaSystemConfiguracionIndicador,
  ) => {
    setEditing(item);
    setEditName(item.nombre);
    setEditColor(
      normalizeColor(
        item.color,
      ),
    );
    setError("");
  };

  const actualizar = async () => {
    if (!editing) {
      return;
    }

    const nombre =
      editName.trim();

    if (!nombre) {
      setError(
        "El nombre del indicador es obligatorio.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await updateTaecontaSystemConfiguracionIndicador(
          editing.id,
          {
            nombre,
            color:
              normalizeColor(
                editColor,
              ),
          },
        );

      if (
        response?.success !== true
      ) {
        throw new Error(
          response?.message ||
            "No fue posible actualizar el indicador.",
        );
      }

      setEditing(null);

      setSuccess(
        response?.message ||
          "Indicador actualizado correctamente.",
      );

      await cargar(false);
    } catch (err: any) {
      console.error(
        "ERROR ACTUALIZANDO INDICADOR:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "No fue posible actualizar el indicador.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async () => {
    if (!deleteTarget) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await deleteTaecontaSystemConfiguracionIndicador(
          deleteTarget.id,
        );

      if (
        response?.success !== true
      ) {
        throw new Error(
          response?.message ||
            "No fue posible eliminar el indicador.",
        );
      }

      setDeleteTarget(null);

      setSuccess(
        response?.message ||
          "Indicador eliminado correctamente.",
      );

      await cargar(false);
    } catch (err: any) {
      console.error(
        "ERROR ELIMINANDO INDICADOR:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "No fue posible eliminar el indicador.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <FlagOutlinedIcon />

              <Typography
                variant="h6"
                fontWeight={900}
              >
                Indicadores
              </Typography>
            </Stack>

            <Typography
              color="text.secondary"
              fontSize={14}
              sx={{ mt: 0.5 }}
            >
              Gestiona las etiquetas visuales de clasificación de
              TAECONTA.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={
              loading ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <RefreshOutlinedIcon />
              )
            }
            disabled={loading}
            onClick={() =>
              void cargar()
            }
          >
            Actualizar
          </Button>
        </Stack>

        {success ? (
          <Alert
            severity="success"
            onClose={() =>
              setSuccess("")
            }
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        ) : null}

        {error ? (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "320px minmax(0, 1fr)",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Typography
                fontWeight={900}
              >
                Nuevo indicador
              </Typography>

              <TextField
                label="Nombre"
                value={newName}
                onChange={(event) =>
                  setNewName(
                    event.target.value,
                  )
                }
                inputProps={{
                  maxLength: 255,
                }}
                disabled={saving}
                fullWidth
              />

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Box
                  component="input"
                  type="color"
                  value={
                    normalizeColor(
                      newColor,
                    )
                  }
                  onChange={(event) =>
                    setNewColor(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  sx={{
                    width: 46,
                    height: 40,
                    p: 0.25,
                    border: "1px solid",
                    borderColor:
                      "divider",
                    borderRadius: 1,
                    bgcolor:
                      "background.paper",
                    cursor: "pointer",
                  }}
                />

                <TextField
                  label="Color"
                  value={newColor}
                  onChange={(event) =>
                    setNewColor(
                      event.target.value,
                    )
                  }
                  inputProps={{
                    maxLength: 7,
                  }}
                  disabled={saving}
                  fullWidth
                />
              </Stack>

              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <AddOutlinedIcon />
                  )
                }
                onClick={() =>
                  void crear()
                }
                disabled={
                  saving ||
                  !newName.trim()
                }
              >
                Guardar indicador
              </Button>
            </Stack>
          </Paper>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
              spacing={1.5}
              sx={{ mb: 1.5 }}
            >
              <Box>
                <Typography
                  fontWeight={900}
                >
                  Indicadores registrados
                </Typography>

                <Typography
                  color="text.secondary"
                  fontSize={12}
                >
                  {filtered.length} de {indicadores.length} registros
                </Typography>
              </Box>

              <TextField
                size="small"
                placeholder="Buscar indicadores..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: {
                    xs: "100%",
                    sm: 280,
                  },
                }}
              />
            </Stack>

            {loading ? (
              <Box
                minHeight={220}
                display="grid"
                sx={{
                  placeItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : filtered.length ===
              0 ? (
              <Alert severity="info">
                No hay indicadores que coincidan con la búsqueda.
              </Alert>
            ) : (
              <Stack spacing={1}>
                {filtered.map(
                  (item) => (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 1.25,
                        border:
                          "1px solid",
                        borderColor:
                          "divider",
                        borderRadius: 1.5,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius:
                              "50%",
                            flexShrink: 0,
                            bgcolor:
                              item.color ||
                              "action.disabled",
                            border:
                              "1px solid",
                            borderColor:
                              "divider",
                          }}
                        />

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Typography
                            fontWeight={800}
                            fontSize={13}
                            sx={{
                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {item.nombre}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            ID: {item.id} · {item.color}
                          </Typography>
                        </Box>

                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() =>
                              abrirEditar(
                                item,
                              )
                            }
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteTarget(
                                item,
                              )
                            }
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  ),
                )}
              </Stack>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={Boolean(editing)}
        onClose={() => {
          if (!saving) {
            setEditing(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Editar indicador
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ pt: 1 }}
          >
            <TextField
              label="Nombre"
              value={editName}
              onChange={(event) =>
                setEditName(
                  event.target.value,
                )
              }
              inputProps={{
                maxLength: 255,
              }}
              disabled={saving}
              fullWidth
            />

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Box
                component="input"
                type="color"
                value={
                  normalizeColor(
                    editColor,
                  )
                }
                onChange={(event) =>
                  setEditColor(
                    event.target.value,
                  )
                }
                disabled={saving}
                sx={{
                  width: 46,
                  height: 40,
                  p: 0.25,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: 1,
                  bgcolor:
                    "background.paper",
                }}
              />

              <TextField
                label="Color"
                value={editColor}
                onChange={(event) =>
                  setEditColor(
                    event.target.value,
                  )
                }
                inputProps={{
                  maxLength: 7,
                }}
                disabled={saving}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setEditing(null)
            }
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            onClick={() =>
              void actualizar()
            }
            disabled={
              saving ||
              !editName.trim()
            }
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!saving) {
            setDeleteTarget(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Eliminar indicador
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.5}>
            <Typography>
              Se eliminará el indicador{" "}
              <strong>
                {deleteTarget?.nombre}
              </strong>
              .
            </Typography>

            <Alert severity="warning">
              TAECONTA también retirará este indicador de las cuentas
              que actualmente lo tengan asignado.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteTarget(null)
            }
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              saving ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <DeleteOutlineOutlinedIcon />
              )
            }
            onClick={() =>
              void eliminar()
            }
            disabled={saving}
          >
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}