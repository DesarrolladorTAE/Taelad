import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Autocomplete,
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
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import {
  alpha,
  useTheme,
} from "@mui/material/styles";

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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  getSuperAdminUsers,
  searchSuperAdminClientHistoryClients,
  searchSuperAdminClientHistoryProducts,
  updateSuperAdminPaymentMethod,
  updateSuperAdminPaymentMethodStatus,
  uploadSuperAdminClientHistoryInvoicePdf,
  uploadSuperAdminClientHistoryXml,
  viewSuperAdminClientHistoryInvoicePdf,
  viewSuperAdminClientHistoryPdf,
  viewSuperAdminClientHistoryXml,
  type ClientHistoryClientSearchItem,
  type ClientHistoryMonthlySummary,
  type ClientHistoryProductSearchItem,
  type ClientHistoryRecord,
  type ClientHistoryStatus,
  type SuperAdminPaymentMethod,
} from "../../../../services/superadminService";

type Props = {
  systemName: string;
  onBack: () => void;
};

type UserOption =
  ClientHistoryClientSearchItem;

type HistoryFormState = {
  clienteId: string;
  productoId: string;
  metodoPagoId: string;
  concepto: string;
  cantidad: string;
  precioUnitario: string;
  status: ClientHistoryStatus | "";
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

const desktopActionIconSx =
  (
    tone:
      | "primary"
      | "error"
      | "warning"
      | "success",
  ) =>
  (theme: any) => ({
    width: 34,
    height: 34,
    borderRadius: 2.25,
    border: 0,
    color: theme.palette[tone].main,
    backgroundColor: alpha(
      theme.palette[tone].main,
      theme.palette.mode === "dark"
        ? 0.16
        : 0.09,
    ),
    transition: "0.18s ease",
    "&:hover": {
      backgroundColor: alpha(
        theme.palette[tone].main,
        theme.palette.mode === "dark"
          ? 0.26
          : 0.16,
      ),
      transform: "translateY(-1px)",
    },
  });

function statusDotColor(
  status: string,
): "success" | "error" | "warning" | "info" {
  const normalized =
    status.toLowerCase().trim();

  if (normalized === "pagado") {
    return "success";
  }

  if (
    normalized === "cancelado" ||
    normalized === "rechazado" ||
    normalized === "vencido"
  ) {
    return "error";
  }

  if (
    normalized === "pendiente" ||
    normalized === "facturado"
  ) {
    return "warning";
  }

  return "info";
}

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
    cantidad: "",
    precioUnitario: "",
    status: "",
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
  const theme = useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down("sm"),
    );

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

  const [productSearchInput, setProductSearchInput] =
    useState("");

  const [productOptions, setProductOptions] =
    useState<ClientHistoryProductSearchItem[]>([]);

  const [productSearchLoading, setProductSearchLoading] =
    useState(false);

  const [productAutocompleteOpen, setProductAutocompleteOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<ClientHistoryProductSearchItem | null>(null);

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

  const [fieldHelpOpen, setFieldHelpOpen] =
    useState(false);

  const [clientSearchInput, setClientSearchInput] =
    useState("");

  const [clientOptions, setClientOptions] =
    useState<UserOption[]>([]);

  const [clientSearchLoading, setClientSearchLoading] =
    useState(false);

  const [clientAutocompleteOpen, setClientAutocompleteOpen] =
    useState(false);

  const [selectedClient, setSelectedClient] =
    useState<UserOption | null>(null);

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

  const loadCatalogs =
    useCallback(async () => {
      setCatalogLoading(true);

      try {
        const [
          usersResponse,
          methodsResponse,
        ] = await Promise.all([
          getSuperAdminUsers({
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
    if (!createOpen) {
      return;
    }

    const term =
      clientSearchInput.trim();

    if (
      selectedClient &&
      term === fullName(selectedClient)
    ) {
      return;
    }

    if (term.length < 3) {
      setClientOptions([]);
      setClientSearchLoading(false);
      return;
    }

    let active = true;

    const timer = window.setTimeout(
      async () => {
        try {
          setClientSearchLoading(true);

          const response =
            await searchSuperAdminClientHistoryClients(
              term,
            );

          if (!active) {
            return;
          }

          setClientOptions(
            response.data ?? [],
          );
        } catch (searchError) {
          if (!active) {
            return;
          }

          setClientOptions([]);
          setCreateError(
            errorMessage(
              searchError,
              "No fue posible buscar clientes.",
            ),
          );
        } finally {
          if (active) {
            setClientSearchLoading(false);
          }
        }
      },
      450,
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    clientSearchInput,
    createOpen,
    selectedClient,
  ]);

  useEffect(() => {
    if (!createOpen) {
      return;
    }

    const term =
      productSearchInput.trim();

    if (
      selectedProduct &&
      term === selectedProduct.name
    ) {
      return;
    }

    if (term.length < 3) {
      setProductOptions([]);
      setProductSearchLoading(false);
      return;
    }

    let active = true;

    const timer = window.setTimeout(
      async () => {
        try {
          setProductSearchLoading(true);

          const response =
            await searchSuperAdminClientHistoryProducts(
              term,
            );

          if (!active) {
            return;
          }

          setProductOptions(
            response.data ?? [],
          );
        } catch (searchError) {
          if (!active) {
            return;
          }

          setProductOptions([]);
          setCreateError(
            errorMessage(
              searchError,
              "No fue posible buscar productos.",
            ),
          );
        } finally {
          if (active) {
            setProductSearchLoading(false);
          }
        }
      },
      450,
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    createOpen,
    productSearchInput,
    selectedProduct,
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
    setSelectedClient(null);
    setClientSearchInput("");
    setClientOptions([]);
    setClientSearchLoading(false);
    setClientAutocompleteOpen(false);

    setSelectedProduct(null);
    setProductSearchInput("");
    setProductOptions([]);
    setProductSearchLoading(false);
    setProductAutocompleteOpen(false);

    const next =
      emptyHistoryForm();

    setForm(next);
    setCreateOpen(true);
  }

  function handleProductChange(
    product:
      | ClientHistoryProductSearchItem
      | null,
  ) {
    setSelectedProduct(product);

    setProductSearchInput(
      product?.name ?? "",
    );

    setForm((current) => ({
      ...current,
      productoId: product
        ? String(product.id)
        : "",
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
      !form.metodoPagoId ||
      !form.status
    ) {
      setCreateError(
        "Selecciona cliente, producto, método de pago y estatus.",
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
        status:
          form.status as ClientHistoryStatus,
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

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                variant="h4"
                fontWeight={900}
              >
                Historial de ventas
              </Typography>

              <Typography
                color="text.secondary"
              >
                {systemName}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
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
            <Paper
              variant="outlined"
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                borderRadius: 3.5,
                overflow: "hidden",
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={(theme) => ({
                  display: "grid",
                  gridTemplateColumns:
                    "140px minmax(180px, 1.35fr) minmax(145px, 1fr) 54px minmax(150px, .9fr) 180px",
                  alignItems: "center",
                  columnGap: 1.5,
                  px: 2,
                  py: 1.35,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    0.045,
                  ),
                  borderBottom: "1px solid",
                  borderColor: "divider",
                })}
              >
                {[
                  "Fecha",
                  "Cliente",
                  "Producto",
                  "Cant.",
                  "Importe / pago",
                  "Acciones",
                ].map((label) => (
                  <Typography
                    key={label}
                    variant="caption"
                    fontWeight={900}
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      textAlign:
                        label === "Cant." ||
                        label === "Acciones"
                          ? "center"
                          : "left",
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider flexItem />}>
                {records.map((record) => (
                  <Box
                    key={record.id}
                    sx={(theme) => ({
                      display: "grid",
                      gridTemplateColumns:
                        "140px minmax(180px, 1.35fr) minmax(145px, 1fr) 54px minmax(150px, .9fr) 180px",
                      alignItems: "center",
                      columnGap: 1.5,
                      px: 2,
                      py: 1.55,
                      transition: "0.16s ease",
                      "&:hover": {
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          0.025,
                        ),
                      },
                    })}
                  >
                    <Stack spacing={0.55}>
                      <Stack
                        direction="row"
                        spacing={0.85}
                        alignItems="center"
                      >
                        <Tooltip
                          title={statusLabel(
                            record.status,
                          )}
                          arrow
                        >
                          <Box
                            component="span"
                            sx={{
                              width: 9,
                              height: 9,
                              flexShrink: 0,
                              borderRadius: "50%",
                              bgcolor: `${statusDotColor(
                                record.status,
                              )}.main`,
                              boxShadow: (theme) =>
                                `0 0 0 4px ${alpha(
                                  theme.palette[
                                    statusDotColor(
                                      record.status,
                                    )
                                  ].main,
                                  0.12,
                                )}`,
                            }}
                          />
                        </Tooltip>

                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ lineHeight: 1.25 }}
                        >
                          {formatDate(
                            record.fecha_operacion,
                          )}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {record.folio
                          ? `Folio: ${record.folio}`
                          : `Movimiento #${record.id}`}
                      </Typography>
                    </Stack>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={900}
                        sx={{
                          lineHeight: 1.3,
                          mb: 0.35,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {fullName(
                          record.cliente,
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          lineHeight: 1.3,
                          wordBreak: "break-word",
                        }}
                      >
                        {record.cliente?.email ??
                          "Sin correo"}
                      </Typography>
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={900}
                        sx={{ mb: 0.35 }}
                      >
                        {record.producto_nombre}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {record.concepto ??
                          "Sin concepto"}
                      </Typography>
                    </Box>

                    <Box
                      sx={(theme) => ({
                        width: 34,
                        height: 30,
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          0.07,
                        ),
                        fontWeight: 900,
                      })}
                    >
                      {asNumber(record.cantidad)}
                    </Box>

                    <Stack spacing={0.55}>
                      <Typography
                        variant="body1"
                        fontWeight={900}
                      >
                        {formatCurrency(
                          record.importe,
                        )}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor: (theme) =>
                              alpha(
                                theme.palette.success.main,
                                0.11,
                              ),
                            color: "success.main",
                          }}
                        >
                          <PaymentsRoundedIcon
                            sx={{ fontSize: 14 }}
                          />
                        </Avatar>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.25 }}
                        >
                          {record.metodo_pago?.nombre ??
                            "No especificado"}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      spacing={0.45}
                      sx={{
                        flexWrap: "nowrap",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip title="Ver detalle" arrow>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDetail(record)
                          }
                          sx={desktopActionIconSx(
                            "primary",
                          )}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title="Ver comprobante PDF"
                        arrow
                      >
                        <span>
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
                            sx={desktopActionIconSx(
                              "error",
                            )}
                          >
                            {activeFileAction ===
                            `pdf-view-${record.id}` ? (
                              <CircularProgress
                                size={15}
                                color="inherit"
                              />
                            ) : (
                              <PictureAsPdfRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>

                      {record.factura_pdf_disponible ? (
                        <Tooltip
                          title="Ver factura PDF"
                          arrow
                        >
                          <span>
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
                              sx={desktopActionIconSx(
                                "warning",
                              )}
                            >
                              <ReceiptLongRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title="Subir factura PDF"
                          arrow
                        >
                          <IconButton
                            component="label"
                            size="small"
                            disabled={
                              activeFileAction ===
                              `invoice-pdf-upload-${record.id}`
                            }
                            sx={desktopActionIconSx(
                              "warning",
                            )}
                          >
                            <UploadFileRoundedIcon fontSize="small" />

                            <input
                              hidden
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(event) => {
                                const file =
                                  event.target.files?.[0] ??
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
                      )}

                      {record.xml_disponible ? (
                        <Tooltip title="Ver XML" arrow>
                          <span>
                            <IconButton
                              size="small"
                              disabled={
                                activeFileAction ===
                                `xml-view-${record.id}`
                              }
                              onClick={() =>
                                void showXmlInModal(
                                  record,
                                )
                              }
                              sx={desktopActionIconSx(
                                "success",
                              )}
                            >
                              <DescriptionRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Subir XML" arrow>
                          <IconButton
                            component="label"
                            size="small"
                            disabled={
                              activeFileAction ===
                              `xml-upload-${record.id}`
                            }
                            sx={desktopActionIconSx(
                              "success",
                            )}
                          >
                            <AttachFileRoundedIcon fontSize="small" />

                            <input
                              hidden
                              type="file"
                              accept=".xml,application/xml,text/xml"
                              onChange={(event) => {
                                const file =
                                  event.target.files?.[0] ??
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
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>

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

                        <Tooltip
                          title={statusLabel(
                            record.status,
                          )}
                          arrow
                        >
                          <Box
                            component="span"
                            sx={{
                              width: 10,
                              height: 10,
                              mt: 0.6,
                              flexShrink: 0,
                              borderRadius: "50%",
                              bgcolor: `${statusDotColor(
                                record.status,
                              )}.main`,
                              boxShadow: (theme) =>
                                `0 0 0 4px ${alpha(
                                  theme.palette[
                                    statusDotColor(
                                      record.status,
                                    )
                                  ].main,
                                  0.12,
                                )}`,
                            }}
                          />
                        </Tooltip>
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
                        spacing={0.75}
                        useFlexGap
                        flexWrap="nowrap"
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Ver detalle" arrow>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDetail(record)
                            }
                            sx={desktopActionIconSx(
                              "primary",
                            )}
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title="Ver comprobante PDF"
                          arrow
                        >
                          <IconButton
                            size="small"
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
                            sx={desktopActionIconSx(
                              "error",
                            )}
                          >
                            <PictureAsPdfRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {record.factura_pdf_disponible ? (
                          <Tooltip title="Ver factura PDF" arrow>
                            <IconButton
                              size="small"
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
                              sx={desktopActionIconSx(
                                "warning",
                              )}
                            >
                              <ReceiptLongRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Subir factura PDF" arrow>
                            <IconButton
                              component="label"
                              size="small"
                              sx={desktopActionIconSx(
                                "warning",
                              )}
                            >
                              <UploadFileRoundedIcon fontSize="small" />
                              <input
                                hidden
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(event) => {
                                  const file =
                                    event.target.files?.[0] ??
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
                        )}

                        {record.xml_disponible ? (
                          <Tooltip title="Ver XML" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                void showXmlInModal(
                                  record,
                                )
                              }
                              sx={desktopActionIconSx(
                                "success",
                              )}
                            >
                              <DescriptionRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Subir XML" arrow>
                            <IconButton
                              component="label"
                              size="small"
                              sx={desktopActionIconSx(
                                "success",
                              )}
                            >
                              <AttachFileRoundedIcon fontSize="small" />
                              <input
                                hidden
                                type="file"
                                accept=".xml,application/xml,text/xml"
                                onChange={(event) => {
                                  const file =
                                    event.target.files?.[0] ??
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
                          </Tooltip>
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
        fullScreen={isMobile}
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          sx: (theme) => ({
            borderRadius: {
              xs: 0,
              sm: 4,
            },
            width: {
              xs: "100%",
              sm: "auto",
            },
            height: {
              xs: "100dvh",
              sm: "auto",
            },
            maxHeight: {
              xs: "100dvh",
              sm: "calc(100% - 64px)",
            },
            m: {
              xs: 0,
              sm: 2,
            },
            overflow: "hidden",
            border: 0,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#090c11"
                : theme.palette.background.paper,
            boxShadow:
              isMobile
                ? "none"
                : theme.palette.mode === "dark"
                  ? "0 26px 70px rgba(0, 0, 0, 0.48)"
                  : "0 26px 70px rgba(15, 23, 42, 0.18)",
          }),
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            px: {
              xs: 2,
              sm: 3,
            },
            py: {
              xs: 1.5,
              sm: 2.25,
            },
            borderBottom: {
              xs: "1px solid",
              sm: 0,
            },
            borderColor:
              theme.palette.mode === "dark"
                ? "#202730"
                : theme.palette.divider,
            position: {
              xs: "sticky",
              sm: "static",
            },
            top: 0,
            zIndex: 5,
            background:
              theme.palette.mode === "dark"
                ? "#090c11"
              : `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.12,
                )}, ${alpha(
                  theme.palette.primary.main,
                  0.025,
                )})`,
          })}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                sx={(theme) => ({
                  color:
                    theme.palette.mode === "dark"
                      ? "#f3f6fa"
                      : theme.palette.text.primary,
                })}
              >
                Nuevo movimiento
              </Typography>

              <Typography
                variant="body2"
                color={
                  createSaving
                    ? "text.secondary"
                    : undefined
                }
                sx={(theme) => ({
                  color:
                    theme.palette.mode === "dark"
                      ? "#929aa6"
                      : theme.palette.text.secondary,
                })}
              >
                Registra la venta y genera su comprobante.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<InfoOutlinedIcon />}
                onClick={() =>
                  setFieldHelpOpen(true)
                }
                sx={(theme) => ({
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 800,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "#384351"
                      : undefined,
                  color:
                    theme.palette.mode === "dark"
                      ? "#b9c1cb"
                      : undefined,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "#10151c"
                      : undefined,
                  "&:hover": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#4c5a6b"
                        : undefined,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "#141b24"
                        : undefined,
                  },
                })}
              >
                Ayuda de campos
              </Button>

              <IconButton
                onClick={() =>
                  setCreateOpen(false)
                }
                disabled={createSaving}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent
          onScroll={(event) => {
            if (
              event.currentTarget ===
              event.target
            ) {
              setClientAutocompleteOpen(
                false,
              );
              setProductAutocompleteOpen(
                false,
              );
            }
          }}
          sx={(theme) => ({
            px: {
              xs: 1.5,
              sm: 3,
            },
            py: {
              xs: 1.5,
              sm: 3,
            },
            pb: {
              xs: 3,
              sm: 3,
            },
            border: 0,
            overflowY: "auto",
            WebkitOverflowScrolling:
              "touch",
            overscrollBehavior:
              "contain",
            bgcolor:
              theme.palette.mode === "dark"
                ? "#090c11"
                : alpha(
                    theme.palette.primary.main,
                    0.018,
                  ),
            ...(theme.palette.mode === "dark"
              ? {
                  "& .MuiInputLabel-root": {
                    color: "#aeb6c2",
                    fontWeight: 600,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#64a8e8",
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#7f8997",
                  },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#11161d",
                    borderRadius: 2.25,
                    transition: "0.16s ease",
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#eef2f7",
                  },
                  "& .MuiSelect-select": {
                    color: "#eef2f7",
                  },
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2b3440",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#46515f",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4d9ad6",
                    borderWidth: 1,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    bgcolor: "#121922",
                    boxShadow: `0 0 0 2px ${alpha(
                      "#4d9ad6",
                      0.08,
                    )}`,
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#8c97a5",
                  },
                  "& .MuiTypography-body2, & .MuiTypography-caption": {
                    color: "#8d96a3",
                  },
                }
              : {}),
          })}
        >
          <Stack
            spacing={{
              xs: 1.5,
              sm: 2.5,
            }}
          >
            {createError ? (
              <Alert severity="error">
                {createError}
              </Alert>
            ) : null}

            <Paper
              elevation={0}
              sx={(theme) => ({
                p: {
                  xs: 1.5,
                  sm: 2.25,
                },
                borderRadius: {
                  xs: 2.25,
                  sm: 3,
                },
                border: 0,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#0f141b"
                    : alpha(
                        theme.palette.primary.main,
                        0.025,
                      ),
              })}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={1.75}
              >
                <Box
                  sx={{
                    width: 3,
                    height: 22,
                    borderRadius: 999,
                    bgcolor: "primary.main",
                  }}
                />

                <Typography
                  fontWeight={900}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#e7ebf0"
                        : theme.palette.text.primary,
                  })}
                >
                  Cliente y producto
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Autocomplete<UserOption, false, false, false>
                    disablePortal
                    openOnFocus={false}
                    open={
                      clientAutocompleteOpen &&
                      clientSearchInput.trim().length >= 3
                    }
                    onOpen={() => {
                      if (
                        clientSearchInput.trim().length >= 3
                      ) {
                        setClientAutocompleteOpen(true);
                      }
                    }}
                    onClose={() =>
                      setClientAutocompleteOpen(false)
                    }
                    value={selectedClient}
                    options={clientOptions}
                    loading={clientSearchLoading}
                    inputValue={clientSearchInput}
                    filterOptions={(options) =>
                      options
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionLabel={(option) =>
                      fullName(option)
                    }
                    noOptionsText="Sin coincidencias"
                    onInputChange={(
                      _event,
                      value,
                      reason,
                    ) => {
                      if (
                        reason === "input" ||
                        reason === "clear"
                      ) {
                        setClientSearchInput(
                          value,
                        );

                        setClientAutocompleteOpen(
                          value.trim().length >= 3,
                        );

                        if (reason === "clear") {
                          setSelectedClient(null);
                          setForm((current) => ({
                            ...current,
                            clienteId: "",
                          }));
                        }
                      }
                    }}
                    onChange={(_event, value) => {
                      setClientAutocompleteOpen(false);
                      setSelectedClient(value);
                      setClientSearchInput(
                        value
                          ? fullName(value)
                          : "",
                      );
                      setForm((current) => ({
                        ...current,
                        clienteId: value
                          ? String(value.id)
                          : "",
                      }));
                    }}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        key={option.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start !important",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={800}
                        >
                          {fullName(option)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {option.email ??
                            "Sin correo"}
                        </Typography>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        placeholder="Escribe 3 letras o más"
                        helperText="La búsqueda inicia a partir de 3 caracteres y espera antes de consultar."
                        inputProps={{
                          ...params.inputProps,
                          autoComplete:
                            "new-password",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {clientSearchLoading ? (
                                <CircularProgress
                                  size={18}
                                />
                              ) : null}
                              {params.InputProps
                                .endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete<
                    ClientHistoryProductSearchItem,
                    false,
                    false,
                    false
                  >
                    disablePortal
                    openOnFocus={false}
                    open={
                      productAutocompleteOpen &&
                      productSearchInput.trim().length >= 3
                    }
                    onOpen={() => {
                      if (
                        productSearchInput.trim().length >= 3
                      ) {
                        setProductAutocompleteOpen(true);
                      }
                    }}
                    onClose={() =>
                      setProductAutocompleteOpen(false)
                    }
                    value={selectedProduct}
                    options={productOptions}
                    loading={productSearchLoading}
                    inputValue={productSearchInput}
                    filterOptions={(options) =>
                      options
                    }
                    isOptionEqualToValue={(
                      option,
                      value,
                    ) =>
                      option.id === value.id
                    }
                    getOptionLabel={(option) =>
                      option.name
                    }
                    noOptionsText="Sin coincidencias"
                    onInputChange={(
                      _event,
                      value,
                      reason,
                    ) => {
                      if (
                        reason === "input" ||
                        reason === "clear"
                      ) {
                        setProductSearchInput(
                          value,
                        );

                        setProductAutocompleteOpen(
                          value.trim().length >= 3,
                        );

                        if (
                          reason === "clear"
                        ) {
                          handleProductChange(
                            null,
                          );
                        }
                      }
                    }}
                    onChange={(
                      _event,
                      value,
                    ) => {
                      setProductAutocompleteOpen(false);
                      handleProductChange(
                        value,
                      );
                    }}
                    renderOption={(
                      props,
                      option,
                    ) => (
                      <Box
                        component="li"
                        {...props}
                        key={option.id}
                        sx={{
                          display: "flex",
                          flexDirection:
                            "column",
                          alignItems:
                            "flex-start !important",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={800}
                        >
                          {option.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatCurrency(
                            option.precio,
                          )}
                        </Typography>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Producto"
                        placeholder="Escribe 3 letras o más"
                        helperText="La búsqueda inicia a partir de 3 caracteres y espera antes de consultar."
                        inputProps={{
                          ...params.inputProps,
                          autoComplete:
                            "new-password",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {productSearchLoading ? (
                                <CircularProgress
                                  size={18}
                                />
                              ) : null}

                              {
                                params
                                  .InputProps
                                  .endAdornment
                              }
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={(theme) => ({
                p: {
                  xs: 1.5,
                  sm: 2.25,
                },
                borderRadius: {
                  xs: 2.25,
                  sm: 3,
                },
                border: 0,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#0f141b"
                    : alpha(
                        theme.palette.primary.main,
                        0.025,
                      ),
              })}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={1.75}
              >
                <Box
                  sx={{
                    width: 3,
                    height: 22,
                    borderRadius: 999,
                    bgcolor: "primary.main",
                  }}
                />

                <Typography
                  fontWeight={900}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#e7ebf0"
                        : theme.palette.text.primary,
                  })}
                >
                  Pago e importe
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>
                      Método de pago
                    </InputLabel>

                    <Select
                      value={form.metodoPagoId}
                      label="Método de pago"
                      inputProps={{
                        autoComplete: "off",
                        name:
                          "sale_payment_method_no_autofill",
                      }}
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
                      inputProps={{
                        autoComplete: "off",
                        name:
                          "sale_status_no_autofill",
                      }}
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
                    autoComplete="new-password"
                    name="sale_quantity_no_autofill"
                    inputProps={{
                      min: 0.01,
                      step: 0.01,
                      inputMode: "decimal",
                      autoComplete:
                        "new-password",
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
                    autoComplete="off"
                    inputProps={{
                      min: 0,
                      step: 0.01,
                      inputMode: "decimal",
                      autoComplete: "off",
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
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={(theme) => ({
                p: {
                  xs: 1.5,
                  sm: 2.25,
                },
                borderRadius: {
                  xs: 2.25,
                  sm: 3,
                },
                border: 0,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#0f141b"
                    : alpha(
                        theme.palette.primary.main,
                        0.025,
                      ),
              })}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={1.75}
              >
                <Box
                  sx={{
                    width: 3,
                    height: 22,
                    borderRadius: 999,
                    bgcolor: "primary.main",
                  }}
                />

                <Typography
                  fontWeight={900}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#e7ebf0"
                        : theme.palette.text.primary,
                  })}
                >
                  Datos del movimiento
                </Typography>
              </Stack>

              <Grid container spacing={2}>
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
                    autoComplete="off"
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
                    label="Concepto (opcional)"
                    value={form.concepto}
                    autoComplete="off"
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
                    label="UUID fiscal (opcional)"
                    value={form.uuidFiscal}
                    autoComplete="off"
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
                    label="Observaciones (opcional)"
                    value={
                      form.observaciones
                    }
                    autoComplete="off"
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
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            px: {
              xs: 1.5,
              sm: 3,
            },
            pt: {
              xs: 1.25,
              sm: 2,
            },
            pb: {
              xs:
                "calc(12px + env(safe-area-inset-bottom))",
              sm: 2,
            },
            gap: {
              xs: 1,
              sm: 0,
            },
            borderTop: {
              xs: "1px solid",
              sm: 0,
            },
            borderColor:
              theme.palette.mode === "dark"
                ? "#202730"
                : theme.palette.divider,
            position: {
              xs: "sticky",
              sm: "static",
            },
            bottom: 0,
            zIndex: 5,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#090c11"
                : theme.palette.background.paper,
          })}
        >
          <Button
            onClick={() =>
              setCreateOpen(false)
            }
            disabled={createSaving}
            sx={{
              flex: {
                xs: 1,
                sm: "initial",
              },
              minHeight: {
                xs: 44,
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
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
            sx={(theme) => ({
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 900,
              px: 2.2,
              background:
                theme.palette.mode === "dark"
                  ? "#2f80c5"
                  : undefined,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 6px 16px rgba(47, 128, 197, 0.20)"
                  : undefined,
              "&:hover": {
                background:
                  theme.palette.mode === "dark"
                    ? "#367fba"
                    : undefined,
              },
            })}
          >
            Guardar movimiento
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={fieldHelpOpen}
        onClose={() =>
          setFieldHelpOpen(false)
        }
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: (theme) => ({
            borderRadius: 3.5,
            overflow: "hidden",
            border: 0,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0b0f14"
                : theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 26px 70px rgba(0, 0, 0, 0.5)"
                : "0 24px 64px rgba(15, 23, 42, 0.16)",
          }),
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            px: 3,
            py: 2.25,
            borderBottom: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? "#222a34"
                : theme.palette.divider,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0d1218"
                : theme.palette.background.paper,
          })}
        >
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
              <Avatar
                sx={(theme) => ({
                  width: 34,
                  height: 34,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "#18222d"
                      : alpha(
                          theme.palette.primary.main,
                          0.08,
                        ),
                  color:
                    theme.palette.mode === "dark"
                      ? "#8aa9c2"
                      : theme.palette.primary.main,
                })}
              >
                <InfoOutlinedIcon
                  sx={{ fontSize: 20 }}
                />
              </Avatar>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#eef2f6"
                        : theme.palette.text.primary,
                  })}
                >
                  Ayuda de campos
                </Typography>

                <Typography
                  variant="body2"
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#8f99a6"
                        : theme.palette.text.secondary,
                  })}
                >
                  Consulta qué información corresponde a cada campo.
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={() =>
                setFieldHelpOpen(false)
              }
              sx={(theme) => ({
                color:
                  theme.palette.mode === "dark"
                    ? "#aab2bd"
                    : theme.palette.text.secondary,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#141a21"
                    : theme.palette.action.hover,
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "#1c232c"
                      : theme.palette.action.selected,
                },
              })}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={(theme) => ({
            px: 3,
            py: 1,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0b0f14"
                : theme.palette.background.paper,
          })}
        >
          {[
            [
              "Cliente",
              "Persona a la que se asociará la venta. Escribe al menos 3 letras para buscarla.",
            ],
            [
              "Producto",
              "Servicio o producto vendido al cliente.",
            ],
            [
              "Método de pago",
              "Forma utilizada para realizar el pago.",
            ],
            [
              "Estatus",
              "Situación actual de la venta: pagado, pendiente, cancelado, vencido o reembolsado.",
            ],
            [
              "Cantidad",
              "Número de unidades o servicios vendidos.",
            ],
            [
              "Precio unitario",
              "Precio aplicado por cada unidad.",
            ],
            [
              "Importe",
              "Total calculado automáticamente con cantidad × precio unitario.",
            ],
            [
              "Fecha de operación",
              "Fecha en la que se realizó o registró la venta.",
            ],
            [
              "Folio",
              "Referencia interna para identificar el movimiento.",
            ],
            [
              "Concepto (opcional)",
              "Descripción breve adicional de la venta.",
            ],
            [
              "UUID fiscal (opcional)",
              "Folio fiscal del CFDI cuando exista una factura fiscal.",
            ],
            [
              "Observaciones (opcional)",
              "Notas administrativas o información adicional.",
            ],
          ].map(
            (
              [label, description],
              index,
              items,
            ) => (
              <Box
                key={label}
                sx={(theme) => ({
                  py: 1.6,
                  display: "grid",
                  gridTemplateColumns:
                    "28px minmax(0, 1fr)",
                  gap: 1.25,
                  borderBottom:
                    index <
                    items.length - 1
                      ? "1px solid"
                      : "none",
                  borderColor:
                    theme.palette.mode ===
                    "dark"
                      ? "#1d242d"
                      : theme.palette.divider,
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: 24,
                    height: 24,
                    mt: 0.15,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    bgcolor:
                      theme.palette.mode ===
                      "dark"
                        ? "#171e26"
                        : alpha(
                            theme.palette.primary.main,
                            0.07,
                          ),
                    color:
                      theme.palette.mode ===
                      "dark"
                        ? "#91a5b6"
                        : theme.palette.primary.main,
                  })}
                >
                  {index + 1}
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={850}
                    sx={(theme) => ({
                      color:
                        theme.palette.mode ===
                        "dark"
                          ? "#e6ebf0"
                          : theme.palette.text.primary,
                    })}
                  >
                    {label}
                  </Typography>

                  <Typography
                    variant="body2"
                    mt={0.25}
                    sx={(theme) => ({
                      lineHeight: 1.5,
                      color:
                        theme.palette.mode ===
                        "dark"
                          ? "#8f99a6"
                          : theme.palette.text.secondary,
                    })}
                  >
                    {description}
                  </Typography>
                </Box>
              </Box>
            ),
          )}
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            px: 3,
            py: 1.75,
            borderTop: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? "#222a34"
                : theme.palette.divider,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0d1218"
                : theme.palette.background.paper,
          })}
        >
          <Button
            variant="contained"
            onClick={() =>
              setFieldHelpOpen(false)
            }
            sx={(theme) => ({
              minWidth: 110,
              borderRadius: 2.25,
              textTransform: "none",
              fontWeight: 800,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "#345f82"
                  : undefined,
              boxShadow: "none",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#3b6b91"
                    : undefined,
                boxShadow: "none",
              },
            })}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            px: 3,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1,
            )}, ${alpha(
              theme.palette.primary.main,
              0.025,
            )})`,
          })}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 42,
                  height: 42,
                }}
              >
                <VisibilityRoundedIcon />
              </Avatar>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  Detalle de venta
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {detail?.folio
                    ? `Folio ${detail.folio}`
                    : detail
                      ? `Movimiento #${detail.id}`
                      : ""}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={() =>
                setDetail(null)
              }
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
          }}
        >
          {detail ? (
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={(theme) => ({
                  p: 2.25,
                  borderRadius: 3,
                  border: 0,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark"
                      ? 0.09
                      : 0.04,
                  ),
                })}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  spacing={2}
                >
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={0.5}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={900}
                      >
                        {detail.producto_nombre}
                      </Typography>

                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: `${statusDotColor(
                            detail.status,
                          )}.main`,
                        }}
                      />
                    </Stack>

                    <Typography
                      color="text.secondary"
                    >
                      {fullName(
                        detail.cliente,
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: {
                        xs: "left",
                        sm: "right",
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Importe total
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {formatCurrency(
                        detail.importe,
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Grid container spacing={1.5}>
                {[
                  {
                    label: "Fecha",
                    value: formatDate(
                      detail.fecha_operacion,
                    ),
                  },
                  {
                    label: "Cantidad",
                    value: String(
                      asNumber(
                        detail.cantidad,
                      ),
                    ),
                  },
                  {
                    label:
                      "Precio unitario",
                    value: formatCurrency(
                      detail.precio_unitario,
                    ),
                  },
                  {
                    label:
                      "Método de pago",
                    value:
                      detail.metodo_pago
                        ?.nombre ??
                      "No especificado",
                  },
                ].map((item) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={item.label}
                  >
                    <Paper
                      elevation={0}
                      sx={(theme) => ({
                        p: 1.75,
                        height: "100%",
                        borderRadius: 2.5,
                        border: 0,
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark"
                            ? 0.065
                            : 0.028,
                        ),
                      })}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        mt={0.4}
                        fontWeight={800}
                      >
                        {item.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Paper
                elevation={0}
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 2.5,
                  border: 0,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark"
                      ? 0.06
                      : 0.025,
                  ),
                })}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  Concepto
                </Typography>

                <Typography
                  mt={0.5}
                >
                  {detail.concepto ??
                    "Sin concepto"}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 2.5,
                  border: 0,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark"
                      ? 0.06
                      : 0.025,
                  ),
                })}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  Observaciones
                </Typography>

                <Typography
                  mt={0.5}
                  sx={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {detail.observaciones ??
                    "Sin observaciones"}
                </Typography>
              </Paper>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            justifyContent:
              "space-between",
          }}
        >
          {detail ? (
            <Button
              variant="contained"
              startIcon={
                activeFileAction ===
                `pdf-download-${detail.id}` ? (
                  <CircularProgress
                    size={16}
                    color="inherit"
                  />
                ) : (
                  <DownloadRoundedIcon />
                )
              }
              disabled={
                activeFileAction ===
                `pdf-download-${detail.id}`
              }
              onClick={() =>
                void executeFileAction(
                  `pdf-download-${detail.id}`,
                  () =>
                    downloadSuperAdminClientHistoryPdf(
                      detail.id,
                      buildPdfFileName(
                        detail,
                      ),
                    ),
                )
              }
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 900,
              }}
            >
              Descargar comprobante
            </Button>
          ) : (
            <Box />
          )}

          <Button
            variant="outlined"
            onClick={() =>
              setDetail(null)
            }
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
            }}
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
        fullScreen={isMobile}
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          sx: (theme) => ({
            borderRadius: {
              xs: 0,
              sm: 4,
            },
            overflow: "hidden",
            border: 0,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0b0f14"
                : theme.palette.background.paper,
            boxShadow:
              isMobile
                ? "none"
                : theme.palette.mode === "dark"
                  ? "0 26px 70px rgba(0, 0, 0, 0.5)"
                  : "0 24px 64px rgba(15, 23, 42, 0.16)",
          }),
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            px: {
              xs: 2,
              sm: 3,
            },
            py: 2,
            borderBottom: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? "#202731"
                : theme.palette.divider,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0d1218"
                : theme.palette.background.paper,
          })}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ minWidth: 0 }}
            >
              <Avatar
                sx={(theme) => ({
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "#17212b"
                      : alpha(
                          theme.palette.primary.main,
                          0.08,
                        ),
                  color:
                    theme.palette.mode === "dark"
                      ? "#8fb4d1"
                      : theme.palette.primary.main,
                })}
              >
                <PaymentsRoundedIcon
                  sx={{ fontSize: 21 }}
                />
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#edf1f5"
                        : theme.palette.text.primary,
                  })}
                >
                  Métodos de pago
                </Typography>

                <Typography
                  variant="body2"
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#8d97a4"
                        : theme.palette.text.secondary,
                  })}
                >
                  Administra las formas de pago disponibles para las ventas.
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={() =>
                setPaymentMethodsOpen(false)
              }
              disabled={paymentMethodSaving}
              sx={(theme) => ({
                flexShrink: 0,
                color:
                  theme.palette.mode === "dark"
                    ? "#aab3bd"
                    : theme.palette.text.secondary,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#151a21"
                    : theme.palette.action.hover,
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "#1b222b"
                      : theme.palette.action.selected,
                },
              })}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={(theme) => ({
            p: {
              xs: 1.5,
              sm: 3,
            },
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0b0f14"
                : "#f7f9fb",
          })}
        >
          <Stack spacing={2.25}>
            {paymentMethodError ? (
              <Alert
                severity="error"
                onClose={() =>
                  setPaymentMethodError(null)
                }
              >
                {paymentMethodError}
              </Alert>
            ) : null}

            <Paper
              elevation={0}
              sx={(theme) => ({
                p: {
                  xs: 1.5,
                  sm: 2,
                },
                borderRadius: 3,
                border: 0,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "#11161d"
                    : theme.palette.background.paper,
              })}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
                spacing={0.75}
                mb={1.75}
              >
                <Box>
                  <Typography
                    fontWeight={900}
                    sx={(theme) => ({
                      color:
                        theme.palette.mode === "dark"
                          ? "#e7ebef"
                          : theme.palette.text.primary,
                    })}
                  >
                    {paymentMethodForm.id ===
                    null
                      ? "Nuevo método"
                      : "Editar método"}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={(theme) => ({
                      color:
                        theme.palette.mode === "dark"
                          ? "#7f8995"
                          : theme.palette.text.secondary,
                    })}
                  >
                    {paymentMethodForm.id ===
                    null
                      ? "Agrega una nueva forma de pago."
                      : "Actualiza la información del método seleccionado."}
                  </Typography>
                </Box>

                {paymentMethodForm.id !==
                null ? (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={
                      <RefreshRoundedIcon />
                    }
                    onClick={
                      openNewPaymentMethod
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Nuevo
                  </Button>
                ) : null}
              </Stack>

              <Grid
                container
                spacing={1.5}
                alignItems="center"
              >
                <Grid
                  item
                  xs={12}
                  sm={5}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre"
                    placeholder="Ej. Transferencia"
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
                    sx={(theme) => ({
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.25,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "#0d1218"
                            : theme.palette.background.default,
                      },
                    })}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={5}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Descripción"
                    placeholder="Descripción breve"
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
                    sx={(theme) => ({
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.25,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "#0d1218"
                            : theme.palette.background.default,
                      },
                    })}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={2}
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
                    startIcon={
                      paymentMethodSaving ? (
                        <CircularProgress
                          size={16}
                          color="inherit"
                        />
                      ) : paymentMethodForm.id ===
                        null ? (
                        <AddRoundedIcon />
                      ) : (
                        <EditRoundedIcon />
                      )
                    }
                    sx={{
                      minHeight: 40,
                      borderRadius: 2.25,
                      textTransform: "none",
                      fontWeight: 900,
                      boxShadow: "none",
                    }}
                  >
                    {paymentMethodForm.id ===
                    null
                      ? "Agregar"
                      : "Guardar"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  fontWeight={900}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#dfe4e9"
                        : theme.palette.text.primary,
                  })}
                >
                  Métodos registrados
                </Typography>

                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === "dark"
                        ? "#7f8995"
                        : theme.palette.text.secondary,
                  })}
                >
                  Activa, desactiva o edita cada método.
                </Typography>
              </Box>

              <Chip
                size="small"
                label={`${paymentMethods.length} ${
                  paymentMethods.length === 1
                    ? "método"
                    : "métodos"
                }`}
                sx={(theme) => ({
                  fontWeight: 800,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "#151b23"
                      : theme.palette.action.hover,
                  color:
                    theme.palette.mode === "dark"
                      ? "#9ca6b2"
                      : theme.palette.text.secondary,
                })}
              />
            </Stack>

            <Stack spacing={0.85}>
              {paymentMethods.map(
                (method) => (
                  <Paper
                    elevation={0}
                    key={method.id}
                    sx={(theme) => ({
                      px: {
                        xs: 1.25,
                        sm: 1.75,
                      },
                      py: 1.35,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor:
                        theme.palette.mode ===
                        "dark"
                          ? "#1c242d"
                          : theme.palette.divider,
                      bgcolor:
                        theme.palette.mode ===
                        "dark"
                          ? "#10151b"
                          : theme.palette.background.paper,
                      transition:
                        "background-color .15s ease, border-color .15s ease",
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode ===
                          "dark"
                            ? "#121820"
                            : theme.palette.action.hover,
                        borderColor:
                          theme.palette.mode ===
                          "dark"
                            ? "#2a3541"
                            : theme.palette.divider,
                      },
                    })}
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
                      spacing={{
                        xs: 1.25,
                        sm: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Avatar
                          sx={(theme) => ({
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                            bgcolor:
                              theme.palette.mode ===
                              "dark"
                                ? "#17212a"
                                : alpha(
                                    theme.palette.primary.main,
                                    0.07,
                                  ),
                            color:
                              method.activo
                                ? theme.palette.primary.main
                                : theme.palette.text.disabled,
                          })}
                        >
                          <PaymentsRoundedIcon
                            sx={{
                              fontSize: 19,
                            }}
                          />
                        </Avatar>

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            useFlexGap
                            flexWrap="wrap"
                          >
                            <Typography
                              fontWeight={900}
                              sx={(theme) => ({
                                color:
                                  theme.palette.mode ===
                                  "dark"
                                    ? "#e6eaee"
                                    : theme.palette.text.primary,
                              })}
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
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontSize: "0.69rem",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="body2"
                            noWrap
                            sx={(theme) => ({
                              mt: 0.2,
                              color:
                                theme.palette.mode ===
                                "dark"
                                  ? "#8a949f"
                                  : theme.palette.text.secondary,
                            })}
                          >
                            {method.descripcion ??
                              "Sin descripción"}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={(theme) => ({
                              display: "block",
                              mt: 0.25,
                              color:
                                theme.palette.mode ===
                                "dark"
                                  ? "#68727d"
                                  : theme.palette.text.disabled,
                            })}
                          >
                            {method.historiales_count ??
                              0}{" "}
                            movimientos relacionados
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent={{
                          xs: "space-between",
                          sm: "flex-end",
                        }}
                        spacing={0.4}
                      >
                        <Tooltip
                          title={
                            method.activo
                              ? "Desactivar"
                              : "Activar"
                          }
                        >
                          <Switch
                            size="small"
                            checked={method.activo}
                            onChange={() =>
                              void togglePaymentMethod(
                                method,
                              )
                            }
                          />
                        </Tooltip>

                        <Stack
                          direction="row"
                          spacing={0.35}
                        >
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openEditPaymentMethod(
                                  method,
                                )
                              }
                              sx={(theme) => ({
                                color:
                                  theme.palette.mode ===
                                  "dark"
                                    ? "#9ca7b3"
                                    : theme.palette.text.secondary,
                                bgcolor:
                                  theme.palette.mode ===
                                  "dark"
                                    ? "#151b22"
                                    : theme.palette.action.hover,
                                "&:hover": {
                                  color:
                                    theme.palette.primary.main,
                                  bgcolor:
                                    theme.palette.mode ===
                                    "dark"
                                      ? "#1a222b"
                                      : theme.palette.action.selected,
                                },
                              })}
                            >
                              <EditRoundedIcon
                                fontSize="small"
                              />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              method.historiales_count >
                              0
                                ? "No se puede eliminar porque tiene movimientos relacionados"
                                : "Eliminar"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={
                                  method.historiales_count >
                                  0
                                }
                                onClick={() =>
                                  void removePaymentMethod(
                                    method,
                                  )
                                }
                                sx={(theme) => ({
                                  color:
                                    theme.palette.mode ===
                                    "dark"
                                      ? "#b07d7d"
                                      : theme.palette.error.main,
                                  bgcolor:
                                    theme.palette.mode ===
                                    "dark"
                                      ? "#1a1518"
                                      : alpha(
                                          theme.palette.error.main,
                                          0.05,
                                        ),
                                  "&:hover": {
                                    bgcolor:
                                      alpha(
                                        theme.palette.error.main,
                                        0.11,
                                      ),
                                  },
                                })}
                              >
                                <DeleteOutlineRoundedIcon
                                  fontSize="small"
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ),
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            px: {
              xs: 1.5,
              sm: 3,
            },
            py: 1.5,
            borderTop: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? "#202731"
                : theme.palette.divider,
            bgcolor:
              theme.palette.mode === "dark"
                ? "#0d1218"
                : theme.palette.background.paper,
          })}
        >
          <Button
            onClick={() =>
              setPaymentMethodsOpen(false)
            }
            sx={(theme) => ({
              borderRadius: 2.25,
              textTransform: "none",
              fontWeight: 800,
              color:
                theme.palette.mode === "dark"
                  ? "#9ca6b2"
                  : theme.palette.text.secondary,
            })}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
