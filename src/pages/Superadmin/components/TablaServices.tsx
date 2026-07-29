import {
  type ChangeEvent,
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
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import {
  createSuperAdminService,
  createSuperAdminServiceCategory,
  deleteSuperAdminService,
  deleteSuperAdminServiceCategory,
  getSuperAdminServiceCategories,
  getSuperAdminServiceCategoryDeletePreview,
  getSuperAdminServices,
  updateSuperAdminService,
  updateSuperAdminServiceCategory,
  type SuperAdminService,
  type SuperAdminServiceCategory,
  type SuperAdminServiceCategoryDeletePreview,
} from "../../../services/superadminService";

type Props = {
  volver: () => void;
};

type ServiceForm = {
  name: string;
  descripcion: string;
  categoria_id: string;
  precio: string;
  clave_producto: string;
  clave_unidad: string;
  url_imagen: string;
};

type NotificationState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

type PaginationState = {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number | null;
  to: number | null;
};

type ProductImageProps = {
  src: string | null;
  alt: string;
  size?: number;
};

type UnknownRecord = Record<string, unknown>;

const PRODUCTOS_POR_PAGINA = 16;
const NUEVA_CATEGORIA_VALUE = "__nueva_categoria__";
const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

const TIPOS_IMAGEN_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const FORM_INICIAL: ServiceForm = {
  name: "",
  descripcion: "",
  categoria_id: "",
  precio: "",
  clave_producto: "",
  clave_unidad: "",
  url_imagen: "",
};

const PAGINACION_INICIAL: PaginationState = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
  from: null,
  to: null,
};

function esObjeto(
  valor: unknown,
): valor is UnknownRecord {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function ProductImage({
  src,
  alt,
  size = 56,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <Box
        sx={(theme) => ({
          width: size,
          height: size,
          minWidth: size,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.action.hover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <ImageNotSupportedRoundedIcon
          color="disabled"
          fontSize="small"
        />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      sx={(theme) => ({
        width: size,
        height: size,
        minWidth: size,
        objectFit: "cover",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.background.default,
      })}
    />
  );
}

function obtenerServiciosPaginados(
  response: unknown,
): {
  servicios: SuperAdminService[];
  paginacion: PaginationState;
} {
  const root = esObjeto(response)
    ? response
    : null;

  const paginator =
    root && esObjeto(root.data)
      ? root.data
      : null;

  const data =
    paginator &&
    Array.isArray(paginator.data)
      ? paginator.data
      : [];

  const servicios =
    data as SuperAdminService[];

  return {
    servicios,
    paginacion: {
      currentPage: Number(
        paginator?.current_page ?? 1,
      ),
      lastPage: Math.max(
        1,
        Number(
          paginator?.last_page ?? 1,
        ),
      ),
      total: Number(
        paginator?.total ??
          servicios.length,
      ),
      from:
        paginator?.from === null ||
        paginator?.from === undefined
          ? null
          : Number(paginator.from),
      to:
        paginator?.to === null ||
        paginator?.to === undefined
          ? null
          : Number(paginator.to),
    },
  };
}

function obtenerCategoriasRespuesta(
  response: unknown,
): SuperAdminServiceCategory[] {
  const root = esObjeto(response)
    ? response
    : null;

  const listado =
    root && Array.isArray(root.data)
      ? root.data
      : Array.isArray(response)
        ? response
        : [];

  const categorias =
    listado.filter(
      (
        categoria: unknown,
      ): categoria is SuperAdminServiceCategory => {
        if (!esObjeto(categoria)) {
          return false;
        }

        return (
          typeof categoria.id ===
            "number" &&
          typeof categoria.nombre ===
            "string" &&
          typeof categoria.slug ===
            "string"
        );
      },
    );

  return categorias
    .map(
      (
        categoria: SuperAdminServiceCategory,
      ): SuperAdminServiceCategory => ({
        ...categoria,
        productos_count: Number(
          categoria.productos_count ?? 0,
        ),
      }),
    )
    .sort(
      (
        a: SuperAdminServiceCategory,
        b: SuperAdminServiceCategory,
      ) =>
        a.nombre.localeCompare(
          b.nombre,
          "es",
        ),
    );
}

function obtenerCategoriaRespuesta(
  response: unknown,
): SuperAdminServiceCategory | null {
  if (!esObjeto(response)) {
    return null;
  }

  const categoria = response.data;

  if (!esObjeto(categoria)) {
    return null;
  }

  if (
    typeof categoria.id !== "number" ||
    typeof categoria.nombre !==
      "string" ||
    typeof categoria.slug !== "string"
  ) {
    return null;
  }

  return {
    id: categoria.id,
    nombre: categoria.nombre,
    slug: categoria.slug,
    productos_count: Number(
      categoria.productos_count ?? 0,
    ),
    created_at:
      typeof categoria.created_at ===
        "string"
        ? categoria.created_at
        : null,
    updated_at:
      typeof categoria.updated_at ===
        "string"
        ? categoria.updated_at
        : null,
  };
}

function obtenerNombreCategoria(
  servicio: SuperAdminService,
): string {
  return (
    servicio.categoria?.nombre ||
    "Sin categoría"
  );
}

function formatearPrecio(
  precio: number | string,
): string {
  const valor = Number(precio);

  if (!Number.isFinite(valor)) {
    return "$0.00";
  }

  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
    },
  ).format(valor);
}

function formatearFecha(
  fecha: string | null,
): string {
  if (!fecha) {
    return "-";
  }

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function obtenerMensajeError(
  error: unknown,
  mensajeDefault: string,
): string {
  if (!esObjeto(error)) {
    return mensajeDefault;
  }

  const response = esObjeto(
    error.response,
  )
    ? error.response
    : null;

  const data =
    response && esObjeto(response.data)
      ? response.data
      : null;

  const validationErrors =
    data && esObjeto(data.errors)
      ? data.errors
      : null;

  if (validationErrors) {
    const primerError = Object.values(
      validationErrors,
    ).find((value) =>
      Array.isArray(value),
    );

    if (
      Array.isArray(primerError) &&
      typeof primerError[0] ===
        "string"
    ) {
      return primerError[0];
    }
  }

  if (
    data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  if (
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return mensajeDefault;
}

function urlImagenValida(
  url: string,
): boolean {
  if (!url) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function servicioCoincideFiltros(
  servicio: SuperAdminService,
  busqueda: string,
  categoriaFiltro: string,
): boolean {
  if (
    categoriaFiltro !== "todos" &&
    String(servicio.categoria_id) !== categoriaFiltro
  ) {
    return false;
  }

  const termino = busqueda
    .trim()
    .toLocaleLowerCase("es-MX");

  if (!termino) {
    return true;
  }

  return [
    servicio.name,
    servicio.descripcion,
    servicio.clave_producto,
    servicio.clave_unidad,
    servicio.categoria?.nombre,
    servicio.categoria?.slug,
  ].some((valor) =>
    String(valor ?? "")
      .toLocaleLowerCase("es-MX")
      .includes(termino),
  );
}

export default function TablaServices({
  volver,
}: Props) {
  const [servicios, setServicios] =
    useState<SuperAdminService[]>([]);

  const [categorias, setCategorias] =
    useState<
      SuperAdminServiceCategory[]
    >([]);

  const [pagina, setPagina] =
    useState(1);

  const [paginacion, setPaginacion] =
    useState<PaginationState>(
      PAGINACION_INICIAL,
    );

  const [loading, setLoading] =
    useState(true);

  const [
    loadingCategorias,
    setLoadingCategorias,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    savingCategoria,
    setSavingCategoria,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    deletingCategoria,
    setDeletingCategoria,
  ] = useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    busquedaAplicada,
    setBusquedaAplicada,
  ] = useState("");

  const [
    categoriaFiltro,
    setCategoriaFiltro,
  ] = useState("todos");

  const [form, setForm] =
    useState<ServiceForm>(
      FORM_INICIAL,
    );

  const [
    archivoImagen,
    setArchivoImagen,
  ] = useState<File | null>(null);

  const [
    vistaPreviaImagen,
    setVistaPreviaImagen,
  ] = useState("");

  const [
    errorVistaPrevia,
    setErrorVistaPrevia,
  ] = useState(false);

  const [
    servicioSeleccionado,
    setServicioSeleccionado,
  ] = useState<SuperAdminService | null>(
    null,
  );

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] =
    useState<SuperAdminServiceCategory | null>(
      null,
    );

  const [
    categoriaParaEliminar,
    setCategoriaParaEliminar,
  ] =
    useState<SuperAdminServiceCategory | null>(
      null,
    );

  const [
    vistaEliminacionCategoria,
    setVistaEliminacionCategoria,
  ] =
    useState<SuperAdminServiceCategoryDeletePreview | null>(
      null,
    );

  const [
    loadingVistaEliminacionCategoria,
    setLoadingVistaEliminacionCategoria,
  ] = useState(false);

  const [
    categoriaNombre,
    setCategoriaNombre,
  ] = useState("");

  const [
    seleccionarCategoriaTrasCrear,
    setSeleccionarCategoriaTrasCrear,
  ] = useState(false);

  const [
    dialogFormulario,
    setDialogFormulario,
  ] = useState(false);

  const [
    dialogDetalle,
    setDialogDetalle,
  ] = useState(false);

  const [
    dialogEliminar,
    setDialogEliminar,
  ] = useState(false);

  const [
    dialogCategorias,
    setDialogCategorias,
  ] = useState(false);

  const [
    dialogCategoriaFormulario,
    setDialogCategoriaFormulario,
  ] = useState(false);

  const [
    dialogEliminarCategoria,
    setDialogEliminarCategoria,
  ] = useState(false);

  const [
    notification,
    setNotification,
  ] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });

  const categoriasOrdenadas =
    useMemo(
      () =>
        [...categorias].sort(
          (
            a: SuperAdminServiceCategory,
            b: SuperAdminServiceCategory,
          ) =>
            a.nombre.localeCompare(
              b.nombre,
              "es",
            ),
        ),
      [categorias],
    );

  const mostrarNotificacion =
    useCallback(
      (
        message: string,
        severity:
          | "success"
          | "error",
      ) => {
        setNotification({
          open: true,
          message,
          severity,
        });
      },
      [],
    );

  const cargarCategorias =
    useCallback(async () => {
      setLoadingCategorias(true);

      try {
        const response =
          await getSuperAdminServiceCategories();

        setCategorias(
          obtenerCategoriasRespuesta(
            response,
          ),
        );
      } catch (error: unknown) {
        console.error(
          "Error cargando categorías:",
          error,
        );

        mostrarNotificacion(
          obtenerMensajeError(
            error,
            "No fue posible cargar las categorías.",
          ),
          "error",
        );
      } finally {
        setLoadingCategorias(false);
      }
    }, [mostrarNotificacion]);

  const cargarServicios =
    useCallback(async () => {
      setLoading(true);

      try {
        const response =
          await getSuperAdminServices({
            page: pagina,
            perPage:
              PRODUCTOS_POR_PAGINA,
            search:
              busquedaAplicada ||
              undefined,
            categoriaId:
              categoriaFiltro !==
              "todos"
                ? categoriaFiltro
                : undefined,
          });

        const resultado =
          obtenerServiciosPaginados(
            response,
          );

        setServicios(
          resultado.servicios,
        );

        setPaginacion(
          resultado.paginacion,
        );

        if (
          resultado.paginacion
            .currentPage !== pagina
        ) {
          setPagina(
            resultado.paginacion
              .currentPage,
          );
        }
      } catch (error: unknown) {
        console.error(
          "Error cargando productos:",
          error,
        );

        mostrarNotificacion(
          obtenerMensajeError(
            error,
            "No fue posible cargar los productos.",
          ),
          "error",
        );
      } finally {
        setLoading(false);
      }
    }, [
      pagina,
      busquedaAplicada,
      categoriaFiltro,
      mostrarNotificacion,
    ]);

  useEffect(() => {
    void cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    void cargarServicios();
  }, [cargarServicios]);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setPagina(1);
        setBusquedaAplicada(
          busqueda.trim(),
        );
      }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [busqueda]);

  useEffect(() => {
    if (!archivoImagen) {
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        archivoImagen,
      );

    setVistaPreviaImagen(objectUrl);
    setErrorVistaPrevia(false);

    return () => {
      URL.revokeObjectURL(
        objectUrl,
      );
    };
  }, [archivoImagen]);

  useEffect(() => {
    if (
      categoriaFiltro !== "todos" &&
      !categorias.some(
        (
          categoria: SuperAdminServiceCategory,
        ) =>
          String(categoria.id) ===
          categoriaFiltro,
      )
    ) {
      setCategoriaFiltro("todos");
      setPagina(1);
    }
  }, [
    categoriaFiltro,
    categorias,
  ]);

  const cerrarNotificacion = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const limpiarImagenFormulario =
    () => {
      setArchivoImagen(null);
      setVistaPreviaImagen("");
      setErrorVistaPrevia(false);
    };

  const resetCategoriaFormulario =
    () => {
      setCategoriaSeleccionada(null);
      setCategoriaNombre("");
      setSeleccionarCategoriaTrasCrear(
        false,
      );
    };

  const abrirCrear = () => {
    if (
      categoriasOrdenadas.length === 0
    ) {
      mostrarNotificacion(
        "Primero debes crear una categoría.",
        "error",
      );

      setDialogCategorias(true);
      return;
    }

    setServicioSeleccionado(null);

    setForm({
      ...FORM_INICIAL,
      categoria_id: String(
        categoriasOrdenadas[0].id,
      ),
    });

    limpiarImagenFormulario();
    setDialogFormulario(true);
  };

  const abrirEditar = (
    servicio: SuperAdminService,
  ) => {
    setServicioSeleccionado(servicio);

    setForm({
      name: servicio.name || "",
      descripcion: servicio.descripcion || "",
      categoria_id:
        servicio.categoria_id !== null
          ? String(servicio.categoria_id)
          : "",
      precio: String(servicio.precio ?? ""),
      clave_producto:
        servicio.clave_producto || "",
      clave_unidad:
        servicio.clave_unidad || "",
      url_imagen:
        servicio.url_imagen || "",
    });

    setArchivoImagen(null);
    setVistaPreviaImagen(
      servicio.url_imagen || "",
    );
    setErrorVistaPrevia(false);
    setDialogFormulario(true);
  };

  const abrirDetalle = (
    servicio: SuperAdminService,
  ) => {
    setServicioSeleccionado(
      servicio,
    );

    setDialogDetalle(true);
  };

  const abrirEliminar = (
    servicio: SuperAdminService,
  ) => {
    setServicioSeleccionado(
      servicio,
    );

    setDialogEliminar(true);
  };

  const cerrarFormulario = () => {
    if (saving) {
      return;
    }

    setDialogFormulario(false);
    setServicioSeleccionado(null);
    setForm(FORM_INICIAL);
    limpiarImagenFormulario();
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

  const abrirCrearCategoria = (
    seleccionarAlCrear = false,
  ) => {
    resetCategoriaFormulario();

    setSeleccionarCategoriaTrasCrear(
      seleccionarAlCrear,
    );

    setDialogCategoriaFormulario(
      true,
    );
  };

  const abrirEditarCategoria = (
    categoria: SuperAdminServiceCategory,
  ) => {
    setCategoriaSeleccionada(
      categoria,
    );

    setCategoriaNombre(
      categoria.nombre,
    );

    setSeleccionarCategoriaTrasCrear(
      false,
    );

    setDialogCategoriaFormulario(
      true,
    );
  };

  const cerrarFormularioCategoria =
    () => {
      if (savingCategoria) {
        return;
      }

      setDialogCategoriaFormulario(
        false,
      );

      resetCategoriaFormulario();
    };

  const abrirEliminarCategoria =
    async (
      categoria: SuperAdminServiceCategory,
    ) => {
      setCategoriaParaEliminar(
        categoria,
      );

      setVistaEliminacionCategoria(
        null,
      );

      setDialogEliminarCategoria(
        true,
      );

      setLoadingVistaEliminacionCategoria(
        true,
      );

      try {
        const response =
          await getSuperAdminServiceCategoryDeletePreview(
            categoria.id,
          );

        setVistaEliminacionCategoria(
          response.data,
        );
      } catch (error: unknown) {
        console.error(
          "Error cargando relaciones de la categoría:",
          error,
        );

        setDialogEliminarCategoria(
          false,
        );

        setCategoriaParaEliminar(
          null,
        );

        mostrarNotificacion(
          obtenerMensajeError(
            error,
            "No fue posible consultar los productos asociados.",
          ),
          "error",
        );
      } finally {
        setLoadingVistaEliminacionCategoria(
          false,
        );
      }
    };

  const cerrarEliminarCategoria =
    () => {
      if (
        deletingCategoria ||
        loadingVistaEliminacionCategoria
      ) {
        return;
      }

      setDialogEliminarCategoria(
        false,
      );

      setCategoriaParaEliminar(null);

      setVistaEliminacionCategoria(
        null,
      );
    };

  const seleccionarCategoriaProducto =
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const valor =
        event.target.value;

      if (
        valor ===
        NUEVA_CATEGORIA_VALUE
      ) {
        abrirCrearCategoria(true);
        return;
      }

      setForm((prev) => ({
        ...prev,
        categoria_id: valor,
      }));
    };

  const seleccionarImagen = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const archivo =
      event.target.files?.[0] ||
      null;

    event.target.value = "";

    if (!archivo) {
      return;
    }

    if (
      !TIPOS_IMAGEN_PERMITIDOS.includes(
        archivo.type,
      )
    ) {
      mostrarNotificacion(
        "La imagen debe ser JPG, PNG o WEBP.",
        "error",
      );
      return;
    }

    if (
      archivo.size >
      TAMANO_MAXIMO_IMAGEN
    ) {
      mostrarNotificacion(
        "La imagen no debe superar los 2 MB.",
        "error",
      );
      return;
    }

    setArchivoImagen(archivo);

    setForm((prev) => ({
      ...prev,
      url_imagen: "",
    }));

    setErrorVistaPrevia(false);
  };

  const cambiarUrlImagen = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nuevaUrl =
      event.target.value;

    setArchivoImagen(null);

    setForm((prev) => ({
      ...prev,
      url_imagen: nuevaUrl,
    }));

    setVistaPreviaImagen(
      nuevaUrl.trim(),
    );

    setErrorVistaPrevia(false);
  };

  const guardarCategoria =
    async () => {
      const nombre =
        categoriaNombre.trim();

      if (!nombre) {
        mostrarNotificacion(
          "El nombre de la categoría es obligatorio.",
          "error",
        );
        return;
      }

      if (nombre.length > 100) {
        mostrarNotificacion(
          "La categoría no debe superar los 100 caracteres.",
          "error",
        );
        return;
      }

      setSavingCategoria(true);

      try {
        let response: unknown;

        if (
          categoriaSeleccionada
        ) {
          response =
            await updateSuperAdminServiceCategory(
              categoriaSeleccionada.id,
              {
                nombre,
              },
            );
        } else {
          response =
            await createSuperAdminServiceCategory(
              {
                nombre,
              },
            );
        }

        const categoriaGuardada =
          obtenerCategoriaRespuesta(
            response,
          );

        if (
          seleccionarCategoriaTrasCrear &&
          categoriaGuardada
        ) {
          setForm((prev) => ({
            ...prev,
            categoria_id: String(
              categoriaGuardada.id,
            ),
          }));
        }

        mostrarNotificacion(
          categoriaSeleccionada
            ? "Categoría actualizada correctamente."
            : "Categoría creada correctamente.",
          "success",
        );

        setDialogCategoriaFormulario(
          false,
        );

        resetCategoriaFormulario();

        await cargarCategorias();
        await cargarServicios();
      } catch (error: unknown) {
        console.error(
          "Error guardando categoría:",
          error,
        );

        mostrarNotificacion(
          obtenerMensajeError(
            error,
            "No fue posible guardar la categoría.",
          ),
          "error",
        );
      } finally {
        setSavingCategoria(false);
      }
    };

  const eliminarCategoria =
    async () => {
      if (!categoriaParaEliminar) {
        return;
      }

      setDeletingCategoria(true);

      try {
        await deleteSuperAdminServiceCategory(
          categoriaParaEliminar.id,
        );

        const categoriaId =
          String(
            categoriaParaEliminar.id,
          );

        if (
          categoriaFiltro ===
          categoriaId
        ) {
          setCategoriaFiltro(
            "todos",
          );
          setPagina(1);
        }

        if (
          form.categoria_id ===
          categoriaId
        ) {
          setForm((prev) => ({
            ...prev,
            categoria_id: "",
          }));
        }

        setDialogEliminarCategoria(
          false,
        );

        setCategoriaParaEliminar(
          null,
        );

        setVistaEliminacionCategoria(
          null,
        );

        mostrarNotificacion(
          "Categoría eliminada correctamente. Los productos asociados quedaron sin categoría.",
          "success",
        );

        await cargarCategorias();
        await cargarServicios();
      } catch (error: unknown) {
        console.error(
          "Error eliminando categoría:",
          error,
        );

        mostrarNotificacion(
          obtenerMensajeError(
            error,
            "No fue posible eliminar la categoría.",
          ),
          "error",
        );
      } finally {
        setDeletingCategoria(false);
      }
    };

  const guardarServicio = async () => {
    const nombre = form.name.trim();
    const descripcion = form.descripcion.trim();
    const categoriaId = Number(form.categoria_id);
    const precio = Number(form.precio);
    const claveProducto = form.clave_producto.trim();
    const claveUnidad = form.clave_unidad.trim().toUpperCase();
    const urlImagen = form.url_imagen.trim();

    if (!nombre) {
      mostrarNotificacion(
        "El nombre es obligatorio.",
        "error",
      );
      return;
    }

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId <= 0
    ) {
      mostrarNotificacion(
        "La categoría es obligatoria.",
        "error",
      );
      return;
    }

    if (
      !categoriasOrdenadas.some(
        (categoria) =>
          categoria.id === categoriaId,
      )
    ) {
      mostrarNotificacion(
        "La categoría seleccionada no es válida.",
        "error",
      );
      return;
    }

    if (
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      mostrarNotificacion(
        "Ingresa un precio válido.",
        "error",
      );
      return;
    }

    if (claveProducto.length > 8) {
      mostrarNotificacion(
        "La clave de producto no debe superar los 8 caracteres.",
        "error",
      );
      return;
    }

    if (claveUnidad.length > 3) {
      mostrarNotificacion(
        "La clave de unidad no debe superar los 3 caracteres.",
        "error",
      );
      return;
    }

    if (
      !archivoImagen &&
      urlImagen &&
      !urlImagenValida(urlImagen)
    ) {
      mostrarNotificacion(
        "Ingresa una URL de imagen válida.",
        "error",
      );
      return;
    }

    const payload = new FormData();

    payload.append("name", nombre);
    payload.append("descripcion", descripcion);
    payload.append(
      "categoria_id",
      String(categoriaId),
    );
    payload.append("precio", String(precio));
    payload.append(
      "clave_producto",
      claveProducto,
    );
    payload.append(
      "clave_unidad",
      claveUnidad,
    );

    if (archivoImagen) {
      payload.append("imagen", archivoImagen);
    } else {
      payload.append(
        "url_imagen",
        urlImagen,
      );
    }

    const servicioAnterior =
      servicioSeleccionado;
    const editando =
      Boolean(servicioAnterior);

    setSaving(true);

    try {
      if (servicioAnterior) {
        const response =
          await updateSuperAdminService(
            servicioAnterior.id,
            payload,
          );

        const servicioActualizado =
          response.data;

        const sigueVisible =
          servicioCoincideFiltros(
            servicioActualizado,
            busquedaAplicada,
            categoriaFiltro,
          );

        setServicios((actuales) =>
          sigueVisible
            ? actuales.map((servicio) =>
                servicio.id ===
                servicioActualizado.id
                  ? servicioActualizado
                  : servicio,
              )
            : actuales.filter(
                (servicio) =>
                  servicio.id !==
                  servicioActualizado.id,
              ),
        );

        if (!sigueVisible) {
          setPaginacion((actual) => {
            const total = Math.max(
              0,
              actual.total - 1,
            );
            const cantidadVisible =
              Math.max(
                0,
                servicios.length - 1,
              );

            return {
              ...actual,
              total,
              lastPage: Math.max(
                1,
                Math.ceil(
                  total /
                    PRODUCTOS_POR_PAGINA,
                ),
              ),
              from:
                cantidadVisible > 0
                  ? actual.from
                  : null,
              to:
                cantidadVisible > 0
                  ? (actual.from ?? 1) +
                    cantidadVisible -
                    1
                  : null,
            };
          });
        }

        if (
          servicioAnterior.categoria_id !==
          servicioActualizado.categoria_id
        ) {
          setCategorias((actuales) =>
            actuales.map((categoria) => {
              if (
                categoria.id ===
                servicioAnterior.categoria_id
              ) {
                return {
                  ...categoria,
                  productos_count:
                    Math.max(
                      0,
                      categoria.productos_count -
                        1,
                    ),
                };
              }

              if (
                categoria.id ===
                servicioActualizado.categoria_id
              ) {
                return {
                  ...categoria,
                  productos_count:
                    categoria.productos_count +
                    1,
                };
              }

              return categoria;
            }),
          );
        }
      } else {
        const response =
          await createSuperAdminService(
            payload,
          );

        const servicioCreado =
          response.data;

        setCategorias((actuales) =>
          actuales.map((categoria) =>
            categoria.id ===
            servicioCreado.categoria_id
              ? {
                  ...categoria,
                  productos_count:
                    categoria.productos_count +
                    1,
                }
              : categoria,
          ),
        );

        const debeMostrarse =
          servicioCoincideFiltros(
            servicioCreado,
            busquedaAplicada,
            categoriaFiltro,
          );

        if (
          debeMostrarse &&
          pagina === 1
        ) {
          setServicios((actuales) =>
            [
              servicioCreado,
              ...actuales,
            ].slice(
              0,
              PRODUCTOS_POR_PAGINA,
            ),
          );

          setPaginacion((actual) => {
            const total =
              actual.total + 1;

            return {
              ...actual,
              total,
              currentPage: 1,
              lastPage: Math.max(
                1,
                Math.ceil(
                  total /
                    PRODUCTOS_POR_PAGINA,
                ),
              ),
              from: 1,
              to: Math.min(
                PRODUCTOS_POR_PAGINA,
                total,
              ),
            };
          });
        } else if (
          debeMostrarse &&
          pagina !== 1
        ) {
          setPagina(1);
        }
      }

      setDialogFormulario(false);
      setServicioSeleccionado(null);
      setForm(FORM_INICIAL);
      limpiarImagenFormulario();

      mostrarNotificacion(
        editando
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
        "success",
      );
    } catch (error: unknown) {
      console.error(
        "Error guardando producto:",
        error,
      );

      mostrarNotificacion(
        obtenerMensajeError(
          error,
          "No fue posible guardar el producto.",
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

    const productoEliminado =
      servicioSeleccionado;

    setDeleting(true);

    try {
      await deleteSuperAdminService(
        productoEliminado.id,
      );

      setCategorias((actuales) =>
        actuales.map((categoria) =>
          categoria.id ===
          productoEliminado.categoria_id
            ? {
                ...categoria,
                productos_count:
                  Math.max(
                    0,
                    categoria.productos_count -
                      1,
                  ),
              }
            : categoria,
        ),
      );

      if (
        servicios.length === 1 &&
        pagina > 1
      ) {
        setPagina((actual) =>
          Math.max(1, actual - 1),
        );
      } else {
        setServicios((actuales) =>
          actuales.filter(
            (servicio) =>
              servicio.id !==
              productoEliminado.id,
          ),
        );

        setPaginacion((actual) => {
          const total = Math.max(
            0,
            actual.total - 1,
          );
          const cantidadVisible =
            Math.max(
              0,
              servicios.length - 1,
            );

          return {
            ...actual,
            total,
            lastPage: Math.max(
              1,
              Math.ceil(
                total /
                  PRODUCTOS_POR_PAGINA,
              ),
            ),
            from:
              cantidadVisible > 0
                ? actual.from
                : null,
            to:
              cantidadVisible > 0
                ? (actual.from ?? 1) +
                  cantidadVisible -
                  1
                : null,
          };
        });
      }

      setDialogEliminar(false);
      setServicioSeleccionado(null);

      mostrarNotificacion(
        "Producto eliminado correctamente.",
        "success",
      );
    } catch (error: unknown) {
      console.error(
        "Error eliminando producto:",
        error,
      );

      mostrarNotificacion(
        obtenerMensajeError(
          error,
          "No fue posible eliminar el producto.",
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
              Administración de productos y categorías.
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          width={{
            xs: "100%",
            md: "auto",
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <CategoryRoundedIcon />
            }
            onClick={() =>
              setDialogCategorias(
                true,
              )
            }
          >
            Administrar categorías
          </Button>

          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={abrirCrear}
          >
            Crear producto
          </Button>
        </Stack>
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
                setBusqueda(
                  event.target.value,
                )
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
              onChange={(event) => {
                setCategoriaFiltro(
                  event.target.value,
                );

                setPagina(1);
              }}
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 280,
                },
              }}
            >
              <MenuItem value="todos">
                Todas las categorías
              </MenuItem>

              {categoriasOrdenadas.map(
                (
                  categoria: SuperAdminServiceCategory,
                ) => (
                  <MenuItem
                    key={categoria.id}
                    value={String(
                      categoria.id,
                    )}
                  >
                    {categoria.nombre}
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
            <>
              <Box
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <Table
                  sx={{
                    width: "100%",
                    tableLayout: "fixed",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell width="48%">
                        Producto
                      </TableCell>

                      <TableCell width="20%">
                        Categoría
                      </TableCell>

                      <TableCell
                        width="14%"
                        align="right"
                      >
                        Precio
                      </TableCell>

                      <TableCell
                        width="18%"
                        align="center"
                      >
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {servicios.length ===
                    0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 5 }}
                        >
                          Sin productos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      servicios.map(
                        (
                          servicio: SuperAdminService,
                        ) => (
                          <TableRow
                            hover
                            key={
                              servicio.id
                            }
                          >
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                minWidth={0}
                              >
                                <ProductImage
                                  src={
                                    servicio.url_imagen
                                  }
                                  alt={
                                    servicio.name
                                  }
                                />

                                <Box minWidth={0}>
                                  <Typography
                                    fontWeight={700}
                                    noWrap
                                  >
                                    {servicio.name ||
                                      "-"}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      overflow:
                                        "hidden",
                                      textOverflow:
                                        "ellipsis",
                                      display:
                                        "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient:
                                        "vertical",
                                    }}
                                  >
                                    {servicio.descripcion ||
                                      "Sin descripción"}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={obtenerNombreCategoria(
                                  servicio,
                                )}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  maxWidth:
                                    "100%",
                                  "& .MuiChip-label":
                                    {
                                      overflow:
                                        "hidden",
                                      textOverflow:
                                        "ellipsis",
                                    },
                                }}
                              />
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

                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={0.25}
                                justifyContent="center"
                              >
                                <Tooltip title="Ver">
                                  <IconButton
                                    color="info"
                                    size="small"
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
                                    size="small"
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
                                    size="small"
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
              </Box>

              <Stack
                spacing={1.5}
                sx={{
                  display: {
                    xs: "flex",
                    md: "none",
                  },
                }}
              >
                {servicios.length === 0 ? (
                  <Box
                    textAlign="center"
                    py={4}
                  >
                    <Typography color="text.secondary">
                      Sin productos registrados
                    </Typography>
                  </Box>
                ) : (
                  servicios.map(
                    (
                      servicio: SuperAdminService,
                    ) => (
                      <Card
                        key={servicio.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="flex-start"
                          >
                            <ProductImage
                              src={
                                servicio.url_imagen
                              }
                              alt={
                                servicio.name
                              }
                              size={64}
                            />

                            <Box
                              minWidth={0}
                              flex={1}
                            >
                              <Typography
                                fontWeight={800}
                              >
                                {
                                  servicio.name
                                }
                              </Typography>

                              <Chip
                                label={obtenerNombreCategoria(
                                  servicio,
                                )}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  mt: 0.75,
                                }}
                              />

                              <Typography
                                mt={1}
                                fontWeight={700}
                              >
                                {formatearPrecio(
                                  servicio.precio,
                                )}
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={1.5}
                            sx={{
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              display:
                                "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient:
                                "vertical",
                            }}
                          >
                            {servicio.descripcion ||
                              "Sin descripción"}
                          </Typography>

                          <Divider
                            sx={{ my: 1.5 }}
                          />

                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() =>
                                abrirDetalle(
                                  servicio,
                                )
                              }
                            >
                              <VisibilityRoundedIcon />
                            </IconButton>

                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() =>
                                abrirEditar(
                                  servicio,
                                )
                              }
                            >
                              <EditRoundedIcon />
                            </IconButton>

                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                abrirEliminar(
                                  servicio,
                                )
                              }
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Card>
                    ),
                  )
                )}
              </Stack>

              {paginacion.total > 0 && (
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                  mt={3}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Mostrando{" "}
                    {paginacion.from ?? 0} a{" "}
                    {paginacion.to ?? 0} de{" "}
                    {paginacion.total} productos
                  </Typography>

                  <Pagination
                    count={
                      paginacion.lastPage
                    }
                    page={pagina}
                    onChange={(
                      _event,
                      nuevaPagina,
                    ) => {
                      setPagina(
                        nuevaPagina,
                      );
                    }}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              )}
            </>
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
              value={form.categoria_id}
              onChange={
                seleccionarCategoriaProducto
              }
              required
              fullWidth
            >
              {categoriasOrdenadas.map(
                (
                  categoria: SuperAdminServiceCategory,
                ) => (
                  <MenuItem
                    key={categoria.id}
                    value={String(
                      categoria.id,
                    )}
                  >
                    {categoria.nombre}
                  </MenuItem>
                ),
              )}

              <MenuItem
                value={
                  NUEVA_CATEGORIA_VALUE
                }
              >
                + Crear nueva categoría
              </MenuItem>
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
                  precio:
                    event.target.value,
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

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >
              <TextField
                label="Clave de producto o servicio"
                value={form.clave_producto}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    clave_producto:
                      event.target.value,
                  }))
                }
                inputProps={{
                  maxLength: 8,
                }}
                helperText="Clave SAT de hasta 8 caracteres."
                fullWidth
              />

              <TextField
                label="Clave de unidad"
                value={form.clave_unidad}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    clave_unidad:
                      event.target.value.toUpperCase(),
                  }))
                }
                inputProps={{
                  maxLength: 3,
                }}
                helperText="Ejemplo: E48."
                fullWidth
              />
            </Stack>

            <Stack spacing={2}>
              <TextField
                label="URL de la imagen"
                type="url"
                value={form.url_imagen}
                onChange={
                  cambiarUrlImagen
                }
                placeholder="https://dominio.com/imagen.jpg"
                helperText="Puedes pegar una URL o subir una imagen desde tu equipo."
                fullWidth
              />

              <Button
                component="label"
                variant="outlined"
                startIcon={
                  <UploadFileRoundedIcon />
                }
              >
                Seleccionar imagen

                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    seleccionarImagen
                  }
                />
              </Button>

              {archivoImagen && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Archivo seleccionado:{" "}
                  {archivoImagen.name}
                </Typography>
              )}

              {vistaPreviaImagen &&
              !errorVistaPrevia ? (
                <Box
                  sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 1.5,
                    backgroundColor:
                      theme.palette.background.default,
                  })}
                >
                  <Typography
                    variant="subtitle2"
                    mb={1}
                  >
                    Vista previa
                  </Typography>

                  <Box
                    component="img"
                    src={
                      vistaPreviaImagen
                    }
                    alt="Vista previa del producto"
                    onError={() =>
                      setErrorVistaPrevia(
                        true,
                      )
                    }
                    sx={{
                      display: "block",
                      width: "100%",
                      maxWidth: 420,
                      height: 220,
                      mx: "auto",
                      objectFit: "contain",
                      borderRadius: 1.5,
                    }}
                  />
                </Box>
              ) : vistaPreviaImagen &&
                errorVistaPrevia ? (
                <Alert severity="error">
                  No fue posible cargar la vista previa de la imagen.
                </Alert>
              ) : (
                <Box
                  sx={(theme) => ({
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    py: 4,
                    px: 2,
                    textAlign: "center",
                  })}
                >
                  <Typography color="text.secondary">
                    No hay una imagen seleccionada.
                  </Typography>
                </Box>
              )}
            </Stack>
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
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                alignItems={{
                  xs: "center",
                  sm: "flex-start",
                }}
              >
                <ProductImage
                  src={
                    servicioSeleccionado.url_imagen
                  }
                  alt={
                    servicioSeleccionado.name
                  }
                  size={120}
                />

                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Nombre
                  </Typography>

                  <Typography
                    fontWeight={800}
                    variant="h6"
                  >
                    {
                      servicioSeleccionado.name
                    }
                  </Typography>

                  <Box mt={1}>
                    <Chip
                      label={obtenerNombreCategoria(
                        servicioSeleccionado,
                      )}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    mt={1.5}
                    fontWeight={700}
                  >
                    {formatearPrecio(
                      servicioSeleccionado.precio,
                    )}
                  </Typography>
                </Box>
              </Stack>

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

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Clave de producto o servicio
                  </Typography>

                  <Typography fontWeight={700}>
                    {servicioSeleccionado.clave_producto ||
                      "-"}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Clave de unidad
                  </Typography>

                  <Typography fontWeight={700}>
                    {servicioSeleccionado.clave_unidad ||
                      "-"}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  ID de categoría
                </Typography>

                <Typography>
                  {servicioSeleccionado.categoria_id ??
                    "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  URL de la imagen
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    wordBreak:
                      "break-all",
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
          <Button
            onClick={cerrarDetalle}
          >
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

      <Dialog
        open={dialogCategorias}
        onClose={() => {
          if (
            !savingCategoria &&
            !deletingCategoria
          ) {
            setDialogCategorias(
              false,
            );
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Administrar categorías
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  fontWeight={800}
                >
                  Categorías registradas
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {categoriasOrdenadas.length}{" "}
                  {categoriasOrdenadas.length === 1
                    ? "categoría"
                    : "categorías"}
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  <AddRoundedIcon />
                }
                onClick={() =>
                  abrirCrearCategoria(
                    false,
                  )
                }
              >
                Crear categoría
              </Button>
            </Stack>

            {loadingCategorias ? (
              <Box
                display="flex"
                justifyContent="center"
                py={5}
              >
                <CircularProgress />
              </Box>
            ) : categoriasOrdenadas.length ===
              0 ? (
              <Alert severity="info">
                No hay categorías registradas.
              </Alert>
            ) : (
              <>
                <Box
                  sx={(theme) => ({
                    display: {
                      xs: "none",
                      md: "block",
                    },
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: "hidden",
                    backgroundColor:
                      theme.palette.background.paper,
                  })}
                >
                  <Table
                    size="small"
                    sx={{
                      width: "100%",
                      tableLayout: "fixed",
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={(theme) => ({
                          backgroundColor:
                            theme.palette.action.hover,
                        })}
                      >
                        <TableCell width="52%">
                          Categoría
                        </TableCell>

                        <TableCell
                          width="20%"
                          align="center"
                        >
                          Productos
                        </TableCell>

                        <TableCell
                          width="28%"
                          align="center"
                        >
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {categoriasOrdenadas.map(
                        (
                          categoria: SuperAdminServiceCategory,
                        ) => (
                          <TableRow
                            hover
                            key={categoria.id}
                            sx={{
                              "&:last-child td": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                minWidth={0}
                              >
                                <Box
                                  sx={(theme) => ({
                                    width: 42,
                                    height: 42,
                                    minWidth: 42,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor:
                                      theme.palette.action.hover,
                                    color:
                                      theme.palette.primary.main,
                                  })}
                                >
                                  <CategoryRoundedIcon
                                    fontSize="small"
                                  />
                                </Box>

                                <Box minWidth={0}>
                                  <Typography
                                    fontWeight={800}
                                    noWrap
                                  >
                                    {categoria.nombre}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    {categoria.slug}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell align="center">
                              <Chip
                                label={`${categoria.productos_count} ${
                                  categoria.productos_count === 1
                                    ? "producto"
                                    : "productos"
                                }`}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={0.75}
                                justifyContent="center"
                              >
                                <Tooltip title="Editar categoría">
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() =>
                                      abrirEditarCategoria(
                                        categoria,
                                      )
                                    }
                                    sx={(theme) => ({
                                      border: `1px solid ${theme.palette.primary.main}`,
                                      borderRadius: 2,
                                    })}
                                  >
                                    <EditRoundedIcon />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar categoría">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      void abrirEliminarCategoria(
                                        categoria,
                                      )
                                    }
                                    sx={(theme) => ({
                                      border: `1px solid ${theme.palette.error.main}`,
                                      borderRadius: 2,
                                    })}
                                  >
                                    <DeleteRoundedIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </Box>

                <Stack
                  spacing={1.25}
                  sx={{
                    display: {
                      xs: "flex",
                      md: "none",
                    },
                  }}
                >
                  {categoriasOrdenadas.map(
                    (
                      categoria: SuperAdminServiceCategory,
                    ) => (
                      <Card
                        key={categoria.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2.5,
                        }}
                      >
                        <CardContent
                          sx={{
                            "&:last-child": {
                              pb: 2,
                            },
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                            >
                              <Box
                                sx={(theme) => ({
                                  width: 42,
                                  height: 42,
                                  minWidth: 42,
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor:
                                    theme.palette.action.hover,
                                  color:
                                    theme.palette.primary.main,
                                })}
                              >
                                <CategoryRoundedIcon
                                  fontSize="small"
                                />
                              </Box>

                              <Box minWidth={0} flex={1}>
                                <Typography
                                  fontWeight={800}
                                >
                                  {categoria.nombre}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    wordBreak:
                                      "break-word",
                                  }}
                                >
                                  {categoria.slug}
                                </Typography>
                              </Box>

                              <Chip
                                label={
                                  categoria.productos_count
                                }
                                size="small"
                                variant="outlined"
                              />
                            </Stack>

                            <Divider />

                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              <Button
                                variant="outlined"
                                startIcon={
                                  <EditRoundedIcon />
                                }
                                onClick={() =>
                                  abrirEditarCategoria(
                                    categoria,
                                  )
                                }
                              >
                                Editar
                              </Button>

                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={
                                  <DeleteRoundedIcon />
                                }
                                onClick={() =>
                                  void abrirEliminarCategoria(
                                    categoria,
                                  )
                                }
                              >
                                Eliminar
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDialogCategorias(
                false,
              )
            }
            disabled={
              savingCategoria ||
              deletingCategoria
            }
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          dialogCategoriaFormulario
        }
        onClose={
          cerrarFormularioCategoria
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {categoriaSeleccionada
            ? "Editar categoría"
            : "Crear categoría"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField
              label="Nombre"
              value={categoriaNombre}
              onChange={(event) =>
                setCategoriaNombre(
                  event.target.value,
                )
              }
              inputProps={{
                maxLength: 100,
              }}
              required
              autoFocus
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              cerrarFormularioCategoria
            }
            disabled={savingCategoria}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void guardarCategoria()
            }
            disabled={savingCategoria}
          >
            {savingCategoria ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : categoriaSeleccionada ? (
              "Guardar cambios"
            ) : (
              "Crear categoría"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogEliminarCategoria}
        onClose={
          cerrarEliminarCategoria
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          ¿Estás seguro de eliminar esta categoría?
        </DialogTitle>

        <DialogContent>
          {loadingVistaEliminacionCategoria ? (
            <Box
              display="flex"
              justifyContent="center"
              py={5}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2} mt={1}>
              <Typography>
                Se eliminará la categoría{" "}
                <strong>
                  {
                    categoriaParaEliminar?.nombre
                  }
                </strong>
                .
              </Typography>

              <Alert severity="warning">
                Los productos asociados no se eliminarán.
                Permanecerán registrados con su campo{" "}
                <strong>categoria_id</strong> en valor nulo.
              </Alert>

              {vistaEliminacionCategoria &&
              vistaEliminacionCategoria.productos_count >
                0 ? (
                <Box>
                  <Typography
                    fontWeight={700}
                    mb={1}
                  >
                    Productos asociados (
                    {
                      vistaEliminacionCategoria.productos_count
                    }
                    )
                  </Typography>

                  <Box
                    sx={(theme) => ({
                      maxHeight: 260,
                      overflowY: "auto",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    })}
                  >
                    {vistaEliminacionCategoria.productos.map(
                      (producto, index) => (
                        <Box
                          key={producto.id}
                          sx={(theme) => ({
                            px: 2,
                            py: 1.25,
                            borderBottom:
                              index <
                              vistaEliminacionCategoria.productos.length -
                                1
                                ? `1px solid ${theme.palette.divider}`
                                : "none",
                          })}
                        >
                          <Typography
                            fontWeight={700}
                          >
                            {producto.name}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  Esta categoría no tiene productos asociados.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              cerrarEliminarCategoria
            }
            disabled={
              deletingCategoria ||
              loadingVistaEliminacionCategoria
            }
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() =>
              void eliminarCategoria()
            }
            disabled={
              deletingCategoria ||
              loadingVistaEliminacionCategoria ||
              !vistaEliminacionCategoria
            }
          >
            {deletingCategoria ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Sí, eliminar categoría"
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
          severity={
            notification.severity
          }
          variant="filled"
          onClose={
            cerrarNotificacion
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
