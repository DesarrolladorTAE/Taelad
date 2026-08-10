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
  ButtonBase,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import {
  getTaecontaSystemTimbres,
} from "../../../services/superadminService";

import type {
  TaecontaTimbreDetail,
} from "./types";

type Props = {
  onOpenDetail: (
    type: TaecontaTimbreDetail,
  ) => void;
};

type TimbresData = {
  id?: number;

  total_pac?:
    | number
    | string
    | null;

  total_asignados?:
    | number
    | string
    | null;

  total_disponible?:
    | number
    | string
    | null;

  total_disponibles?:
    | number
    | string
    | null;

  rfc_pac?:
    | string
    | null;

  [key: string]: unknown;
};

type ParsedTimbres = {
  principal:
    | TimbresData
    | null;

  respaldo:
    | TimbresData
    | null;
};

function numberValue(
  value: unknown,
): number {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function formatNumber(
  value: unknown,
): string {
  return numberValue(
    value,
  ).toLocaleString(
    "es-MX",
  );
}

function parseResponse(
  response: unknown,
): ParsedTimbres {
  const raw =
    response as any;

  const candidates = [
    raw,
    raw?.data,
    raw?.data?.data,
  ];

  let principal:
    | TimbresData
    | null = null;

  let respaldo:
    | TimbresData
    | null = null;

  for (
    const candidate of candidates
  ) {
    if (
      !candidate ||
      typeof candidate !==
        "object"
    ) {
      continue;
    }

    const principalCandidate =
      candidate.timbres ??
      candidate.principal ??
      candidate.pac_principal;

    if (
      !principal &&
      principalCandidate &&
      typeof principalCandidate ===
        "object"
    ) {
      principal =
        principalCandidate;
    }

    /*
     * TAECONTA actualmente puede
     * devolver pacRespado.
     *
     * También soportamos pacRespaldo.
     */
    const respaldoCandidate =
      candidate.pacRespado ??
      candidate.pacRespaldo ??
      candidate.respaldo ??
      candidate.pac_respaldo;

    if (
      !respaldo &&
      respaldoCandidate &&
      typeof respaldoCandidate ===
        "object"
    ) {
      respaldo =
        respaldoCandidate;
    }
  }

  if (
    !principal &&
    raw &&
    typeof raw === "object" &&
    (
      raw.total_pac !==
        undefined ||
      raw.total_asignados !==
        undefined
    )
  ) {
    principal = raw;
  }

  return {
    principal,
    respaldo,
  };
}

type MetricCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;

  onClick: () => void;
};

function MetricCard({
  label,
  value,
  icon,
  color,
  onClick,
}: MetricCardProps) {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",

        display: "block",

        textAlign: "left",

        borderRadius: 1.5,

        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",

          width: "100%",
          minHeight: 102,

          p: 1.35,

          border: "1px solid",

          borderColor:
            alpha(
              color,
              isDark
                ? 0.5
                : 0.25,
            ),

          borderRadius: 1.5,

          bgcolor:
            alpha(
              color,
              isDark
                ? 0.12
                : 0.055,
            ),

          transition:
            "background-color 120ms ease, border-color 120ms ease, transform 120ms ease",

          "&:hover": {
            borderColor: color,

            bgcolor:
              alpha(
                color,
                isDark
                  ? 0.18
                  : 0.09,
              ),

            transform:
              "translateY(-1px)",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box minWidth={0}>
            <Typography
              sx={{
                color,

                fontSize: {
                  xs: 24,
                  md: 28,
                },

                fontWeight: 900,

                lineHeight: 1,
              }}
            >
              {formatNumber(
                value,
              )}
            </Typography>

            <Typography
              sx={{
                mt: 0.7,

                fontSize: 11.5,

                fontWeight: 800,

                color:
                  "text.primary",
              }}
            >
              {label}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 34,
              height: 34,

              flexShrink: 0,

              display: "grid",

              placeItems:
                "center",

              borderRadius:
                1.25,

              color,

              bgcolor:
                alpha(
                  color,
                  isDark
                    ? 0.21
                    : 0.1,
                ),

              "& svg": {
                fontSize: 20,
              },
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={0.35}
          alignItems="center"
          sx={{
            position:
              "absolute",

            right: 9,
            bottom: 7,

            color:
              "text.secondary",
          }}
        >
          <Typography
            fontSize={9.5}
            fontWeight={700}
          >
            Ver detalle
          </Typography>

          <ArrowForwardOutlinedIcon
            sx={{
              fontSize: 12,
            }}
          />
        </Stack>
      </Box>
    </ButtonBase>
  );
}

export default function TaecontaTimbres({
  onOpenDetail,
}: Props) {
  const theme = useTheme();

  const [
    principal,
    setPrincipal,
  ] =
    useState<TimbresData | null>(
      null,
    );

  const [
    respaldo,
    setRespaldo,
  ] =
    useState<TimbresData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const cargar =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getTaecontaSystemTimbres();

        const parsed =
          parseResponse(
            response,
          );

        setPrincipal(
          parsed.principal,
        );

        setRespaldo(
          parsed.respaldo,
        );

        if (
          !parsed.principal &&
          !parsed.respaldo
        ) {
          setError(
            "No se encontró información de timbres.",
          );
        }
      } catch (error: any) {
        console.error(
          "ERROR TIMBRES TAECONTA:",
          error,
        );

        setPrincipal(null);
        setRespaldo(null);

        setError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "No fue posible consultar los timbres de TAECONTA.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const total =
    useMemo(
      () =>
        numberValue(
          principal
            ?.total_pac,
        ),
      [principal],
    );

  const asignados =
    useMemo(
      () =>
        numberValue(
          principal
            ?.total_asignados,
        ),
      [principal],
    );

  const disponibles =
    useMemo(
      () =>
        numberValue(
          principal
            ?.total_disponible ??
            principal
              ?.total_disponibles,
        ),
      [principal],
    );

  const backup =
    useMemo(
      () =>
        numberValue(
          respaldo
            ?.total_pac,
        ),
      [respaldo],
    );

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minWidth: 0,

        p: {
          xs: 1.25,
          sm: 1.5,
          md: 1.75,
        },

        border: "1px solid",
        borderColor: "divider",

        borderRadius: 1.5,

        bgcolor:
          "background.paper",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        mb={1.5}
      >
        <Box minWidth={0}>
          <Typography
            fontWeight={900}
            sx={{
              fontSize: {
                xs: 15,
                md: 16,
              },
            }}
          >
            Timbres CFDI
          </Typography>

          <Typography
            color="text.secondary"
            fontSize={11}
            mt={0.2}
          >
            Inventario actual de
            timbres.
          </Typography>
        </Box>

        <Button
          size="small"
          variant="text"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress
                size={14}
              />
            ) : (
              <RefreshOutlinedIcon />
            )
          }
          onClick={() =>
            void cargar()
          }
          sx={{
            flexShrink: 0,

            textTransform:
              "none",

            fontWeight: 700,
          }}
        >
          Actualizar
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 1.5,

            fontSize: 12,
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            minHeight: 210,

            display: "grid",

            placeItems:
              "center",
          }}
        >
          <CircularProgress
            size={28}
          />
        </Box>
      ) : (
        <>
          {/* PRIMERA FILA */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs:
                  "minmax(0, 1fr)",

                sm:
                  "repeat(2, minmax(0, 1fr))",

                lg:
                  "repeat(2, minmax(0, 1fr))",
              },

              gap: 1,
            }}
          >
            <MetricCard
              label="Timbres Totales"
              value={total}
              color={
                theme.palette
                  .primary.main
              }
              icon={
                <ConfirmationNumberOutlinedIcon />
              }
              onClick={() =>
                onOpenDetail(
                  "total",
                )
              }
            />

            <MetricCard
              label="Timbres Asignados"
              value={asignados}
              color={
                theme.palette
                  .warning.main
              }
              icon={
                <AssignmentTurnedInOutlinedIcon />
              }
              onClick={() =>
                onOpenDetail(
                  "asignados",
                )
              }
            />
          </Box>

          {/* SEGUNDA FILA */}

          <Box
            sx={{
              mt: 1,

              display: "grid",

              gridTemplateColumns: {
                xs:
                  "minmax(0, 1fr)",

                sm:
                  "repeat(2, minmax(0, 1fr))",
              },

              gap: 1,
            }}
          >
            <MetricCard
              label="Timbres Disponibles"
              value={disponibles}
              color={
                theme.palette.info
                  .main
              }
              icon={
                <Inventory2OutlinedIcon />
              }
              onClick={() =>
                onOpenDetail(
                  "disponibles",
                )
              }
            />

            <MetricCard
              label="Timbres Respaldo"
              value={backup}
              color={
                theme.palette
                  .secondary.main
              }
              icon={
                <BackupOutlinedIcon />
              }
              onClick={() =>
                onOpenDetail(
                  "respaldo",
                )
              }
            />
          </Box>

          <Box
            sx={{
              mt: 1.25,
              pt: 1,

              borderTop:
                "1px solid",

              borderColor:
                "divider",
            }}
          >
            <Typography
              color="text.secondary"
              fontSize={10.5}
              sx={{
                overflowWrap:
                  "anywhere",
              }}
            >
              PAC principal:{" "}
              <Box
                component="span"
                sx={{
                  color:
                    "text.primary",

                  fontWeight: 700,
                }}
              >
                {principal
                  ?.rfc_pac ||
                  "No disponible"}
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              fontSize={10.5}
              mt={0.25}
              sx={{
                overflowWrap:
                  "anywhere",
              }}
            >
              PAC respaldo:{" "}
              <Box
                component="span"
                sx={{
                  color:
                    "text.primary",

                  fontWeight: 700,
                }}
              >
                {respaldo
                  ?.rfc_pac ||
                  "No disponible"}
              </Box>
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}