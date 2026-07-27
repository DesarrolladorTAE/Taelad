import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Avatar,
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import {
  createSuperAdminClientHistory,
  createSuperAdminPaymentMethod,
  deleteSuperAdminPaymentMethod,
  downloadSuperAdminClientHistoryInvoicePdf,
  downloadSuperAdminClientHistoryPdf,
  downloadSuperAdminClientHistoryXml,
  getSuperAdminClientHistory,
  getSuperAdminPaymentMethods,
  getSuperAdminServices,
  getSuperAdminUsers,
  updateSuperAdminPaymentMethod,
  updateSuperAdminPaymentMethodStatus,
  uploadSuperAdminClientHistoryInvoicePdf,
  uploadSuperAdminClientHistoryXml,
  viewSuperAdminClientHistoryInvoicePdf,
  viewSuperAdminClientHistoryPdf,
  viewSuperAdminClientHistoryXml,
  type ClientHistoryMonthlySummary,
  type ClientHistoryRecord,
  type ClientHistoryStatus,
  type SuperAdminPaymentMethod,
  type SuperAdminService,
} from "../../../../services/superadminService";

type Props = {
  systemName: string;
  onBack: () => void;
};

type UserOption = {
  id: number;
  name?: string | null;
  apellidos?: string | null;
  email?: string | null;
  phone?: string | null;
};

type HistoryFormState = {
  clienteId: string;
  productoId: string;
  metodoPagoId: string;
  concepto: string;
  cantidad: string;
  precioUnitario: string;
  status: ClientHistoryStatus;
  fechaOperacion: string;
  folio: string;
  uuidFiscal: string;
  observaciones: string;
};

type PaymentMethodFormState = {
  id: number | null;
  nombre: string;
  descripcion: string;
};

type PdfPreviewState = {
  title: string;
  fileName: string;
  url: string;
};

type XmlPreviewState = {
  recordId: number;
  title: string;
  fileName: string;
  content: string;
};

const STATUS_OPTIONS: Array<{
  value: ClientHistoryStatus;
  label: string;
}> = [
  {
    value: "pendiente",
    label: "Pendiente",
  },
  {
    value: "pagado",
    label: "Pagado",
  },
  {
    value: "cancelado",
    label: "Cancelado",
  },
  {
    value: "vencido",
    label: "Vencido",
  },
  {
    value: "reembolsado",
    label: "Reembolsado",
  },
];

const MONTH_OPTIONS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const currencyFormatter =
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

const dateFormatter =
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function currentLocalDateTime(): string {
  const now = new Date();
  const offset =
    now.getTimezoneOffset() * 60_000;

  return new Date(
    now.getTime() - offset,
  )
    .toISOString()
    .slice(0, 16);
}

function toApiDateTime(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return value.replace("T", " ") + ":00";
}

function asNumber(
  value: number | string | null | undefined,
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatCurrency(
  value: number | string | null | undefined,
): string {
  return currencyFormatter.format(
    asNumber(value),
  );
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

function fullName(
  user: UserOption | null | undefined,
): string {
  if (!user) {
    return "Cliente no disponible";
  }

  const name = [
    user.name,
    user.apellidos,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || user.email || `Cliente ${user.id}`;
}

function extractRows<T>(
  response: unknown,
): T[] {
  const payload = response as {
    data?: unknown;
  };

  const first = payload?.data;

  if (Array.isArray(first)) {
    return first as T[];
  }

  if (
    first &&
    typeof first === "object"
  ) {
    const second = (
      first as {
        data?: unknown;
      }
    ).data;

    if (Array.isArray(second)) {
      return second as T[];
    }

    if (
      second &&
      typeof second === "object"
    ) {
      const third = (
        second as {
          data?: unknown;
        }
      ).data;

      if (Array.isArray(third)) {
        return third as T[];
      }
    }
  }

  return [];
}

function errorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<
              string,
              string[]
            >;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }

    const firstError =
      response?.data?.errors
        ? Object.values(
            response.data.errors,
          )[0]?.[0]
        : null;

    if (firstError) {
      return firstError;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function statusLabel(
  status: ClientHistoryStatus,
): string {
  return (
    STATUS_OPTIONS.find(
      (option) =>
        option.value === status,
    )?.label ?? status
  );
}

function statusColor(
  status: ClientHistoryStatus,
):
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info" {
  switch (status) {
    case "pagado":
      return "success";

    case "pendiente":
      return "warning";

    case "cancelado":
      return "error";

    case "vencido":
      return "error";

    case "reembolsado":
      return "info";

    default:
      return "default";
  }
}

function buildPdfFileName(
  record: ClientHistoryRecord,
): string {
  const reference =
    record.folio?.trim() || record.id;

  return `comprobante-historial-${reference}.pdf`;
}

function buildInvoicePdfFileName(
  record: ClientHistoryRecord,
): string {
  const reference =
    record.folio?.trim() || record.id;

  return `factura-${reference}.pdf`;
}

function buildXmlFileName(
  record: ClientHistoryRecord,
): string {
  const reference =
    record.folio?.trim() || record.id;

  return `factura-${reference}.xml`;
}

function emptyHistoryForm(): HistoryFormState {
  return {
    clienteId: "",
    productoId: "",
    metodoPagoId: "",
    concepto: "",
    cantidad: "1",
    precioUnitario: "",
    status: "pagado",
    fechaOperacion:
      currentLocalDateTime(),
    folio: "",
    uuidFiscal: "",
    observaciones: "",
  };
}

function emptyPaymentMethodForm(): PaymentMethodFormState {
  return {
    id: null,
    nombre: "",
    descripcion: "",
  };
}

function SummaryCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={700}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={900}
              mt={0.75}
            >
              {value}
            </Typography>

            {detail ? (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {detail}
              </Typography>
            ) : null}
          </Box>

          <Avatar
            sx={{
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 5,
        borderRadius: 3,
        textAlign: "center",
      }}
    >
      <Avatar
        sx={{
          width: 58,
          height: 58,
          mx: "auto",
          mb: 2,
          bgcolor: "action.hover",
          color: "text.secondary",
        }}
      >
        <HistoryRoundedIcon />
      </Avatar>

      <Typography
        variant="h6"
        fontWeight={900}
      >
        No hay movimientos
      </Typography>

      <Typography
        color="text.secondary"
        mt={0.75}
      >
        No se encontraron registros con
        los filtros seleccionados.
      </Typography>
    </Paper>
  );
}

export default function ClientHistoryPage({
  systemName,
  onBack,
}: Props) {
  const now = new Date();

  const [periodo, setPeriodo] =
    useState<"mes" | "anio">("mes");

  const [anio, setAnio] = useState(
    now.getFullYear(),
  );

  const [mes, setMes] = useState(
    now.getMonth() + 1,
  );

  const [clienteId, setClienteId] =
    useState("");

  const [status, setStatus] =
    useState<ClientHistoryStatus | "">(
      "",
    );

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] = useState(1);

  const [records, setRecords] =
    useState<ClientHistoryRecord[]>([]);

  const [
    monthlySummary,
    setMonthlySummary,
  ] = useState<
    ClientHistoryMonthlySummary[]
  >([]);

  const [summary, setSummary] =
    useState({
      registros: 0,
      cantidad_total: 0,
      importe_total: 0,
      importe_pagado: 0,
      importe_pendiente: 0,
      importe_cancelado: 0,
      importe_vencido: 0,
      importe_reembolsado: 0,
    });

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [catalogLoading, setCatalogLoading] =
    useState(true);

  const [users, setUsers] =
    useState<UserOption[]>([]);

  const [products, setProducts] =
    useState<SuperAdminService[]>([]);

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState<SuperAdminPaymentMethod[]>(
    [],
  );

  const [createOpen, setCreateOpen] =
    useState(false);

  const [createSaving, setCreateSaving] =
    useState(false);

  const [createError, setCreateError] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<HistoryFormState>(
      emptyHistoryForm(),
    );

  const [detail, setDetail] =
    useState<ClientHistoryRecord | null>(
      null,
    );

  const [
    paymentMethodsOpen,
    setPaymentMethodsOpen,
  ] = useState(false);

  const [
    paymentMethodForm,
    setPaymentMethodForm,
  ] = useState<PaymentMethodFormState>(
    emptyPaymentMethodForm(),
  );

  const [
    paymentMethodSaving,
    setPaymentMethodSaving,
  ] = useState(false);

  const [
    paymentMethodError,
    setPaymentMethodError,
  ] = useState<string | null>(null);

  const [
    activeFileAction,
    setActiveFileAction,
  ] = useState<string | null>(null);

  const [pdfPreview, setPdfPreview] =
    useState<PdfPreviewState | null>(null);

  const [xmlPreview, setXmlPreview] =
    useState<XmlPreviewState | null>(null);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();

    return Array.from(
      {
        length: 8,
      },
      (_, index) => current - index,
    );
  }, []);

  const activePaymentMethods =
    useMemo(
      () =>
        paymentMethods.filter(
          (method) => method.activo,
        ),
      [paymentMethods],
    );

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            String(product.id) ===
            form.productoId,
        ) ?? null,
      [form.productoId, products],
    );

  const loadCatalogs =
    useCallback(async () => {
      setCatalogLoading(true);

      try {
        const [
          usersResponse,
          productsResponse,
          methodsResponse,
        ] = await Promise.all([
          getSuperAdminUsers({
            page: 1,
            perPage: 100,
          }),
          getSuperAdminServices({
            page: 1,
            perPage: 100,
          }),
          getSuperAdminPaymentMethods(),
        ]);

        setUsers(
          extractRows<UserOption>(
            usersResponse,
          ),
        );

        setProducts(
          extractRows<SuperAdminService>(
            productsResponse,
          ),
        );

        setPaymentMethods(
          methodsResponse.data ?? [],
        );
      } catch (catalogError) {
        setError(
          errorMessage(
            catalogError,
            "No fue posible cargar los catálogos.",
          ),
        );
      } finally {
        setCatalogLoading(false);
      }
    }, []);

  const loadHistory =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getSuperAdminClientHistory({
            clienteId:
              clienteId || undefined,
            periodo,
            anio,
            mes:
              periodo === "mes"
                ? mes
                : undefined,
            status,
            search,
            page,
            perPage: 16,
          });

        setRecords(
          response.data.records.data ?? [],
        );

        setSummary(
          response.data.summary,
        );

        setMonthlySummary(
          response.data.monthly_summary ??
            [],
        );

        setLastPage(
          response.data.records.last_page ??
            1,
        );

        setTotal(
          response.data.records.total ?? 0,
        );
      } catch (historyError) {
        setRecords([]);
        setMonthlySummary([]);
        setError(
          errorMessage(
            historyError,
            "No fue posible consultar el historial.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [
      anio,
      clienteId,
      mes,
      page,
      periodo,
      search,
      status,
    ]);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setPage(1);
  }, [
    anio,
    clienteId,
    mes,
    periodo,
    search,
    status,
  ]);

  useEffect(() => {
    return () => {
      if (pdfPreview?.url) {
        window.URL.revokeObjectURL(
          pdfPreview.url,
        );
      }
    };
  }, [pdfPreview]);

  function openCreateDialog() {
    setCreateError(null);

    const next =
      emptyHistoryForm();

    if (
      activePaymentMethods.length > 0
    ) {
      next.metodoPagoId = String(
        activePaymentMethods[0].id,
      );
    }

    setForm(next);
    setCreateOpen(true);
  }

  function handleProductChange(
    productId: string,
  ) {
    const product =
      products.find(
        (item) =>
          String(item.id) === productId,
      ) ?? null;

    setForm((current) => ({
      ...current,
      productoId: productId,
      precioUnitario: product
        ? String(
            asNumber(product.precio),
          )
        : "",
    }));
  }

  async function handleCreate() {
    setCreateError(null);

    if (
      !form.clienteId ||
      !form.productoId ||
      !form.metodoPagoId
    ) {
      setCreateError(
        "Selecciona cliente, producto y método de pago.",
      );

      return;
    }

    if (
      asNumber(form.cantidad) <= 0
    ) {
      setCreateError(
        "La cantidad debe ser mayor que cero.",
      );

      return;
    }

    setCreateSaving(true);

    try {
      await createSuperAdminClientHistory({
        cliente_id: Number(
          form.clienteId,
        ),
        producto_id: Number(
          form.productoId,
        ),
        metodo_pago_id: Number(
          form.metodoPagoId,
        ),
        concepto:
          form.concepto || null,
        cantidad: Number(
          form.cantidad,
        ),
        precio_unitario:
          form.precioUnitario === ""
            ? null
            : Number(
                form.precioUnitario,
              ),
        status: form.status,
        fecha_operacion:
          toApiDateTime(
            form.fechaOperacion,
          ),
        folio: form.folio || null,
        uuid_fiscal:
          form.uuidFiscal || null,
        observaciones:
          form.observaciones || null,
      });

      setCreateOpen(false);
      setPage(1);

      await loadHistory();
    } catch (createHistoryError) {
      setCreateError(
        errorMessage(
          createHistoryError,
          "No fue posible registrar el movimiento.",
        ),
      );
    } finally {
      setCreateSaving(false);
    }
  }

  async function executeFileAction(
    actionKey: string,
    action: () => Promise<void>,
  ) {
    setActiveFileAction(actionKey);
    setError(null);

    try {
      await action();
    } catch (fileError) {
      setError(
        errorMessage(
          fileError,
          "No fue posible procesar el archivo.",
        ),
      );
    } finally {
      setActiveFileAction(null);
    }
  }

  async function showPdfInModal(
    actionKey: string,
    title: string,
    fileName: string,
    loader: () => Promise<Blob>,
  ) {
    setActiveFileAction(actionKey);
    setError(null);

    try {
      const blob = await loader();
      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob([blob], {
              type: "application/pdf",
            });

      const url =
        window.URL.createObjectURL(
          pdfBlob,
        );

      setPdfPreview({
        title,
        fileName,
        url,
      });
    } catch (fileError) {
      setError(
        errorMessage(
          fileError,
          "No fue posible mostrar el PDF.",
        ),
      );
    } finally {
      setActiveFileAction(null);
    }
  }

  async function showXmlInModal(
    record: ClientHistoryRecord,
  ) {
    const actionKey =
      `xml-view-${record.id}`;

    setActiveFileAction(actionKey);
    setError(null);

    try {
      const content =
        await viewSuperAdminClientHistoryXml(
          record.id,
        );

      setXmlPreview({
        recordId: record.id,
        title: `XML ${
          record.folio ?? record.id
        }`,
        fileName:
          buildXmlFileName(record),
        content,
      });
    } catch (fileError) {
      setError(
        errorMessage(
          fileError,
          "No fue posible mostrar el XML.",
        ),
      );
    } finally {
      setActiveFileAction(null);
    }
  }

  async function handleInvoicePdfUpload(
    record: ClientHistoryRecord,
    file: File | null,
  ) {
    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Selecciona un archivo PDF válido.",
      );

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "La factura PDF no debe superar 10 MB.",
      );

      return;
    }

    await executeFileAction(
      `invoice-pdf-upload-${record.id}`,
      async () => {
        await uploadSuperAdminClientHistoryInvoicePdf(
          record.id,
          file,
        );

        await loadHistory();
      },
    );
  }

  async function handleXmlUpload(
    record: ClientHistoryRecord,
    file: File | null,
  ) {
    if (!file) {
      return;
    }

    await executeFileAction(
      `xml-upload-${record.id}`,
      async () => {
        await uploadSuperAdminClientHistoryXml(
          record.id,
          file,
        );

        await loadHistory();
      },
    );
  }

  function openNewPaymentMethod() {
    setPaymentMethodError(null);
    setPaymentMethodForm(
      emptyPaymentMethodForm(),
    );
  }

  function openEditPaymentMethod(
    method: SuperAdminPaymentMethod,
  ) {
    setPaymentMethodError(null);
    setPaymentMethodForm({
      id: method.id,
      nombre: method.nombre,
      descripcion:
        method.descripcion ?? "",
    });
  }

  async function savePaymentMethod() {
    if (
      !paymentMethodForm.nombre.trim()
    ) {
      setPaymentMethodError(
        "El nombre es obligatorio.",
      );

      return;
    }

    setPaymentMethodSaving(true);
    setPaymentMethodError(null);

    try {
      if (
        paymentMethodForm.id === null
      ) {
        await createSuperAdminPaymentMethod(
          {
            nombre:
              paymentMethodForm.nombre,
            descripcion:
              paymentMethodForm.descripcion,
            activo: true,
          },
        );
      } else {
        await updateSuperAdminPaymentMethod(
          paymentMethodForm.id,
          {
            nombre:
              paymentMethodForm.nombre,
            descripcion:
              paymentMethodForm.descripcion,
          },
        );
      }

      const response =
        await getSuperAdminPaymentMethods();

      setPaymentMethods(
        response.data ?? [],
      );

      setPaymentMethodForm(
        emptyPaymentMethodForm(),
      );
    } catch (methodError) {
      setPaymentMethodError(
        errorMessage(
          methodError,
          "No fue posible guardar el método de pago.",
        ),
      );
    } finally {
      setPaymentMethodSaving(false);
    }
  }

  async function togglePaymentMethod(
    method: SuperAdminPaymentMethod,
  ) {
    setPaymentMethodError(null);

    try {
      await updateSuperAdminPaymentMethodStatus(
        method.id,
        !method.activo,
      );

      const response =
        await getSuperAdminPaymentMethods();

      setPaymentMethods(
        response.data ?? [],
      );
    } catch (methodError) {
      setPaymentMethodError(
        errorMessage(
          methodError,
          "No fue posible cambiar el estatus.",
        ),
      );
    }
  }

  async function removePaymentMethod(
    method: SuperAdminPaymentMethod,
  ) {
    if (
      !window.confirm(
        `¿Eliminar el método "${method.nombre}"?`,
      )
    ) {
      return;
    }

    setPaymentMethodError(null);

    try {
      await deleteSuperAdminPaymentMethod(
        method.id,
      );

      const response =
        await getSuperAdminPaymentMethods();

      setPaymentMethods(
        response.data ?? [],
      );
    } catch (methodError) {
      setPaymentMethodError(
        errorMessage(
          methodError,
          "No fue posible eliminar el método de pago.",
        ),
      );
    }
  }

  const estimatedTotal =
    asNumber(form.cantidad) *
    asNumber(form.precioUnitario);

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            md: "center",
          }}
          spacing={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
              }}
            >
              <HistoryRoundedIcon />
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
              >
                Historial del cliente
              </Typography>

              <Typography
                color="text.secondary"
              >
                {systemName}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.25}
          >
            <Button
              variant="outlined"
              startIcon={
                <ArrowBackRoundedIcon />
              }
              onClick={onBack}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: 2.5,
              }}
            >
              Volver
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <ManageAccountsRoundedIcon />
              }
              onClick={() => {
                setPaymentMethodsOpen(
                  true,
                );
                openNewPaymentMethod();
              }}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: 2.5,
              }}
            >
              Métodos de pago
            </Button>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreateDialog}
              disabled={catalogLoading}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: 2.5,
              }}
            >
              Nuevo movimiento
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <Alert
            severity="error"
            onClose={() =>
              setError(null)
            }
          >
            {error}
          </Alert>
        ) : null}

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={6}
              md={2}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Periodo
                </InputLabel>

                <Select
                  value={periodo}
                  label="Periodo"
                  onChange={(event) =>
                    setPeriodo(
                      event.target.value as
                        | "mes"
                        | "anio",
                    )
                  }
                >
                  <MenuItem value="mes">
                    Mensual
                  </MenuItem>

                  <MenuItem value="anio">
                    Anual
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={2}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Año
                </InputLabel>

                <Select
                  value={anio}
                  label="Año"
                  onChange={(event) =>
                    setAnio(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                >
                  {yearOptions.map(
                    (year) => (
                      <MenuItem
                        value={year}
                        key={year}
                      >
                        {year}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Grid>

            {periodo === "mes" ? (
              <Grid
                item
                xs={12}
                sm={6}
                md={2}
              >
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel>
                    Mes
                  </InputLabel>

                  <Select
                    value={mes}
                    label="Mes"
                    onChange={(event) =>
                      setMes(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  >
                    {MONTH_OPTIONS.map(
                      (
                        monthName,
                        index,
                      ) => (
                        <MenuItem
                          value={index + 1}
                          key={monthName}
                        >
                          {monthName}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>
            ) : null}

            <Grid
              item
              xs={12}
              sm={6}
              md={periodo === "mes" ? 2 : 3}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Cliente
                </InputLabel>

                <Select
                  value={clienteId}
                  label="Cliente"
                  onChange={(event) =>
                    setClienteId(
                      String(
                        event.target.value,
                      ),
                    )
                  }
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {users.map((user) => (
                    <MenuItem
                      value={String(
                        user.id,
                      )}
                      key={user.id}
                    >
                      {fullName(user)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={2}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Estatus
                </InputLabel>

                <Select
                  value={status}
                  label="Estatus"
                  onChange={(event) =>
                    setStatus(
                      event.target.value as
                        | ClientHistoryStatus
                        | "",
                    )
                  }
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {STATUS_OPTIONS.map(
                    (option) => (
                      <MenuItem
                        value={option.value}
                        key={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              md={
                periodo === "mes" ? 2 : 3
              }
            >
              <TextField
                fullWidth
                size="small"
                value={searchInput}
                placeholder="Buscar..."
                onChange={(event) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    setSearch(
                      searchInput.trim(),
                    );
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSearch(
                            searchInput.trim(),
                          )
                        }
                      >
                        <SearchRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Importe total"
              value={formatCurrency(
                summary.importe_total,
              )}
              detail={`${summary.registros} movimientos`}
              icon={<PaymentsRoundedIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Pagado"
              value={formatCurrency(
                summary.importe_pagado,
              )}
              detail={`Cantidad: ${summary.cantidad_total}`}
              icon={
                <DescriptionRoundedIcon />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Pendiente"
              value={formatCurrency(
                summary.importe_pendiente,
              )}
              icon={
                <CalendarMonthRoundedIcon />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Vencido y cancelado"
              value={formatCurrency(
                summary.importe_vencido +
                  summary.importe_cancelado,
              )}
              detail={`Reembolsado: ${formatCurrency(
                summary.importe_reembolsado,
              )}`}
              icon={<HistoryRoundedIcon />}
            />
          </Grid>
        </Grid>

        {periodo === "anio" &&
        monthlySummary.length > 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
            }}
          >
            <Typography
              fontWeight={900}
              mb={2}
            >
              Resumen mensual de {anio}
            </Typography>

            <Grid container spacing={1.5}>
              {monthlySummary.map(
                (month) => (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    key={month.mes}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        textTransform="capitalize"
                      >
                        {month.nombre}
                      </Typography>

                      <Typography
                        fontWeight={900}
                      >
                        {formatCurrency(
                          month.importe_total,
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {month.registros} registros
                      </Typography>
                    </Paper>
                  </Grid>
                ),
              )}
            </Grid>
          </Paper>
        ) : null}

        {loading ? (
          <Box
            sx={{
              minHeight: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack
              alignItems="center"
              spacing={1.5}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Consultando historial...
              </Typography>
            </Stack>
          </Box>
        ) : records.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Table
                sx={{
                  tableLayout: "fixed",
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell width="13%">
                      Fecha
                    </TableCell>

                    <TableCell width="18%">
                      Cliente
                    </TableCell>

                    <TableCell width="18%">
                      Producto
                    </TableCell>

                    <TableCell
                      width="8%"
                      align="right"
                    >
                      Cant.
                    </TableCell>

                    <TableCell
                      width="12%"
                      align="right"
                    >
                      Importe
                    </TableCell>

                    <TableCell width="12%">
                      Pago
                    </TableCell>

                    <TableCell width="9%">
                      Estatus
                    </TableCell>

                    <TableCell
                      width="10%"
                      align="center"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {records.map((record) => (
                    <TableRow
                      hover
                      key={record.id}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {formatDate(
                            record.fecha_operacion,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          noWrap
                        >
                          {fullName(
                            record.cliente,
                          )}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {record.cliente
                            ?.email ??
                            "Sin correo"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          noWrap
                        >
                          {record.producto_nombre}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {record.concepto ??
                            "Sin concepto"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {asNumber(
                          record.cantidad,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          fontWeight={900}
                        >
                          {formatCurrency(
                            record.importe,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                        >
                          {record.metodo_pago
                            ?.nombre ??
                            "No especificado"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabel(
                            record.status,
                          )}
                          color={statusColor(
                            record.status,
                          )}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          justifyContent="center"
                          spacing={0.25}
                        >
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setDetail(
                                  record,
                                )
                              }
                            >
                              <VisibilityRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Ver PDF">
                            <IconButton
                              size="small"
                              disabled={
                                activeFileAction ===
                                `pdf-view-${record.id}`
                              }
                              onClick={() =>
                                void showPdfInModal(
                                  `pdf-view-${record.id}`,
                                  `Comprobante ${
                                    record.folio ??
                                    record.id
                                  }`,
                                  buildPdfFileName(
                                    record,
                                  ),
                                  () =>
                                    viewSuperAdminClientHistoryPdf(
                                      record.id,
                                    ),
                                )
                              }
                            >
                              <PictureAsPdfRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Descargar PDF">
                            <IconButton
                              size="small"
                              disabled={
                                activeFileAction ===
                                `pdf-download-${record.id}`
                              }
                              onClick={() =>
                                void executeFileAction(
                                  `pdf-download-${record.id}`,
                                  () =>
                                    downloadSuperAdminClientHistoryPdf(
                                      record.id,
                                      buildPdfFileName(
                                        record,
                                      ),
                                    ),
                                )
                              }
                            >
                              <DownloadRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              record.factura_pdf_disponible
                                ? "Ver factura PDF"
                                : "Subir factura PDF"
                            }
                          >
                            {record.factura_pdf_disponible ? (
                              <IconButton
                                size="small"
                                disabled={
                                  activeFileAction ===
                                  `invoice-pdf-view-${record.id}`
                                }
                                onClick={() =>
                                  void showPdfInModal(
                                    `invoice-pdf-view-${record.id}`,
                                    `Factura ${
                                      record.folio ??
                                      record.id
                                    }`,
                                    buildInvoicePdfFileName(
                                      record,
                                    ),
                                    () =>
                                      viewSuperAdminClientHistoryInvoicePdf(
                                        record.id,
                                      ),
                                  )
                                }
                              >
                                <ReceiptLongRoundedIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                component="label"
                                disabled={
                                  activeFileAction ===
                                  `invoice-pdf-upload-${record.id}`
                                }
                              >
                                <UploadFileRoundedIcon fontSize="small" />

                                <input
                                  hidden
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={(
                                    event,
                                  ) => {
                                    const file =
                                      event.target
                                        .files?.[0] ??
                                      null;

                                    void handleInvoicePdfUpload(
                                      record,
                                      file,
                                    );

                                    event.target.value =
                                      "";
                                  }}
                                />
                              </IconButton>
                            )}
                          </Tooltip>

                          {record.factura_pdf_disponible ? (
                            <Tooltip title="Sustituir factura PDF">
                              <IconButton
                                size="small"
                                component="label"
                                disabled={
                                  activeFileAction ===
                                  `invoice-pdf-upload-${record.id}`
                                }
                              >
                                <UploadFileRoundedIcon fontSize="small" />

                                <input
                                  hidden
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={(
                                    event,
                                  ) => {
                                    const file =
                                      event.target
                                        .files?.[0] ??
                                      null;

                                    void handleInvoicePdfUpload(
                                      record,
                                      file,
                                    );

                                    event.target.value =
                                      "";
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          ) : null}

                          <Tooltip
                            title={
                              record.xml_disponible
                                ? "Ver XML"
                                : "Cargar XML"
                            }
                          >
                            {record.xml_disponible ? (
                              <IconButton
                                size="small"
                                disabled={
                                  activeFileAction ===
                                  `xml-view-${record.id}`
                                }
                                onClick={() =>
                                  void showXmlInModal(record)
                                }
                              >
                                <DescriptionRoundedIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                component="label"
                                disabled={
                                  activeFileAction ===
                                  `xml-upload-${record.id}`
                                }
                              >
                                <AttachFileRoundedIcon fontSize="small" />

                                <input
                                  hidden
                                  type="file"
                                  accept=".xml,application/xml,text/xml"
                                  onChange={(
                                    event,
                                  ) => {
                                    const file =
                                      event.target
                                        .files?.[0] ??
                                      null;

                                    void handleXmlUpload(
                                      record,
                                      file,
                                    );

                                    event.target.value =
                                      "";
                                  }}
                                />
                              </IconButton>
                            )}
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              spacing={2}
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
              }}
            >
              {records.map((record) => (
                <Card
                  variant="outlined"
                  key={record.id}
                  sx={{
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={900}
                            noWrap
                          >
                            {record.producto_nombre}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {fullName(
                              record.cliente,
                            )}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={statusLabel(
                            record.status,
                          )}
                          color={statusColor(
                            record.status,
                          )}
                        />
                      </Stack>

                      <Typography
                        variant="h5"
                        fontWeight={900}
                      >
                        {formatCurrency(
                          record.importe,
                        )}
                      </Typography>

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Cantidad
                          </Typography>

                          <Typography
                            fontWeight={800}
                          >
                            {asNumber(
                              record.cantidad,
                            )}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Método de pago
                          </Typography>

                          <Typography
                            fontWeight={800}
                          >
                            {record.metodo_pago
                              ?.nombre ??
                              "No especificado"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Fecha
                          </Typography>

                          <Typography
                            fontWeight={800}
                          >
                            {formatDate(
                              record.fecha_operacion,
                            )}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Divider />

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <VisibilityRoundedIcon />
                          }
                          onClick={() =>
                            setDetail(record)
                          }
                        >
                          Detalle
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <PictureAsPdfRoundedIcon />
                          }
                          onClick={() =>
                            void showPdfInModal(
                              `pdf-view-${record.id}`,
                              `Comprobante ${
                                record.folio ??
                                record.id
                              }`,
                              buildPdfFileName(
                                record,
                              ),
                              () =>
                                viewSuperAdminClientHistoryPdf(
                                  record.id,
                                ),
                            )
                          }
                        >
                          Ver PDF
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <DownloadRoundedIcon />
                          }
                          onClick={() =>
                            void executeFileAction(
                              `pdf-download-${record.id}`,
                              () =>
                                downloadSuperAdminClientHistoryPdf(
                                  record.id,
                                  buildPdfFileName(
                                    record,
                                  ),
                                ),
                            )
                          }
                        >
                          Descargar
                        </Button>

                        {record.factura_pdf_disponible ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <ReceiptLongRoundedIcon />
                              }
                              onClick={() =>
                                void showPdfInModal(
                                  `invoice-pdf-view-${record.id}`,
                                  `Factura ${
                                    record.folio ??
                                    record.id
                                  }`,
                                  buildInvoicePdfFileName(
                                    record,
                                  ),
                                  () =>
                                    viewSuperAdminClientHistoryInvoicePdf(
                                      record.id,
                                    ),
                                )
                              }
                            >
                              Ver factura
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <DownloadRoundedIcon />
                              }
                              onClick={() =>
                                void executeFileAction(
                                  `invoice-pdf-download-${record.id}`,
                                  () =>
                                    downloadSuperAdminClientHistoryInvoicePdf(
                                      record.id,
                                      buildInvoicePdfFileName(
                                        record,
                                      ),
                                    ),
                                )
                              }
                            >
                              Descargar factura
                            </Button>

                            <Button
                              component="label"
                              size="small"
                              variant="outlined"
                              startIcon={
                                <UploadFileRoundedIcon />
                              }
                            >
                              Sustituir factura

                              <input
                                hidden
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(
                                  event,
                                ) => {
                                  const file =
                                    event.target
                                      .files?.[0] ??
                                    null;

                                  void handleInvoicePdfUpload(
                                    record,
                                    file,
                                  );

                                  event.target.value =
                                    "";
                                }}
                              />
                            </Button>
                          </>
                        ) : (
                          <Button
                            component="label"
                            size="small"
                            variant="outlined"
                            startIcon={
                              <UploadFileRoundedIcon />
                            }
                          >
                            Subir factura PDF

                            <input
                              hidden
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(
                                event,
                              ) => {
                                const file =
                                  event.target
                                    .files?.[0] ??
                                  null;

                                void handleInvoicePdfUpload(
                                  record,
                                  file,
                                );

                                event.target.value =
                                  "";
                              }}
                            />
                          </Button>
                        )}

                        {record.xml_disponible ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <DescriptionRoundedIcon />
                              }
                              onClick={() =>
                                void showXmlInModal(record)
                              }
                            >
                              Ver XML
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <DownloadRoundedIcon />
                              }
                              onClick={() =>
                                void executeFileAction(
                                  `xml-download-${record.id}`,
                                  () =>
                                    downloadSuperAdminClientHistoryXml(
                                      record.id,
                                      buildXmlFileName(
                                        record,
                                      ),
                                    ),
                                )
                              }
                            >
                              Descargar XML
                            </Button>
                          </>
                        ) : (
                          <Button
                            component="label"
                            size="small"
                            variant="outlined"
                            startIcon={
                              <AttachFileRoundedIcon />
                            }
                          >
                            Cargar XML

                            <input
                              hidden
                              type="file"
                              accept=".xml,application/xml,text/xml"
                              onChange={(
                                event,
                              ) => {
                                const file =
                                  event.target
                                    .files?.[0] ??
                                  null;

                                void handleXmlUpload(
                                  record,
                                  file,
                                );

                                event.target.value =
                                  "";
                              }}
                            />
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {lastPage > 1 ? (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                alignItems="center"
                spacing={1.5}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {total} movimientos
                </Typography>

                <Pagination
                  page={page}
                  count={lastPage}
                  onChange={(
                    _event,
                    nextPage,
                  ) =>
                    setPage(nextPage)
                  }
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            ) : null}
          </>
        )}
      </Stack>

      <Dialog
        open={createOpen}
        onClose={() =>
          !createSaving &&
          setCreateOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
              >
                Nuevo movimiento
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                El PDF se generará desde
                estos datos.
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                setCreateOpen(false)
              }
              disabled={createSaving}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {createError ? (
              <Alert severity="error">
                {createError}
              </Alert>
            ) : null}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Cliente
                  </InputLabel>

                  <Select
                    value={form.clienteId}
                    label="Cliente"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        clienteId: String(
                          event.target.value,
                        ),
                      }))
                    }
                  >
                    {users.map((user) => (
                      <MenuItem
                        value={String(
                          user.id,
                        )}
                        key={user.id}
                      >
                        {fullName(user)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Producto
                  </InputLabel>

                  <Select
                    value={form.productoId}
                    label="Producto"
                    onChange={(event) =>
                      handleProductChange(
                        String(
                          event.target.value,
                        ),
                      )
                    }
                  >
                    {products.map(
                      (product) => (
                        <MenuItem
                          value={String(
                            product.id,
                          )}
                          key={product.id}
                        >
                          {product.name} —{" "}
                          {formatCurrency(
                            product.precio,
                          )}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Método de pago
                  </InputLabel>

                  <Select
                    value={
                      form.metodoPagoId
                    }
                    label="Método de pago"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        metodoPagoId: String(
                          event.target.value,
                        ),
                      }))
                    }
                  >
                    {activePaymentMethods.map(
                      (method) => (
                        <MenuItem
                          value={String(
                            method.id,
                          )}
                          key={method.id}
                        >
                          {method.nombre}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Estatus
                  </InputLabel>

                  <Select
                    value={form.status}
                    label="Estatus"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status:
                          event.target
                            .value as ClientHistoryStatus,
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map(
                      (option) => (
                        <MenuItem
                          value={option.value}
                          key={option.value}
                        >
                          {option.label}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  value={form.cantidad}
                  inputProps={{
                    min: 0.01,
                    step: 0.01,
                  }}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cantidad:
                        event.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Precio unitario"
                  value={
                    form.precioUnitario
                  }
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      precioUnitario:
                        event.target.value,
                    }))
                  }
                  helperText={
                    selectedProduct
                      ? `Precio actual: ${formatCurrency(
                          selectedProduct.precio,
                        )}`
                      : "Selecciona un producto."
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Importe"
                  value={formatCurrency(
                    estimatedTotal,
                  )}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Fecha de operación"
                  value={
                    form.fechaOperacion
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fechaOperacion:
                        event.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Folio"
                  value={form.folio}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      folio:
                        event.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Concepto"
                  value={form.concepto}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      concepto:
                        event.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="UUID fiscal"
                  value={form.uuidFiscal}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      uuidFiscal:
                        event.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Observaciones"
                  value={
                    form.observaciones
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      observaciones:
                        event.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setCreateOpen(false)
            }
            disabled={createSaving}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleCreate()
            }
            disabled={createSaving}
            startIcon={
              createSaving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <AddRoundedIcon />
              )
            }
          >
            Guardar movimiento
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Detalle del movimiento
        </DialogTitle>

        <DialogContent dividers>
          {detail ? (
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                  >
                    {detail.producto_nombre}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    {fullName(
                      detail.cliente,
                    )}
                  </Typography>
                </Box>

                <Chip
                  label={statusLabel(
                    detail.status,
                  )}
                  color={statusColor(
                    detail.status,
                  )}
                />
              </Stack>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Cantidad
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {asNumber(
                      detail.cantidad,
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Precio unitario
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {formatCurrency(
                      detail.precio_unitario,
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Importe
                  </Typography>

                  <Typography
                    fontWeight={900}
                  >
                    {formatCurrency(
                      detail.importe,
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Método de pago
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {detail.metodo_pago
                      ?.nombre ??
                      "No especificado"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Fecha
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {formatDate(
                      detail.fecha_operacion,
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Concepto
                  </Typography>

                  <Typography>
                    {detail.concepto ??
                      "Sin concepto"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Observaciones
                  </Typography>

                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {detail.observaciones ??
                      "Sin observaciones"}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDetail(null)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(pdfPreview)}
        onClose={() =>
          setPdfPreview(null)
        }
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            height: {
              xs: "92vh",
              md: "88vh",
            },
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
            >
              <PictureAsPdfRoundedIcon
                color="error"
              />

              <Typography
                variant="h6"
                fontWeight={900}
              >
                {pdfPreview?.title ??
                  "Documento PDF"}
              </Typography>
            </Stack>

            <IconButton
              onClick={() =>
                setPdfPreview(null)
              }
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,
            display: "flex",
            minHeight: 0,
            bgcolor: "grey.100",
          }}
        >
          {pdfPreview ? (
            <Box
              component="iframe"
              src={pdfPreview.url}
              title={pdfPreview.title}
              sx={{
                width: "100%",
                height: "100%",
                minHeight: {
                  xs: "70vh",
                  md: "74vh",
                },
                border: 0,
                bgcolor: "background.paper",
              }}
            />
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",
          }}
        >
          {pdfPreview ? (
            <Button
              component="a"
              href={pdfPreview.url}
              download={pdfPreview.fileName}
              startIcon={
                <DownloadRoundedIcon />
              }
            >
              Descargar
            </Button>
          ) : (
            <Box />
          )}

          <Button
            onClick={() =>
              setPdfPreview(null)
            }
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(xmlPreview)}
        onClose={() =>
          setXmlPreview(null)
        }
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            height: {
              xs: "92vh",
              md: "88vh",
            },
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
            >
              <DescriptionRoundedIcon
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={900}
              >
                {xmlPreview?.title ??
                  "Documento XML"}
              </Typography>
            </Stack>

            <IconButton
              onClick={() =>
                setXmlPreview(null)
              }
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,
            minHeight: 0,
            bgcolor: "grey.100",
          }}
        >
          {xmlPreview ? (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2.5,
                height: "100%",
                minHeight: {
                  xs: "70vh",
                  md: "74vh",
                },
                overflow: "auto",
                bgcolor: "background.paper",
                color: "text.primary",
                fontFamily:
                  "Consolas, Monaco, monospace",
                fontSize: "0.78rem",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {xmlPreview.content}
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",
          }}
        >
          {xmlPreview ? (
            <Button
              startIcon={
                <DownloadRoundedIcon />
              }
              disabled={
                activeFileAction ===
                `xml-download-${xmlPreview.recordId}`
              }
              onClick={() =>
                void executeFileAction(
                  `xml-download-${xmlPreview.recordId}`,
                  () =>
                    downloadSuperAdminClientHistoryXml(
                      xmlPreview.recordId,
                      xmlPreview.fileName,
                    ),
                )
              }
            >
              Descargar XML
            </Button>
          ) : (
            <Box />
          )}

          <Button
            onClick={() =>
              setXmlPreview(null)
            }
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={paymentMethodsOpen}
        onClose={() =>
          !paymentMethodSaving &&
          setPaymentMethodsOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
              >
                Métodos de pago
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Crea, edita, activa o
                desactiva métodos.
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                setPaymentMethodsOpen(
                  false,
                )
              }
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {paymentMethodError ? (
              <Alert severity="error">
                {paymentMethodError}
              </Alert>
            ) : null}

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
              }}
            >
              <Typography
                fontWeight={900}
                mb={2}
              >
                {paymentMethodForm.id ===
                null
                  ? "Nuevo método"
                  : "Editar método"}
              </Typography>

              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={
                      paymentMethodForm.nombre
                    }
                    onChange={(event) =>
                      setPaymentMethodForm(
                        (current) => ({
                          ...current,
                          nombre:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={
                      paymentMethodForm.descripcion
                    }
                    onChange={(event) =>
                      setPaymentMethodForm(
                        (current) => ({
                          ...current,
                          descripcion:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={2}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    height="100%"
                    alignItems="center"
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() =>
                        void savePaymentMethod()
                      }
                      disabled={
                        paymentMethodSaving
                      }
                    >
                      Guardar
                    </Button>

                    {paymentMethodForm.id !==
                    null ? (
                      <IconButton
                        onClick={
                          openNewPaymentMethod
                        }
                      >
                        <RefreshRoundedIcon />
                      </IconButton>
                    ) : null}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Stack spacing={1.25}>
              {paymentMethods.map(
                (method) => (
                  <Paper
                    variant="outlined"
                    key={method.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
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
                    >
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <Typography
                            fontWeight={900}
                          >
                            {method.nombre}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              method.activo
                                ? "Activo"
                                : "Inactivo"
                            }
                            color={
                              method.activo
                                ? "success"
                                : "default"
                            }
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {method.descripcion ??
                            "Sin descripción"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {method.historiales_count ??
                            0}{" "}
                          movimientos relacionados
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        spacing={0.5}
                      >
                        <Switch
                          checked={method.activo}
                          onChange={() =>
                            void togglePaymentMethod(
                              method,
                            )
                          }
                        />

                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() =>
                              openEditPaymentMethod(
                                method,
                              )
                            }
                          >
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <span>
                            <IconButton
                              disabled={
                                method.historiales_count >
                                0
                              }
                              onClick={() =>
                                void removePaymentMethod(
                                  method,
                                )
                              }
                            >
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                ),
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setPaymentMethodsOpen(false)
            }
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
