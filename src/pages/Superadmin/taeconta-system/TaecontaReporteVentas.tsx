import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  alpha,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
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
  useTheme,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {
  getTaecontaSystemReporteVentas,
  getTaecontaSystemReporteVentasDetalle,
  type TaecontaSystemReporteVentasData,
  type TaecontaSystemReporteVentasDetalleData,
  type TaecontaSystemReporteVentaRegistro,
} from "../../../services/superadminService";

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

type VistaReporte =
  | "principal"
  | "detalle";

type ReporteVentasData =
  TaecontaSystemReporteVentasData & {
    registros_anuales?: Record<
      string,
      number
    >;
  };

/*
|--------------------------------------------------------------------------
| CONSTANTES
|--------------------------------------------------------------------------
*/

const MESES = [
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

const moneyFormatter =
  new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

const integerFormatter =
  new Intl.NumberFormat(
    "es-MX",
  );

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatMoney(
  value:
    | number
    | string
    | null
    | undefined,
): string {
  const amount =
    Number(value ?? 0);

  return moneyFormatter.format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}

function formatInteger(
  value:
    | number
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return integerFormatter.format(
    value,
  );
}

function getDateParts(
  value: string | null,
): {
  date: string;
  time: string;
} {
  if (!value) {
    return {
      date: "—",
      time: "",
    };
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}:\d{2}:\d{2}))?/,
    );

  if (!match) {
    return {
      date: value,
      time: "",
    };
  }

  return {
    date:
      `${match[1]}-${match[2]}-${match[3]}`,

    time:
      match[4] || "",
  };
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const requestError =
    error as any;

  const errors =
    requestError
      ?.response
      ?.data
      ?.errors;

  if (
    errors &&
    typeof errors ===
      "object"
  ) {
    const firstError =
      Object.values(
        errors,
      ).find(
        (item) =>
          Array.isArray(item) &&
          item.length > 0,
      );

    if (
      Array.isArray(
        firstError,
      ) &&
      typeof firstError[0] ===
        "string"
    ) {
      return firstError[0];
    }
  }

  return (
    requestError
      ?.response
      ?.data
      ?.message ||
    requestError
      ?.message ||
    fallback
  );
}

function getInitialMonth(
  data: ReporteVentasData,
): number {
  const now =
    new Date();

  if (
    data.year ===
    now.getFullYear()
  ) {
    return (
      now.getMonth() + 1
    );
  }

  for (
    let index =
      data.meses.length - 1;
    index >= 0;
    index -= 1
  ) {
    const month =
      data.meses[index];

    const total =
      Number(
        data
          .ventas_anuales[
          month
        ] ?? 0,
      );

    if (total !== 0) {
      return index + 1;
    }
  }

  return 1;
}

function getChartStep(
  maxValue: number,
): number {
  if (
    maxValue <= 10000
  ) {
    return 1000;
  }

  if (
    maxValue <= 20000
  ) {
    return 2000;
  }

  if (
    maxValue <= 50000
  ) {
    return 5000;
  }

  if (
    maxValue <= 100000
  ) {
    return 10000;
  }

  return 20000;
}

/*
|--------------------------------------------------------------------------
| TARJETA DE RESUMEN
|--------------------------------------------------------------------------
*/

type SummaryCardProps = {
  title: string;

  value: string;

  variant:
    | "neutral"
    | "primary"
    | "warning"
    | "danger";
};

function SummaryCard({
  title,
  value,
  variant,
}: SummaryCardProps) {
  const theme =
    useTheme();

  const config = {
    neutral: {
      color:
        theme.palette.text
          .secondary,

      icon:
        theme.palette.info
          .main,
    },

    primary: {
      color:
        theme.palette.info
          .main,

      icon:
        theme.palette.info
          .main,
    },

    warning: {
      color:
        theme.palette.warning
          .main,

      icon:
        theme.palette.warning
          .main,
    },

    danger: {
      color:
        theme.palette.error
          .main,

      icon:
        theme.palette.error
          .main,
    },
  }[variant];

  return (
    <Paper
      elevation={0}
      sx={{
        position:
          "relative",

        minHeight: 140,

        width: "100%",

        px: {
          xs: 1.25,
          sm: 1.5,
          md: 2,
        },

        py: 2,

        border:
          "1px solid",

        borderColor:
          "divider",

        borderRadius: 2,

        bgcolor:
          "background.paper",

        boxShadow:
          theme.palette.mode ===
          "dark"
            ? "none"
            : theme.shadows[1],

        display: "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        textAlign:
          "center",

        overflow:
          "hidden",
      }}
    >
      <Box
        sx={{
          position:
            "absolute",

          left: 12,

          top: "50%",

          transform:
            "translateY(-50%)",

          width: 36,

          height: 36,

          borderRadius: 1.25,

          bgcolor:
            alpha(
              config.icon,
              0.12,
            ),

          color:
            config.icon,

          display: {
            xs: "none",
            lg: "flex",
          },

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >
        <ReceiptLongOutlinedIcon
          sx={{
            fontSize: 20,
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: {
            xs: 11.5,
            sm: 12.5,
            md: 13,
          },

          lineHeight: 1.3,

          fontWeight: 700,

          color:
            "text.secondary",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1.25,

          fontSize: {
            xs: 22,
            sm: 25,
            md: 28,
          },

          lineHeight: 1,

          fontWeight: 900,

          color:
            config.color,

          whiteSpace:
            "nowrap",
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

/*
|--------------------------------------------------------------------------
| GRÁFICA ANUAL
|--------------------------------------------------------------------------
*/

type AnnualBarChartProps = {
  year: number;

  months: string[];

  values: Record<
    string,
    number
  >;

  selectedMonth: number;

  onMonthClick: (
    month: number,
  ) => void;
};

function AnnualBarChart({
  year,
  months,
  values,
  selectedMonth,
  onMonthClick,
}: AnnualBarChartProps) {
  const theme =
    useTheme();

  const chartValues =
    months.map(
      (month) =>
        Number(
          values[
            month
          ] ?? 0,
        ),
    );

  const maxValue =
    Math.max(
      ...chartValues,
      1,
    );

  const step =
    getChartStep(
      maxValue,
    );

  const axisMax =
    Math.max(
      step,
      Math.ceil(
        maxValue / step,
      ) * step,
    );

  const ticks =
    useMemo(() => {
      const result: number[] =
        [];

      for (
        let value = 0;
        value <= axisMax;
        value += step
      ) {
        result.push(
          value,
        );
      }

      return result;
    }, [
      axisMax,
      step,
    ]);

  return (
    <Box
      sx={{
        width: "100%",

        minWidth: 0,

        overflowX: {
          xs: "auto",
          md: "hidden",
        },

        overflowY:
          "hidden",
      }}
    >
      <Box
        sx={{
          position:
            "relative",

          width: "100%",

          minWidth: {
            xs: 720,
            md: 0,
          },

          height: {
            xs: 340,
            md: 390,
          },

          pt: 0.5,
        }}
      >
        {/* LEYENDA */}

        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          justifyContent="center"
          sx={{
            height: 28,

            mb: 0.5,
          }}
        >
          <Box
            sx={{
              width: 38,

              height: 11,

              bgcolor:
                "success.main",
            }}
          />

          <Typography
            sx={{
              fontSize: 11,

              color:
                "text.secondary",
            }}
          >
            Ventas {year}
          </Typography>
        </Stack>

        <Box
          sx={{
            position:
              "relative",

            height: {
              xs: 270,
              md: 320,
            },

            ml: 7,

            mr: 1,
          }}
        >
          {/* LÍNEAS */}

          {ticks.map(
            (tick) => {
              const bottom =
                `${(
                  tick /
                  axisMax
                ) * 100}%`;

              return (
                <Box
                  key={tick}
                  sx={{
                    position:
                      "absolute",

                    left: 0,

                    right: 0,

                    bottom,

                    borderTop:
                      "1px solid",

                    borderColor:
                      alpha(
                        theme.palette
                          .text
                          .primary,
                        theme.palette
                            .mode ===
                          "dark"
                          ? 0.13
                          : 0.14,
                      ),

                    pointerEvents:
                      "none",
                  }}
                >
                  <Typography
                    sx={{
                      position:
                        "absolute",

                      right:
                        "calc(100% + 8px)",

                      top: -7,

                      width: 50,

                      textAlign:
                        "right",

                      fontSize:
                        9.5,

                      color:
                        "text.secondary",
                    }}
                  >
                    {tick}
                  </Typography>
                </Box>
              );
            },
          )}

          {/* BARRAS */}

          <Box
            sx={{
              position:
                "absolute",

              inset: 0,

              display:
                "grid",

              gridTemplateColumns:
                `repeat(${months.length}, minmax(0, 1fr))`,

              gap: {
                xs: 0.75,
                md: 1,
              },

              alignItems:
                "end",
            }}
          >
            {months.map(
              (
                month,
                index,
              ) => {
                const amount =
                  Number(
                    values[
                      month
                    ] ?? 0,
                  );

                const height =
                  amount > 0
                    ? `${Math.max(
                        1.5,
                        (
                          amount /
                          axisMax
                        ) * 100,
                      )}%`
                    : "2px";

                const selected =
                  selectedMonth ===
                  index + 1;

                return (
                  <Tooltip
                    key={month}
                    title={`${month}: ${formatMoney(
                      amount,
                    )}`}
                    arrow
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() =>
                        onMonthClick(
                          index + 1,
                        )
                      }
                      sx={{
                        position:
                          "relative",

                        height:
                          "100%",

                        minWidth: 0,

                        p: 0,

                        border: 0,

                        bgcolor:
                          "transparent",

                        cursor:
                          "pointer",

                        display:
                          "flex",

                        flexDirection:
                          "column",

                        alignItems:
                          "center",

                        justifyContent:
                          "flex-end",

                        "&:focus-visible":
                          {
                            outline:
                              `2px solid ${theme.palette.primary.main}`,

                            outlineOffset:
                              2,
                          },
                      }}
                    >
                      <Box
                        sx={{
                          width:
                            "76%",

                          maxWidth: 72,

                          height,

                          minHeight:
                            amount > 0
                              ? 5
                              : 2,

                          bgcolor:
                            selected
                              ? "success.dark"
                              : "success.main",

                          borderRadius:
                            "4px 4px 0 0",

                          transition:
                            "height 180ms ease, opacity 120ms ease",

                          opacity:
                            selected
                              ? 1
                              : 0.94,

                          "&:hover":
                            {
                              opacity:
                                0.78,
                            },
                        }}
                      />

                      <Typography
                        sx={{
                          position:
                            "absolute",

                          top:
                            "calc(100% + 8px)",

                          left: "50%",

                          transform:
                            "translateX(-50%)",

                          fontSize: 9.5,

                          fontWeight:
                            selected
                              ? 800
                              : 500,

                          color:
                            selected
                              ? "success.main"
                              : "text.secondary",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {month}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              },
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/*
|--------------------------------------------------------------------------
| ACCIONES DE REGISTRO
|--------------------------------------------------------------------------
*/

type RegistroActionsProps = {
  registro:
    TaecontaSystemReporteVentaRegistro;

  onPendingAction: (
    action: string,
  ) => void;
};

function RegistroActions({
  registro,
  onPendingAction,
}: RegistroActionsProps) {
  const tieneCfdi =
    registro.cfdi_id !== null;

  if (!tieneCfdi) {
    return (
      <Box
        sx={{
          width: "100%",

          display: "grid",

          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",

          gap: 0.5,
        }}
      >
        <Button
          size="small"
          variant="contained"
          color="warning"
          onClick={() =>
            onPendingAction(
              "Facturar",
            )
          }
          sx={{
            minWidth: 0,

            minHeight: 29,

            px: 0.5,

            py: 0.4,

            borderRadius: 1,

            fontSize: 8.5,

            lineHeight: 1,

            fontWeight: 900,

            whiteSpace:
              "nowrap",
          }}
        >
          Facturar
        </Button>

        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() =>
            onPendingAction(
              "Eliminar",
            )
          }
          sx={{
            minWidth: 0,

            minHeight: 29,

            px: 0.5,

            py: 0.4,

            borderRadius: 1,

            fontSize: 8.5,

            lineHeight: 1,

            fontWeight: 900,

            whiteSpace:
              "nowrap",
          }}
        >
          Eliminar
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",

        display: "grid",

        gridTemplateColumns:
          "repeat(2, minmax(0, 1fr))",

        gap: 0.45,
      }}
    >
      <Button
        size="small"
        variant="contained"
        color="success"
        onClick={() =>
          onPendingAction(
            "PDF",
          )
        }
        sx={{
          minWidth: 0,

          minHeight: 28,

          px: 0.4,

          py: 0.35,

          borderRadius: 1,

          fontSize: 8.5,

          lineHeight: 1,

          fontWeight: 900,
        }}
      >
        PDF
      </Button>

      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={() =>
          onPendingAction(
            "XML",
          )
        }
        sx={{
          minWidth: 0,

          minHeight: 28,

          px: 0.4,

          py: 0.35,

          borderRadius: 1,

          fontSize: 8.5,

          lineHeight: 1,

          fontWeight: 900,
        }}
      >
        XML
      </Button>

      <Button
        size="small"
        variant="outlined"
        color="warning"
        onClick={() =>
          onPendingAction(
            "Cancelar",
          )
        }
        sx={{
          gridColumn:
            "1 / -1",

          justifySelf:
            "center",

          minWidth: 76,

          minHeight: 25,

          px: 0.7,

          py: 0.25,

          borderRadius: 1,

          fontSize: 8,

          lineHeight: 1,

          fontWeight: 900,
        }}
      >
        Cancelar
      </Button>
    </Box>
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTE PRINCIPAL
|--------------------------------------------------------------------------
*/

export default function TaecontaReporteVentas() {
  const theme =
    useTheme();

  const [
    vista,
    setVista,
  ] =
    useState<VistaReporte>(
      "principal",
    );

  const [
    reporte,
    setReporte,
  ] =
    useState<ReporteVentasData | null>(
      null,
    );

  const [
    detalle,
    setDetalle,
  ] =
    useState<TaecontaSystemReporteVentasDetalleData | null>(
      null,
    );

  const [
    selectedYear,
    setSelectedYear,
  ] =
    useState<number>(0);

  const [
    selectedMonth,
    setSelectedMonth,
  ] =
    useState<number>(
      new Date().getMonth() +
        1,
    );

  const [
    loadingReporte,
    setLoadingReporte,
  ] =
    useState(true);

  const [
    loadingDetalle,
    setLoadingDetalle,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    infoMessage,
    setInfoMessage,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | CARGAR REPORTE PRINCIPAL
  |--------------------------------------------------------------------------
  */

  const loadReporte =
    useCallback(
      async (
        year?: number,
      ) => {
        setLoadingReporte(
          true,
        );

        setError("");

        setInfoMessage("");

        try {
          const response =
            await getTaecontaSystemReporteVentas(
              year,
            );

          if (
            response.success !==
              true ||
            !response.data
          ) {
            throw new Error(
              response.message ||
                "No fue posible obtener el reporte de ventas.",
            );
          }

          const data =
            response.data as ReporteVentasData;

          setReporte(data);

          setSelectedYear(
            data.year,
          );

          setSelectedMonth(
            getInitialMonth(
              data,
            ),
          );

          setDetalle(null);

          setVista(
            "principal",
          );
        } catch (
          requestError
        ) {
          console.error(
            "ERROR REPORTE VENTAS TAECONTA:",
            requestError,
          );

          setError(
            getErrorMessage(
              requestError,
              "No fue posible consultar el reporte de ventas de TAECONTA.",
            ),
          );
        } finally {
          setLoadingReporte(
            false,
          );
        }
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | CARGAR DETALLE
  |--------------------------------------------------------------------------
  */

  const loadDetalle =
    useCallback(
      async (
        month?: number,
      ) => {
        const resolvedMonth =
          month ??
          selectedMonth;

        if (
          !selectedYear ||
          resolvedMonth < 1 ||
          resolvedMonth > 12
        ) {
          return;
        }

        setSelectedMonth(
          resolvedMonth,
        );

        setLoadingDetalle(
          true,
        );

        setError("");

        setInfoMessage("");

        setVista(
          "detalle",
        );

        try {
          const response =
            await getTaecontaSystemReporteVentasDetalle(
              selectedYear,
              resolvedMonth,
            );

          if (
            response.success !==
              true ||
            !response.data
          ) {
            throw new Error(
              response.message ||
                "No fue posible obtener el detalle de ventas.",
            );
          }

          setDetalle(
            response.data,
          );
        } catch (
          requestError
        ) {
          console.error(
            "ERROR DETALLE VENTAS TAECONTA:",
            requestError,
          );

          setDetalle(null);

          setError(
            getErrorMessage(
              requestError,
              "No fue posible consultar los registros de ventas.",
            ),
          );
        } finally {
          setLoadingDetalle(
            false,
          );
        }
      },
      [
        selectedMonth,
        selectedYear,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | CARGA INICIAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void loadReporte();
  }, [loadReporte]);

  /*
  |--------------------------------------------------------------------------
  | DATOS DERIVADOS
  |--------------------------------------------------------------------------
  */

  const months =
    reporte?.meses?.length
      ? reporte.meses
      : MESES;

  const selectedMonthName =
    months[
      selectedMonth - 1
    ] ?? "";

  const previousMonthName =
    selectedMonth > 1
      ? months[
          selectedMonth - 2
        ] ?? ""
      : "";

  const ventasMes =
    Number(
      reporte
        ?.ventas_anuales[
        selectedMonthName
      ] ?? 0,
    );

  const ventasMesPasado =
    previousMonthName
      ? Number(
          reporte
            ?.ventas_anuales[
            previousMonthName
          ] ?? 0,
        )
      : null;

  const registrosMes =
    reporte
      ?.registros_anuales?.[
      selectedMonthName
    ];

  const registrosMesPasado =
    previousMonthName
      ? reporte
          ?.registros_anuales?.[
          previousMonthName
        ]
      : undefined;

  /*
   * La vista original de TAECONTA
   * muestra los registros del más
   * reciente al más antiguo.
   */
  const detalleOrdenado =
    useMemo(() => {
      if (!detalle) {
        return [];
      }

      return [
        ...detalle.registros,
      ].sort(
        (
          a,
          b,
        ) => {
          const dateA =
            a.fecha ?? "";

          const dateB =
            b.fecha ?? "";

          const dateCompare =
            dateB.localeCompare(
              dateA,
            );

          if (
            dateCompare !== 0
          ) {
            return dateCompare;
          }

          return (
            b.id - a.id
          );
        },
      );
    }, [detalle]);

  /*
  |--------------------------------------------------------------------------
  | HANDLERS
  |--------------------------------------------------------------------------
  */

  const handleYearChange =
    (
      year: number,
    ) => {
      void loadReporte(
        year,
      );
    };

  const handleMonthChange =
    (
      month: number,
    ) => {
      setSelectedMonth(
        month,
      );
    };

  const handleBarClick =
    (
      month: number,
    ) => {
      setSelectedMonth(
        month,
      );

      void loadDetalle(
        month,
      );
    };

  const handleBack =
    () => {
      setVista(
        "principal",
      );

      setDetalle(null);

      setError("");

      setInfoMessage("");
    };

  const handleRefresh =
    () => {
      if (
        vista === "detalle"
      ) {
        void loadDetalle(
          selectedMonth,
        );

        return;
      }

      void loadReporte(
        selectedYear ||
          undefined,
      );
    };

  const handlePendingAction =
    (
      action: string,
    ) => {
      setInfoMessage(
        `La acción "${action}" todavía no está conectada a su endpoint operativo.`,
      );
    };

  /*
  |--------------------------------------------------------------------------
  | LOADING INICIAL
  |--------------------------------------------------------------------------
  */

  if (
    loadingReporte &&
    !reporte
  ) {
    return (
      <Box
        sx={{
          width: "100%",

          minHeight: 420,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          flexDirection:
            "column",

          gap: 1.25,
        }}
      >
        <CircularProgress
          size={32}
        />

        <Typography
          sx={{
            fontSize: 12,

            color:
              "text.secondary",
          }}
        >
          Consultando reporte
          de ventas...
        </Typography>
      </Box>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: "100%",

        minWidth: 0,

        display: "flex",

        flexDirection:
          "column",

        gap: 2,

        overflowX:
          "hidden",
      }}
    >
      {/* =====================================================
          MENSAJES
      ===================================================== */}

      {error && (
        <Alert
          severity="error"
          variant="outlined"
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {infoMessage && (
        <Alert
          severity="info"
          variant="outlined"
          onClose={() =>
            setInfoMessage("")
          }
        >
          {infoMessage}
        </Alert>
      )}

      {/* =====================================================
          PRIMERA VISTA
      ===================================================== */}

      {vista ===
        "principal" &&
        reporte && (
          <>
            {/* ===============================================
                TARJETAS
            =============================================== */}

            <Box
              sx={{
                width: "100%",

                minWidth: 0,

                display: "grid",

                gridTemplateColumns:
                  {
                    xs:
                      "minmax(0, 1fr)",

                    sm:
                      "repeat(2, minmax(0, 1fr))",

                    xl:
                      "repeat(4, minmax(0, 1fr))",
                  },

                gap: 1.5,
              }}
            >
              <SummaryCard
                title="Registros Mes Pasado"
                value={formatInteger(
                  registrosMesPasado,
                )}
                variant="neutral"
              />

              <SummaryCard
                title="Registros del Mes"
                value={formatInteger(
                  registrosMes,
                )}
                variant="primary"
              />

              <SummaryCard
                title="Ventas Mes Pasado"
                value={
                  ventasMesPasado ===
                  null
                    ? "—"
                    : formatMoney(
                        ventasMesPasado,
                      )
                }
                variant="warning"
              />

              <SummaryCard
                title="Ventas del Mes"
                value={formatMoney(
                  ventasMes,
                )}
                variant="danger"
              />
            </Box>

            {/* ===============================================
                GRÁFICA
            =============================================== */}

            <Paper
              elevation={0}
              sx={{
                width: "100%",

                maxWidth:
                  "100%",

                minWidth: 0,

                border:
                  "1px solid",

                borderColor:
                  "divider",

                borderRadius: 2,

                bgcolor:
                  "background.paper",

                boxShadow:
                  theme.palette
                      .mode ===
                    "dark"
                    ? "none"
                    : theme
                        .shadows[1],

                p: {
                  xs: 1.25,
                  sm: 1.5,
                  md: 2,
                },

                overflow:
                  "hidden",
              }}
            >
              {/* HEADER */}

              <Box
                sx={{
                  width:
                    "100%",

                  minWidth: 0,

                  display:
                    "flex",

                  flexDirection: {
                    xs:
                      "column",
                    lg: "row",
                  },

                  justifyContent:
                    "space-between",

                  alignItems: {
                    xs:
                      "stretch",
                    lg: "center",
                  },

                  gap: 1.5,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    minWidth: 0,

                    flex: 1,
                  }}
                >
                  <MonetizationOnOutlinedIcon
                    sx={{
                      color:
                        "text.secondary",

                      fontSize: 21,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: {
                        xs: 12.5,
                        sm: 13.5,
                        md: 14.5,
                      },

                      lineHeight:
                        1.35,

                      fontWeight:
                        800,

                      color:
                        "text.primary",
                    }}
                  >
                    Ventas del Año (
                    {
                      reporte.year
                    }
                    ) — clic en una
                    barra para ver
                    detalle del mes
                  </Typography>
                </Stack>

                {/* FILTROS */}

                <Box
                  sx={{
                    flexShrink: 0,

                    display:
                      "grid",

                    gridTemplateColumns:
                      {
                        xs:
                          "minmax(0, 1fr)",

                        sm:
                          "repeat(2, minmax(140px, 1fr)) auto",
                      },

                    gap: 1,

                    alignItems:
                      "center",
                  }}
                >
                  <TextField
                    select
                    size="small"
                    label="Año"
                    value={
                      selectedYear
                    }
                    disabled={
                      loadingReporte
                    }
                    onChange={(
                      event,
                    ) =>
                      handleYearChange(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    sx={{
                      minWidth: {
                        sm: 145,
                      },
                    }}
                  >
                    {reporte.years.map(
                      (
                        year,
                      ) => (
                        <MenuItem
                          key={
                            year
                          }
                          value={
                            year
                          }
                        >
                          {year}
                        </MenuItem>
                      ),
                    )}
                  </TextField>

                  <TextField
                    select
                    size="small"
                    label="Mes"
                    value={
                      selectedMonth
                    }
                    disabled={
                      loadingReporte
                    }
                    onChange={(
                      event,
                    ) =>
                      handleMonthChange(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    sx={{
                      minWidth: {
                        sm: 145,
                      },
                    }}
                  >
                    {months.map(
                      (
                        month,
                        index,
                      ) => (
                        <MenuItem
                          key={
                            month
                          }
                          value={
                            index +
                            1
                          }
                        >
                          {month}
                        </MenuItem>
                      ),
                    )}
                  </TextField>

                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={
                      <VisibilityOutlinedIcon />
                    }
                    disabled={
                      loadingReporte ||
                      !selectedYear
                    }
                    onClick={() =>
                      void loadDetalle()
                    }
                    sx={{
                      minHeight: 40,

                      px: 2,

                      whiteSpace:
                        "nowrap",

                      fontSize:
                        10.5,

                      fontWeight:
                        800,

                      gridColumn: {
                        xs:
                          "1 / -1",
                        sm: "auto",
                      },
                    }}
                  >
                    Ver detalle
                  </Button>
                </Box>
              </Box>

              <Divider
                sx={{
                  my: 1.5,
                }}
              />

              <AnnualBarChart
                year={
                  reporte.year
                }
                months={
                  months
                }
                values={
                  reporte.ventas_anuales
                }
                selectedMonth={
                  selectedMonth
                }
                onMonthClick={
                  handleBarClick
                }
              />
            </Paper>
          </>
        )}

      {/* =====================================================
          VER DETALLE
      ===================================================== */}

      {vista ===
        "detalle" && (
          <>
            {/* ===============================================
                ENCABEZADO
            =============================================== */}

            <Box
              sx={{
                width: "100%",

                minWidth: 0,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: 1,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  minWidth: 0,
                }}
              >
                <Tooltip
                  title="Volver"
                  arrow
                >
                  <IconButton
                    size="small"
                    onClick={
                      handleBack
                    }
                    sx={{
                      flexShrink: 0,

                      border:
                        "1px solid",

                      borderColor:
                        "divider",

                      borderRadius:
                        1,
                    }}
                  >
                    <ArrowBackOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <AssessmentOutlinedIcon
                  sx={{
                    flexShrink: 0,

                    color:
                      "success.main",
                  }}
                />

                <Typography
                  sx={{
                    minWidth: 0,

                    fontSize: {
                      xs: 14,
                      sm: 16,
                      md: 18,
                    },

                    lineHeight:
                      1.25,

                    fontWeight:
                      900,
                  }}
                >
                  Registros de
                  ventas
                  {detalle
                    ? ` — ${detalle.month_name} ${detalle.year}`
                    : ""}
                </Typography>
              </Stack>

              <Tooltip
                title="Actualizar"
                arrow
              >
                <span>
                  <IconButton
                    size="small"
                    disabled={
                      loadingDetalle
                    }
                    onClick={
                      handleRefresh
                    }
                    sx={{
                      flexShrink: 0,

                      border:
                        "1px solid",

                      borderColor:
                        "divider",

                      borderRadius:
                        1,
                    }}
                  >
                    <RefreshOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {/* ===============================================
                CARGANDO
            =============================================== */}

            {loadingDetalle && (
              <Box
                sx={{
                  minHeight:
                    280,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  flexDirection:
                    "column",

                  gap: 1,
                }}
              >
                <CircularProgress
                  size={30}
                />

                <Typography
                  sx={{
                    fontSize:
                      11,

                    color:
                      "text.secondary",
                  }}
                >
                  Consultando
                  registros...
                </Typography>
              </Box>
            )}

            {/* ===============================================
                TABLA
            =============================================== */}

            {!loadingDetalle &&
              detalle && (
                <Paper
                  elevation={0}
                  sx={{
                    width:
                      "100%",

                    maxWidth:
                      "100%",

                    minWidth: 0,

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      2,

                    overflow:
                      "hidden",

                    bgcolor:
                      "background.paper",
                  }}
                >
                  {/* TÍTULO */}

                  <Box
                    sx={{
                      width:
                        "100%",

                      px: {
                        xs: 1,
                        sm: 1.5,
                        md: 2,
                      },

                      py: 1.5,

                      display:
                        "flex",

                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      gap: 1,

                      textAlign:
                        "center",
                    }}
                  >
                    <CalendarMonthOutlinedIcon
                      sx={{
                        flexShrink: 0,

                        color:
                          "success.main",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: {
                          xs: 13,
                          sm: 15,
                          md: 18,
                        },

                        lineHeight:
                          1.25,

                        fontWeight:
                          900,
                      }}
                    >
                      Registros de
                      ventas —{" "}
                      {
                        detalle.month_name
                      }{" "}
                      {
                        detalle.year
                      }
                    </Typography>
                  </Box>

                  {/* SIN REGISTROS */}

                  {detalleOrdenado.length ===
                  0 ? (
                    <Box
                      sx={{
                        py: 6,

                        px: 2,

                        textAlign:
                          "center",
                      }}
                    >
                      <Typography
                        color="text.secondary"
                        fontSize={12}
                      >
                        No existen
                        registros de
                        ventas para
                        este periodo.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer
                      sx={{
                        width:
                          "100%",

                        maxWidth:
                          "100%",

                        overflowX:
                          "hidden",
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          width:
                            "100%",

                          maxWidth:
                            "100%",

                          tableLayout:
                            "fixed",
                        }}
                      >
                        {/* ===================================
                            CABECERA
                        =================================== */}

                        <TableHead>
                          <TableRow
                            sx={{
                              bgcolor:
                                "success.dark",
                            }}
                          >
                            <TableCell
                              sx={{
                                width:
                                  "17%",

                                py: 1,

                                px: {
                                  xs: 0.5,
                                  md: 1.25,
                                },

                                color:
                                  "#FFFFFF",

                                borderBottom:
                                  0,

                                fontSize:
                                  9.5,

                                fontWeight:
                                  900,
                              }}
                            >
                              Empresa
                            </TableCell>

                            <TableCell
                              sx={{
                                width:
                                  "11%",

                                py: 1,

                                px: {
                                  xs: 0.4,
                                  md: 0.8,
                                },

                                color:
                                  "#FFFFFF",

                                borderBottom:
                                  0,

                                fontSize:
                                  9.5,

                                fontWeight:
                                  900,
                              }}
                            >
                              Fecha
                            </TableCell>

                            <TableCell
                              sx={{
                                width:
                                  "13%",

                                py: 1,

                                px: {
                                  xs: 0.4,
                                  md: 0.8,
                                },

                                color:
                                  "#FFFFFF",

                                borderBottom:
                                  0,

                                fontSize:
                                  9.5,

                                fontWeight:
                                  900,
                              }}
                            >
                              Paquete
                            </TableCell>

                            <TableCell
                              sx={{
                                width:
                                  "23%",

                                py: 1,

                                px: {
                                  xs: 0.4,
                                  md: 0.8,
                                },

                                color:
                                  "#FFFFFF",

                                borderBottom:
                                  0,

                                fontSize:
                                  9.5,

                                fontWeight:
                                  900,
                              }}
                            >
                              Correo
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                width:
                                  "10%",

                                py: 1,

                                px: {
                                  xs: 0.4,
                                  md: 0.8,
                                },

                                color:
                                  "#FFFFFF",

                                borderBottom:
                                  0,

                                fontSize:
                                  9.5,

                                fontWeight:
                                  900,
                              }}
                            >
                              Monto
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                width:
                                  "26%",

                                py: 1,

                                px: {
                                  xs: 0.35,
                                  md: 0.65,
                                },

                                color:
                                  "#FFFFFF",

                                borderBottom:
                                  0,

                                fontSize:
                                  9.5,

                                fontWeight:
                                  900,
                              }}
                            >
                              Acciones
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        {/* ===================================
                            FILAS
                        =================================== */}

                        <TableBody>
                          {detalleOrdenado.map(
                            (
                              registro,
                              index,
                            ) => {
                              const date =
                                getDateParts(
                                  registro.fecha,
                                );

                              return (
                                <TableRow
                                  key={
                                    registro.id
                                  }
                                  hover
                                  sx={{
                                    bgcolor:
                                      index %
                                          2 ===
                                        1
                                        ? alpha(
                                            theme
                                              .palette
                                              .text
                                              .primary,
                                            theme
                                                .palette
                                                .mode ===
                                              "dark"
                                              ? 0.035
                                              : 0.025,
                                          )
                                        : "background.paper",
                                  }}
                                >
                                  {/* EMPRESA */}

                                  <TableCell
                                    sx={{
                                      py: 1,

                                      px: {
                                        xs: 0.5,
                                        md: 1.25,
                                      },

                                      verticalAlign:
                                        "middle",

                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: 8.5,
                                          sm: 9.5,
                                          md: 10.5,
                                        },

                                        lineHeight:
                                          1.3,

                                        fontWeight:
                                          700,

                                        color:
                                          "text.primary",

                                        overflowWrap:
                                          "anywhere",

                                        wordBreak:
                                          "break-word",
                                      }}
                                    >
                                      {
                                        registro.empresa
                                      }
                                    </Typography>
                                  </TableCell>

                                  {/* FECHA */}

                                  <TableCell
                                    sx={{
                                      py: 1,

                                      px: {
                                        xs: 0.4,
                                        md: 0.8,
                                      },

                                      verticalAlign:
                                        "middle",

                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: 7.5,
                                          sm: 8.5,
                                          md: 10,
                                        },

                                        lineHeight:
                                          1.2,

                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {
                                        date.date
                                      }
                                    </Typography>

                                    {date.time && (
                                      <Typography
                                        sx={{
                                          mt: 0.15,

                                          fontSize: {
                                            xs: 6.8,
                                            sm: 7.5,
                                            md: 8.5,
                                          },

                                          lineHeight:
                                            1.15,

                                          color:
                                            "text.secondary",

                                          whiteSpace:
                                            "nowrap",
                                        }}
                                      >
                                        {
                                          date.time
                                        }
                                      </Typography>
                                    )}
                                  </TableCell>

                                  {/* PAQUETE */}

                                  <TableCell
                                    sx={{
                                      py: 1,

                                      px: {
                                        xs: 0.4,
                                        md: 0.8,
                                      },

                                      verticalAlign:
                                        "middle",

                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: 7.8,
                                          sm: 8.8,
                                          md: 10,
                                        },

                                        lineHeight:
                                          1.3,

                                        overflowWrap:
                                          "anywhere",

                                        wordBreak:
                                          "break-word",
                                      }}
                                    >
                                      {
                                        registro.paquete
                                      }
                                    </Typography>
                                  </TableCell>

                                  {/* CORREO */}

                                  <TableCell
                                    sx={{
                                      py: 1,

                                      px: {
                                        xs: 0.4,
                                        md: 0.8,
                                      },

                                      verticalAlign:
                                        "middle",

                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <Typography
                                      component="span"
                                      sx={{
                                        display:
                                          "block",

                                        width:
                                          "100%",

                                        maxWidth:
                                          "100%",

                                        fontSize: {
                                          xs: 7.5,
                                          sm: 8.5,
                                          md: 10,
                                        },

                                        lineHeight:
                                          1.3,

                                        fontWeight:
                                          700,

                                        color:
                                          "success.main",

                                        textDecoration:
                                          "underline",

                                        overflowWrap:
                                          "anywhere",

                                        wordBreak:
                                          "break-word",
                                      }}
                                    >
                                      {
                                        registro.correo
                                      }
                                    </Typography>
                                  </TableCell>

                                  {/* MONTO */}

                                  <TableCell
                                    align="right"
                                    sx={{
                                      py: 1,

                                      px: {
                                        xs: 0.4,
                                        md: 0.8,
                                      },

                                      verticalAlign:
                                        "middle",

                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: 7.5,
                                          sm: 8.5,
                                          md: 10,
                                        },

                                        lineHeight:
                                          1.2,

                                        fontWeight:
                                          800,

                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {formatMoney(
                                        registro.monto,
                                      )}
                                    </Typography>
                                  </TableCell>

                                  {/* ACCIONES */}

                                  <TableCell
                                    align="center"
                                    sx={{
                                      py: 0.65,

                                      px: {
                                        xs: 0.3,
                                        md: 0.6,
                                      },

                                      verticalAlign:
                                        "middle",

                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <RegistroActions
                                      registro={
                                        registro
                                      }
                                      onPendingAction={
                                        handlePendingAction
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              )}
          </>
        )}
    </Box>
  );
}