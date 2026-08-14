import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
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
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {
  deleteTaecontaSystemEmpresaCertificado,
  updateTaecontaSystemEmpresaContabilidad,
  updateTaecontaSystemEmpresaSocio,
  type TaecontaSystemEmpresaSocioUpdatePayload,
} from "../../../services/superadminService";

type UnknownRecord = Record<string, any>;

type Props = {
  open: boolean;
  empresaId: number | null;
  socioData: UnknownRecord | null;
  fallbackEmpresa?: UnknownRecord | null;
  onClose: () => void;
  onSaved:
    | ((message?: string) => void)
    | ((message?: string) => Promise<void>);
};

type ModuleKey =
  | "facturacion"
  | "notasDeCredito"
  | "nomina"
  | "cotizacion";

type CertificadoTipo =
  | "cert"
  | "llave"
  | "cert2"
  | "llave2";

type FormState = {
  nombre: string;
  rfc: string;
  telefono: string;
  codigoPostal: string;
  regimenCodigo: string;
  tipoPersonaId: string;
  correo: string;
  nombreUsuario: string;
  nuevaContrasena: string;
  contrasenaCsd: string;
  confirmarContrasenaCsd: string;
  contrasenaEfirma: string;
  confirmarContrasenaEfirma: string;
};

type RegimenOption = {
  id: number;
  codigo: string;
  nombre: string;
};

type TipoPersonaOption = {
  id: number;
  persona: string;
};

const EMPTY_FORM: FormState = {
  nombre: "",
  rfc: "",
  telefono: "",
  codigoPostal: "",
  regimenCodigo: "",
  tipoPersonaId: "",
  correo: "",
  nombreUsuario: "",
  nuevaContrasena: "",
  contrasenaCsd: "",
  confirmarContrasenaCsd: "",
  contrasenaEfirma: "",
  confirmarContrasenaEfirma: "",
};

const MODULES: Array<{
  id: ModuleKey;
  label: string;
}> = [
  {
    id: "facturacion",
    label: "Facturación",
  },
  {
    id: "notasDeCredito",
    label: "Notas de crédito",
  },
  {
    id: "nomina",
    label: "Nómina",
  },
  {
    id: "cotizacion",
    label: "Cotización",
  },
];

const MODULE_TO_KEYS: Record<
  number,
  ModuleKey[]
> = {
  1: ["facturacion"],
  2: ["notasDeCredito"],
  3: ["nomina"],
  4: [
    "facturacion",
    "notasDeCredito",
  ],
  5: [
    "facturacion",
    "nomina",
  ],
  6: [
    "notasDeCredito",
    "nomina",
  ],
  7: [
    "facturacion",
    "notasDeCredito",
    "nomina",
  ],
  8: ["cotizacion"],
  9: [
    "facturacion",
    "cotizacion",
  ],
  10: [
    "notasDeCredito",
    "cotizacion",
  ],
  11: [
    "facturacion",
    "notasDeCredito",
    "cotizacion",
  ],
  12: [
    "nomina",
    "cotizacion",
  ],
  13: [
    "facturacion",
    "notasDeCredito",
    "nomina",
    "cotizacion",
  ],
  14: [
    "notasDeCredito",
    "nomina",
    "cotizacion",
  ],
};

const KEYS_TO_MODULE =
  Object.entries(
    MODULE_TO_KEYS,
  ).reduce<Record<string, number>>(
    (
      accumulator,
      [moduleId, keys],
    ) => {
      accumulator[
        [...keys]
          .sort()
          .join("|")
      ] = Number(moduleId);

      return accumulator;
    },
    {},
  );

function toRecord(
  value: unknown,
): UnknownRecord {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}

function firstValue(
  source: UnknownRecord,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    const value = source?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function textValue(
  value: unknown,
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value);
}

function boolValue(
  value: unknown,
): boolean {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  if (
    typeof value ===
    "number"
  ) {
    return value === 1;
  }

  return [
    "1",
    "true",
    "si",
    "sí",
    "activo",
    "activado",
    "habilitado",
  ].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
  );
}

function getRequestMessage(
  error: any,
  fallback: string,
): string {
  const data =
    error?.response?.data;

  const errors =
    data?.errors;

  if (
    errors &&
    typeof errors ===
      "object"
  ) {
    const first =
      Object.values(errors)
        .flat()
        .find(
          (item) =>
            typeof item ===
              "string" &&
            item.trim() !== "",
        );

    if (first) {
      return String(first);
    }
  }

  return String(
    data?.message ??
      data?.mensaje ??
      error?.message ??
      fallback,
  );
}

function getResponseMessage(
  response: any,
  fallback: string,
): string {
  return String(
    response?.message ??
      response?.mensaje ??
      fallback,
  );
}

function getModuleId(
  selected: ModuleKey[],
): number | null {
  if (
    selected.length === 0
  ) {
    return null;
  }

  return (
    KEYS_TO_MODULE[
      [...selected]
        .sort()
        .join("|")
    ] ?? null
  );
}

function safeFileName(
  source: UnknownRecord,
  nameKey: string,
  existsKey: string,
): string {
  const name =
    textValue(
      firstValue(
        source,
        nameKey,
      ),
    ).trim();

  if (name) {
    return name;
  }

  return boolValue(
    firstValue(
      source,
      existsKey,
    ),
  )
    ? "Archivo registrado"
    : "Archivo no disponible";
}

function normalizeRegimenes(
  value: unknown,
  currentCode: string,
  currentName: string,
): RegimenOption[] {
  const source =
    Array.isArray(value)
      ? value
      : [];

  const normalized =
    source
      .map(
        (
          item,
        ): RegimenOption | null => {
          const record =
            toRecord(item);

          const codigo =
            textValue(
              firstValue(
                record,
                "codigo",
                "code",
              ),
            ).trim();

          const nombre =
            textValue(
              firstValue(
                record,
                "nombre",
                "name",
              ),
            ).trim();

          if (!codigo) {
            return null;
          }

          return {
            id:
              Number(
                firstValue(
                  record,
                  "id",
                ) ?? 0,
              ) || 0,
            codigo,
            nombre:
              nombre ||
              codigo,
          };
        },
      )
      .filter(
        (
          item,
        ): item is RegimenOption =>
          item !== null,
      );

  if (
    currentCode &&
    !normalized.some(
      (item) =>
        item.codigo ===
        currentCode,
    )
  ) {
    normalized.push({
      id: 0,
      codigo: currentCode,
      nombre:
        currentName ||
        currentCode,
    });
  }

  return normalized.sort(
    (a, b) =>
      a.codigo.localeCompare(
        b.codigo,
      ),
  );
}

function normalizeTiposPersona(
  value: unknown,
): TipoPersonaOption[] {
  const source =
    Array.isArray(value)
      ? value
      : [];

  const normalized =
    source
      .map(
        (
          item,
        ): TipoPersonaOption | null => {
          const record =
            toRecord(item);

          const id =
            Number(
              firstValue(
                record,
                "id",
              ),
            );

          const persona =
            textValue(
              firstValue(
                record,
                "persona",
                "nombre",
                "name",
              ),
            ).trim();

          if (
            !Number.isFinite(id) ||
            id <= 0 ||
            !persona
          ) {
            return null;
          }

          return {
            id,
            persona,
          };
        },
      )
      .filter(
        (
          item,
        ): item is TipoPersonaOption =>
          item !== null,
      );

  if (
    normalized.length > 0
  ) {
    return normalized;
  }

  return [
    {
      id: 1,
      persona: "Física",
    },
    {
      id: 2,
      persona: "Moral",
    },
  ];
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 1.5,
          md: 2.5,
        },
        border:
          "1px solid",
        borderColor:
          "divider",
        borderRadius: 2,
        bgcolor:
          "background.paper",
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        mb={2.25}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor:
              "primary.50",
            color:
              "primary.main",
            display:
              "grid",
            placeItems:
              "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            fontSize={{
              xs: 16,
              md: 18,
            }}
            fontWeight={900}
          >
            {title}
          </Typography>

          <Typography
            color="text.secondary"
            fontSize={11}
            mt={0.2}
          >
            {subtitle}
          </Typography>
        </Box>
      </Stack>

      {children}
    </Paper>
  );
}

function CurrentFileCard({
  currentName,
  exists,
  deleting,
  onDelete,
}: {
  currentName: string;
  exists: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.5,
        py: 1.25,
        border:
          "1px solid",
        borderColor:
          exists
            ? "success.main"
            : "divider",
        borderRadius: 1.25,
        minHeight: 66,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        <DescriptionOutlinedIcon
          sx={{
            color:
              exists
                ? "success.main"
                : "text.disabled",
            flexShrink: 0,
          }}
        />

        <Box
          minWidth={0}
          flex={1}
        >
          <Typography
            color="text.secondary"
            fontSize={9.5}
          >
            Archivo actual
          </Typography>

          <Typography
            fontSize={11}
            fontWeight={850}
            sx={{
              overflowWrap:
                "anywhere",
            }}
          >
            {currentName}
          </Typography>
        </Box>

        {exists && (
          <Tooltip title="Eliminar referencia">
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={deleting}
                onClick={onDelete}
              >
                {deleting ? (
                  <CircularProgress
                    size={17}
                  />
                ) : (
                  <DeleteOutlineOutlinedIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
}

function NativeFileField({
  label,
  accept,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (
    file: File | null,
  ) => void;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography
        color="text.secondary"
        fontSize={10}
      >
        {label}
      </Typography>

      <Button
        component="label"
        variant="outlined"
        sx={{
          justifyContent:
            "flex-start",
          textTransform:
            "none",
          minHeight: 44,
          color:
            "text.primary",
          borderColor:
            "divider",
        }}
      >
        {file
          ? file.name
          : "Elegir archivo"}

        <input
          hidden
          type="file"
          accept={accept}
          onChange={(
            event,
          ) => {
            onChange(
              event.target
                .files?.[0] ??
                null,
            );

            event.currentTarget.value =
              "";
          }}
        />
      </Button>
    </Stack>
  );
}

export default function TaecontaSocioEditor({
  open,
  empresaId,
  socioData,
  fallbackEmpresa = null,
  onClose,
  onSaved,
}: Props) {
  const theme =
    useTheme();

  const fullScreen =
    useMediaQuery(
      theme.breakpoints.down(
        "sm",
      ),
    );

  const empresa =
    useMemo(
      () =>
        toRecord(
          socioData?.empresa,
        ),
      [socioData],
    );

  const usuario =
    useMemo(
      () =>
        toRecord(
          socioData?.usuario,
        ),
      [socioData],
    );

  const sellos =
    useMemo(
      () =>
        toRecord(
          socioData?.sellos,
        ),
      [socioData],
    );

  const catalogos =
    useMemo(
      () =>
        toRecord(
          socioData?.catalogos,
        ),
      [socioData],
    );

  const fallback =
    useMemo(
      () =>
        toRecord(
          fallbackEmpresa,
        ),
      [fallbackEmpresa],
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      EMPTY_FORM,
    );

  const [
    selectedModules,
    setSelectedModules,
  ] =
    useState<ModuleKey[]>(
      [],
    );

  const [
    contabilidad,
    setContabilidad,
  ] =
    useState(false);

  const [
    initialContabilidad,
    setInitialContabilidad,
  ] =
    useState(false);

  const [
    logo,
    setLogo,
  ] =
    useState<File | null>(
      null,
    );

  const [
    certificado,
    setCertificado,
  ] =
    useState<File | null>(
      null,
    );

  const [
    llave,
    setLlave,
  ] =
    useState<File | null>(
      null,
    );

  const [
    certificado2,
    setCertificado2,
  ] =
    useState<File | null>(
      null,
    );

  const [
    llave2,
    setLlave2,
  ] =
    useState<File | null>(
      null,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    logoPreview,
    setLogoPreview,
  ] =
    useState("");

  const [
    deletingFile,
    setDeletingFile,
  ] =
    useState<CertificadoTipo | null>(
      null,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const moduleId =
      Number(
        firstValue(
          empresa,
          "modulo",
        ) ??
          firstValue(
            fallback,
            "modulo",
          ) ??
          0,
      );

    const currentContabilidad =
      boolValue(
        firstValue(
          empresa,
          "contabilidad",
          "sello_registrado",
        ) ??
          firstValue(
            sellos,
            "registrado",
            "Registrado",
          ) ??
          firstValue(
            fallback,
            "contabilidad",
            "sello_registrado",
          ),
      );

    setForm({
      nombre:
        textValue(
          firstValue(
            empresa,
            "nombre",
            "razon_social",
          ) ??
            firstValue(
              fallback,
              "nombre",
              "razon_social",
            ),
        ),

      rfc:
        textValue(
          firstValue(
            empresa,
            "rfc",
          ) ??
            firstValue(
              fallback,
              "rfc",
            ),
        ).toUpperCase(),

      telefono:
        textValue(
          firstValue(
            empresa,
            "telefono",
          ) ??
            firstValue(
              fallback,
              "telefono",
            ),
        ),

      codigoPostal:
        textValue(
          firstValue(
            empresa,
            "codigo_postal_id",
          ) ??
            firstValue(
              fallback,
              "codigo_postal_id",
            ),
        ),

      regimenCodigo:
        textValue(
          firstValue(
            empresa,
            "regimen_codigo",
          ),
        ),

      tipoPersonaId:
        textValue(
          firstValue(
            empresa,
            "tipo_persona_id",
          ) ??
            firstValue(
              fallback,
              "tipo_persona_id",
            ),
        ),

      correo:
        textValue(
          firstValue(
            usuario,
            "correo",
            "email",
          ) ??
            firstValue(
              fallback,
              "correo",
              "email",
              "correo_electronico",
            ),
        ),

      nombreUsuario:
        textValue(
          firstValue(
            usuario,
            "nombre",
            "name",
          ),
        ),

      nuevaContrasena:
        "",
      contrasenaCsd:
        "",
      confirmarContrasenaCsd:
        "",
      contrasenaEfirma:
        "",
      confirmarContrasenaEfirma:
        "",
    });

    setSelectedModules(
      MODULE_TO_KEYS[
        moduleId
      ] ?? [],
    );

    setContabilidad(
      currentContabilidad,
    );

    setInitialContabilidad(
      currentContabilidad,
    );

    setLogo(null);
    setCertificado(null);
    setLlave(null);
    setCertificado2(null);
    setLlave2(null);
    setLogoPreview("");
    setShowPassword(false);
    setDeletingFile(null);
    setError("");
  }, [
    open,
    empresa,
    usuario,
    sellos,
    fallback,
  ]);

  useEffect(() => {
    if (!logo) {
      setLogoPreview("");
      return;
    }

    const url =
      URL.createObjectURL(
        logo,
      );

    setLogoPreview(url);

    return () => {
      URL.revokeObjectURL(
        url,
      );
    };
  }, [logo]);

  const regimenNombre =
    textValue(
      firstValue(
        empresa,
        "regimen_nombre",
        "regimen",
      ),
    );

  const regimenes =
    useMemo(
      () =>
        normalizeRegimenes(
          catalogos?.regimenes,
          form.regimenCodigo,
          regimenNombre,
        ),
      [
        catalogos,
        form.regimenCodigo,
        regimenNombre,
      ],
    );

  const tiposPersona =
    useMemo(
      () =>
        normalizeTiposPersona(
          catalogos
            ?.tipos_persona,
        ),
      [catalogos],
    );

  const logoActual =
    safeFileName(
      empresa,
      "logo_nombre",
      "logo_disponible",
    );

 const logoArchivo =
  textValue(
    firstValue(
      empresa,
      "logo_nombre",
      "logo",
    ),
  ).trim();

const nombreEmpresaLogo =
  textValue(
    firstValue(
      empresa,
      "nombre",
      "razon_social",
    ) ??
      firstValue(
        fallback,
        "nombre",
        "razon_social",
      ),
  )
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase()
    .replace(/ñ/g, "Ñ");

const logoActualUrlDirecto =
  textValue(
    firstValue(
      empresa,
      "logo_url",
      "logoUrl",
    ),
  ).trim();

const logoActualUrl =
  logoActualUrlDirecto ||
  (
    logoArchivo &&
    nombreEmpresaLogo
      ? `https://taeconta.com/api/public/api/mostrar-imagen/${nombreEmpresaLogo}/${logoArchivo}`
      : ""
  );

  const certificadoActual =
    safeFileName(
      sellos,
      "certificado_nombre",
      "certificado",
    );

  const llaveActual =
    safeFileName(
      sellos,
      "llave_nombre",
      "llave",
    );

  const certificado2Actual =
    safeFileName(
      sellos,
      "certificado2_nombre",
      "certificado2",
    );

  const llave2Actual =
    safeFileName(
      sellos,
      "llave2_nombre",
      "llave2",
    );

  const certificadoExiste =
    boolValue(
      firstValue(
        sellos,
        "certificado",
      ),
    );

  const llaveExiste =
    boolValue(
      firstValue(
        sellos,
        "llave",
      ),
    );

  const certificado2Existe =
    boolValue(
      firstValue(
        sellos,
        "certificado2",
      ),
    );

  const llave2Existe =
    boolValue(
      firstValue(
        sellos,
        "llave2",
      ),
    );

  const moduleId =
    getModuleId(
      selectedModules,
    );

  const moduleIsValid =
    moduleId !== null;

  const setField = (
    key: keyof FormState,
    value: string,
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  };

  const toggleModule = (
    module: ModuleKey,
  ) => {
    setSelectedModules(
      (previous) =>
        previous.includes(
          module,
        )
          ? previous.filter(
              (item) =>
                item !== module,
            )
          : [
              ...previous,
              module,
            ],
    );
  };

  const handleDeleteFile =
    async (
      tipo: CertificadoTipo,
    ) => {
      if (
        !empresaId ||
        deletingFile ||
        saving
      ) {
        return;
      }

      const accepted =
        window.confirm(
          "Se eliminará la referencia del archivo seleccionado en TAECONTA. ¿Deseas continuar?",
        );

      if (!accepted) {
        return;
      }

      setDeletingFile(tipo);
      setError("");

      try {
        const response =
          await deleteTaecontaSystemEmpresaCertificado(
            empresaId,
            {
              archivo: tipo,
            },
          );

        await onSaved(
          getResponseMessage(
            response,
            "Referencia eliminada correctamente.",
          ),
        );
      } catch (
        requestError: any
      ) {
        setError(
          getRequestMessage(
            requestError,
            "No fue posible eliminar la referencia del archivo.",
          ),
        );
      } finally {
        setDeletingFile(null);
      }
    };

  const handleSave =
    async () => {
      if (!empresaId) {
        setError(
          "No fue posible identificar la cuenta.",
        );
        return;
      }

      if (
        !form.nombre.trim()
      ) {
        setError(
          "Captura el nombre o razón social.",
        );
        return;
      }

      if (
        !form.rfc.trim()
      ) {
        setError(
          "Captura el RFC.",
        );
        return;
      }

      if (!moduleIsValid) {
        setError(
          "Selecciona una combinación válida de módulos de TAECONTA.",
        );
        return;
      }

      if (
        form.contrasenaCsd !==
        form.confirmarContrasenaCsd
      ) {
        setError(
          "La contraseña del CSD y su confirmación no coinciden.",
        );
        return;
      }

      if (
        form.contrasenaEfirma !==
        form.confirmarContrasenaEfirma
      ) {
        setError(
          "La contraseña de e.firma y su confirmación no coinciden.",
        );
        return;
      }

      if (
        (certificado ||
          llave) &&
        !form.contrasenaCsd.trim()
      ) {
        setError(
          "Captura la contraseña del sello digital para cargar un CSD nuevo.",
        );
        return;
      }

      if (
        (certificado2 ||
          llave2) &&
        !form.contrasenaEfirma.trim()
      ) {
        setError(
          "Captura la contraseña de e.firma para cargar archivos nuevos.",
        );
        return;
      }

      setSaving(true);
      setError("");

      try {
        const payload: TaecontaSystemEmpresaSocioUpdatePayload =
          {
            nombre:
              form.nombre.trim(),

            rfc:
              form.rfc
                .trim()
                .toUpperCase(),

            telefono:
              form.telefono.trim(),

            codigo_postal_id:
              form.codigoPostal.trim(),

            regimen_sat_id:
              form.regimenCodigo ||
              undefined,

            tipo_persona_id:
              form.tipoPersonaId
                ? Number(
                    form.tipoPersonaId,
                  )
                : undefined,

            modulo:
              moduleId ?? undefined,

            nuevoCorreo:
              form.correo.trim(),

            nombreUsuario:
              form.nombreUsuario.trim(),

            contrasena:
              form.nuevaContrasena.trim()
                ? form.nuevaContrasena
                : undefined,

            logo:
              logo ?? undefined,

            certificado:
              certificado ??
              undefined,

            llave:
              llave ??
              undefined,

            certificado2:
              certificado2 ??
              undefined,

            llave2:
              llave2 ??
              undefined,
          };

        if (
          form.contrasenaCsd.trim()
        ) {
          payload.contrasenaLlave =
            form.contrasenaCsd;

          payload.contrasenaLlave_confirmation =
            form.confirmarContrasenaCsd;
        }

        if (
          form.contrasenaEfirma.trim()
        ) {
          payload.contrasenaLlave2 =
            form.contrasenaEfirma;

          payload.contrasenaLlave_confirmation2 =
            form.confirmarContrasenaEfirma;
        }

        const response =
          await updateTaecontaSystemEmpresaSocio(
            empresaId,
            payload,
          );

        if (
          contabilidad !==
          initialContabilidad
        ) {
          await updateTaecontaSystemEmpresaContabilidad(
            empresaId,
            {
              hab:
                contabilidad,
            },
          );
        }

        await onSaved(
          getResponseMessage(
            response,
            "Datos del socio actualizados correctamente.",
          ),
        );

        onClose();
      } catch (
        requestError: any
      ) {
        setError(
          getRequestMessage(
            requestError,
            "No fue posible actualizar los datos del socio.",
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const handleClose = () => {
    if (
      saving ||
      deletingFile
    ) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius:
            fullScreen
              ? 0
              : 2,
          maxHeight:
            fullScreen
              ? "100%"
              : "94vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: {
            xs: 2,
            md: 3,
          },
          py: 2,
          pr: 7,
        }}
      >
        <Typography
          fontWeight={950}
          fontSize={{
            xs: 18,
            md: 21,
          }}
        >
          Actualizar socio
        </Typography>

        <Typography
          color="text.secondary"
          fontSize={11}
          mt={0.25}
        >
          Administración de datos fiscales, módulos, logo, CSD y e.firma.
        </Typography>

        <IconButton
          size="small"
          onClick={handleClose}
          disabled={
            saving ||
            Boolean(deletingFile)
          }
          sx={{
            position:
              "absolute",
            right: 16,
            top: 16,
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: {
            xs: 1.5,
            md: 2.5,
          },
          bgcolor:
            "background.default",
        }}
      >
        <Stack spacing={2}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <SectionCard
            icon={
              <BusinessOutlinedIcon />
            }
            title="Información de la empresa"
            subtitle="Datos fiscales y administrativos del socio."
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Nombre o razón social"
                  value={form.nombre}
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "nombre",
                      event
                        .target
                        .value,
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
                  label="RFC"
                  value={form.rfc}
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "rfc",
                      event
                        .target
                        .value
                        .toUpperCase(),
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
                  label="Teléfono"
                  value={
                    form.telefono
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "telefono",
                      event
                        .target
                        .value,
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
                  label="Código postal"
                  value={
                    form.codigoPostal
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "codigoPostal",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <FormControl
                  fullWidth
                >
                  <InputLabel>
                    Régimen fiscal
                  </InputLabel>

                  <Select
                    label="Régimen fiscal"
                    value={
                      form.regimenCodigo
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        "regimenCodigo",
                        String(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                  >
                    {regimenes.map(
                      (regimen) => (
                        <MenuItem
                          key={`${regimen.id}-${regimen.codigo}`}
                          value={
                            regimen.codigo
                          }
                        >
                          {regimen.codigo} - {regimen.nombre}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  type="email"
                  label="Correo actual"
                  value={
                    form.correo
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "correo",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Typography
                  fontWeight={850}
                  color="text.secondary"
                  mb={0.5}
                >
                  Tipo de persona
                </Typography>

                <RadioGroup
                  row
                  value={
                    form.tipoPersonaId
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "tipoPersonaId",
                      event
                        .target
                        .value,
                    )
                  }
                >
                  {tiposPersona
                    .filter(
                      (item) => {
                        const label =
                          item.persona
                            .toLowerCase();

                        return (
                          label.includes(
                            "fís",
                          ) ||
                          label.includes(
                            "fis",
                          ) ||
                          label.includes(
                            "moral",
                          )
                        );
                      },
                    )
                    .map(
                      (item) => (
                        <FormControlLabel
                          key={item.id}
                          value={String(
                            item.id,
                          )}
                          control={
                            <Radio />
                          }
                          label={
                            item.persona
                          }
                        />
                      ),
                    )}
                </RadioGroup>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                    borderRadius:
                      1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        fontWeight={900}
                      >
                        Contabilidad
                      </Typography>

                      <Typography
                        color="text.secondary"
                        fontSize={11}
                      >
                        Activa o desactiva el acceso contable.
                      </Typography>
                    </Box>

                    <Switch
                      checked={
                        contabilidad
                      }
                      onChange={(
                        event,
                      ) =>
                        setContabilidad(
                          event
                            .target
                            .checked,
                        )
                      }
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            icon={
              <AccountTreeOutlinedIcon />
            }
            title="Módulos del cliente"
            subtitle="Selecciona las funciones disponibles para esta empresa."
          >
            <Grid
              container
              spacing={1.5}
            >
              {MODULES.map(
                (module) => {
                  const checked =
                    selectedModules.includes(
                      module.id,
                    );

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={3}
                      key={
                        module.id
                      }
                    >
                      <Paper
                        elevation={0}
                        onClick={() =>
                          toggleModule(
                            module.id,
                          )
                        }
                        sx={{
                          p: 2,
                          minHeight: 104,
                          cursor:
                            "pointer",
                          border:
                            "1px solid",
                          borderColor:
                            checked
                              ? "primary.main"
                              : "divider",
                          bgcolor:
                            checked
                              ? "action.selected"
                              : "background.paper",
                          borderRadius:
                            1.5,
                        }}
                      >
                        <Stack
                          spacing={1.25}
                          alignItems="flex-start"
                        >
                          <Switch
                            size="small"
                            checked={
                              checked
                            }
                            onClick={(
                              event,
                            ) =>
                              event.stopPropagation()
                            }
                            onChange={() =>
                              toggleModule(
                                module.id,
                              )
                            }
                          />

                          <Typography
                            fontWeight={900}
                          >
                            {module.label}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                },
              )}
            </Grid>

            {!moduleIsValid && (
              <Alert
                severity="warning"
                sx={{ mt: 1.5 }}
              >
                La combinación seleccionada no corresponde a un módulo válido de TAECONTA.
              </Alert>
            )}
          </SectionCard>

          <SectionCard
            icon={
              <SecurityOutlinedIcon />
            }
            title="Acceso y logo"
            subtitle="Actualización opcional de contraseña y archivo de identidad visual."
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={8}
              >
                <TextField
                  fullWidth
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  label="Nueva contraseña"
                  value={
                    form.nuevaContrasena
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "nuevaContrasena",
                      event
                        .target
                        .value,
                    )
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setShowPassword(
                              (value) =>
                                !value,
                            )
                          }
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
              >
                <TextField
                  fullWidth
                  label="Nombre de usuario"
                  value={
                    form.nombreUsuario
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "nombreUsuario",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
              >
                <Divider />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Typography
                  color="text.secondary"
                  fontSize={11}
                  mb={0.75}
                >
                  Logo actual:{" "}
                  <strong>
                    {logoActual}
                  </strong>
                </Typography>

                <NativeFileField
                  label="Logo opcional"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                  file={logo}
                  onChange={setLogo}
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: 142,
                    display:
                      "grid",
                    placeItems:
                      "center",
                    border:
                      "1px dashed",
                    borderColor:
                      "divider",
                    borderRadius:
                      1.5,
                    overflow:
                      "hidden",
                  }}
                >
                  {logoPreview ||
                  logoActualUrl ? (
                    <Box
                      component="img"
                      src={
                        logoPreview ||
                        logoActualUrl
                      }
                      alt={
                        logo?.name ||
                        logoActual
                      }
                      sx={{
                        width:
                          "100%",
                        height:
                          "100%",
                        objectFit:
                          "contain",
                        p: 1,
                      }}
                    />
                  ) : (
                    <Stack
                      alignItems="center"
                      spacing={0.5}
                    >
                      <ImageOutlinedIcon
                        sx={{
                          color:
                            "text.disabled",
                        }}
                      />

                      <Typography
                        color="text.secondary"
                        fontSize={11}
                        fontWeight={800}
                      >
                        Sin vista previa
                      </Typography>
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            icon={
              <DescriptionOutlinedIcon />
            }
            title="Información del Certificado CSD"
            subtitle="Archivos requeridos para timbrado CFDI."
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={1}>
                  <CurrentFileCard
                    currentName={
                      certificadoActual
                    }
                    exists={
                      certificadoExiste
                    }
                    deleting={
                      deletingFile ===
                      "cert"
                    }
                    onDelete={() =>
                      void handleDeleteFile(
                        "cert",
                      )
                    }
                  />

                  <NativeFileField
                    label="Certificado SAT (.cer)"
                    accept=".cer,application/x-x509-ca-cert"
                    file={
                      certificado
                    }
                    onChange={
                      setCertificado
                    }
                  />
                </Stack>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={1}>
                  <CurrentFileCard
                    currentName={
                      llaveActual
                    }
                    exists={
                      llaveExiste
                    }
                    deleting={
                      deletingFile ===
                      "llave"
                    }
                    onDelete={() =>
                      void handleDeleteFile(
                        "llave",
                      )
                    }
                  />

                  <NativeFileField
                    label="Llave SAT (.key)"
                    accept=".key,application/octet-stream"
                    file={llave}
                    onChange={
                      setLlave
                    }
                  />
                </Stack>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña de sello digital"
                  value={
                    form.contrasenaCsd
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "contrasenaCsd",
                      event
                        .target
                        .value,
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
                  type="password"
                  label="Confirmar contraseña de sello digital"
                  value={
                    form.confirmarContrasenaCsd
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "confirmarContrasenaCsd",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            icon={
              <DescriptionOutlinedIcon />
            }
            title="Información de la e.firma"
            subtitle="Archivos opcionales para operaciones fiscales avanzadas."
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={1}>
                  <CurrentFileCard
                    currentName={
                      certificado2Actual
                    }
                    exists={
                      certificado2Existe
                    }
                    deleting={
                      deletingFile ===
                      "cert2"
                    }
                    onDelete={() =>
                      void handleDeleteFile(
                        "cert2",
                      )
                    }
                  />

                  <NativeFileField
                    label="Certificado e.firma (.cer)"
                    accept=".cer,application/x-x509-ca-cert"
                    file={
                      certificado2
                    }
                    onChange={
                      setCertificado2
                    }
                  />
                </Stack>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={1}>
                  <CurrentFileCard
                    currentName={
                      llave2Actual
                    }
                    exists={
                      llave2Existe
                    }
                    deleting={
                      deletingFile ===
                      "llave2"
                    }
                    onDelete={() =>
                      void handleDeleteFile(
                        "llave2",
                      )
                    }
                  />

                  <NativeFileField
                    label="Llave e.firma (.key)"
                    accept=".key,application/octet-stream"
                    file={llave2}
                    onChange={
                      setLlave2
                    }
                  />
                </Stack>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña de e.firma"
                  value={
                    form.contrasenaEfirma
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "contrasenaEfirma",
                      event
                        .target
                        .value,
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
                  type="password"
                  label="Confirmar contraseña de e.firma"
                  value={
                    form.confirmarContrasenaEfirma
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      "confirmarContrasenaEfirma",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </Grid>
            </Grid>
          </SectionCard>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: {
            xs: 2,
            md: 3,
          },
          py: 2,
          borderTop:
            "1px solid",
          borderColor:
            "divider",
        }}
      >
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackOutlinedIcon />
          }
          onClick={handleClose}
          disabled={
            saving ||
            Boolean(deletingFile)
          }
          sx={{
            textTransform:
              "uppercase",
            fontWeight: 900,
          }}
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
          disabled={
            saving ||
            Boolean(deletingFile) ||
            !empresaId ||
            !moduleIsValid
          }
          onClick={() =>
            void handleSave()
          }
          sx={{
            textTransform:
              "uppercase",
            fontWeight: 900,
          }}
        >
          {saving
            ? "Guardando..."
            : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
