import type { ReactNode } from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ExtensionIcon from "@mui/icons-material/Extension";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import {
  formatDate,
  formatMoney,
  planes,
  type Props,
  type TipoSuscripcion,
  useAgregarSuscripcionModal,
} from "./AgregarSuscripcionSoporte";

export default function AgregarSuscripcionModal(props: Props) {
  const { tienda } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const modal = useAgregarSuscripcionModal(props);

  return (
    <Dialog
      open={props.open}
      onClose={modal.handleClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: { xs: 0, md: 2 },
          width: { xs: "100%", md: "calc(100% - 64px)" },
          maxWidth: { xs: "100%", md: 1180 },
          height: {
            xs: "100dvh",
            md: "calc(100dvh - 32px)",
          },
          maxHeight: {
            xs: "100dvh",
            md: "calc(100dvh - 32px)",
          },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
        }),
      }}
    >
      <ModalHeader
        tiendaNombre={tienda?.name || "Sin tienda"}
        loading={modal.loading}
        isMobile={isMobile}
        onClose={modal.handleClose}
      />

      <DialogContent
        sx={{
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 3 },
          bgcolor: "background.default",
          flex: 1,
          minHeight: 0,
          overflowY: { xs: "auto", md: "hidden" },
          overflowX: "hidden",

          "& .MuiInputBase-root": {
            minHeight: { xs: 48, md: 44 },
          },
          "& .MuiInputLabel-root": {
            fontSize: { xs: 13, md: 13 },
          },
          "& .MuiAlert-root": {
            fontSize: { xs: 13, md: 13 },
          },
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          {modal.error && <Alert severity="error">{modal.error}</Alert>}

          <TabsSelector tipo={modal.tipo} onChange={modal.handleTipoChange} />

          {isMobile ? (
            <MobileLayout tiendaNombre={tienda?.name || "N/A"} modal={modal} />
          ) : (
            <DesktopLayout tiendaNombre={tienda?.name || "N/A"} modal={modal} />
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, md: 4 },
          py: { xs: 1.5, md: 2 },
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          gap: 1.5,
        }}
      >
        <Button
          onClick={modal.handleClose}
          disabled={modal.loading}
          sx={{
            fontWeight: 900,
            fontSize: { xs: 14, md: 14 },
            px: { xs: 2, md: 2.5 },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={modal.handleSubmit}
          startIcon={<CheckBoxIcon />}
          disabled={
            modal.loading ||
            modal.loadingHistorial ||
            (modal.tipo === "complemento" && !modal.complementoSeleccionado)
          }
          sx={{
            px: { xs: 4, md: 4 },
            py: { xs: 1.2, md: 1.1 },
            borderRadius: 2,
            fontWeight: 900,
            boxShadow: 3,
            fontSize: { xs: 15, md: 14 },
            minWidth: { xs: 170, md: 150 },
          }}
        >
          {modal.loading ? "Aplicando..." : "Aplicar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type ModalValue = ReturnType<typeof useAgregarSuscripcionModal>;

type LayoutProps = {
  tiendaNombre: string;
  modal: ModalValue;
};

function MobileLayout({ tiendaNombre, modal }: LayoutProps) {
  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          borderColor: "divider",
        }}
      >
        <AgregarSuscripcionForm modal={modal} isMobile />
      </Paper>

      {modal.mostrarCamposPago && (
        <AgregarSuscripcionResumen
          tiendaNombre={tiendaNombre}
          tipo={modal.tipo}
          conceptoNombre={modal.conceptoNombre}
          mesesPagados={modal.mesesPagados}
          mesesObtenidos={modal.mesesObtenidos}
          startsAt={modal.startsAt}
          endsAt={modal.endsAt}
          monto={modal.monto}
          complementoUnicoSeleccionado={modal.complementoUnicoSeleccionado}
          mobile
        />
      )}
    </Stack>
  );
}

function DesktopLayout({ tiendaNombre, modal }: LayoutProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1.1fr .9fr",
        gap: 3,
        minHeight: 0,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          borderColor: "divider",
          minHeight: 0,
        }}
      >
        <AgregarSuscripcionForm modal={modal} />
      </Paper>

      <AgregarSuscripcionResumen
        tiendaNombre={tiendaNombre}
        tipo={modal.tipo}
        conceptoNombre={modal.conceptoNombre}
        mesesPagados={modal.mesesPagados}
        mesesObtenidos={modal.mesesObtenidos}
        startsAt={modal.startsAt}
        endsAt={modal.endsAt}
        monto={modal.monto}
        complementoUnicoSeleccionado={modal.complementoUnicoSeleccionado}
      />
    </Box>
  );
}

type ModalHeaderProps = {
  tiendaNombre: string;
  loading: boolean;
  isMobile: boolean;
  onClose: () => void;
};

function ModalHeader({
  tiendaNombre,
  loading,
  isMobile,
  onClose,
}: ModalHeaderProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 2.5 },
        pb: { xs: 2, md: 2 },
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <IconButton
        onClick={onClose}
        disabled={loading}
        sx={(theme) => ({
          position: "absolute",
          top: { xs: 14, md: 18 },
          right: { xs: 14, md: 18 },
          bgcolor: theme.palette.action.hover,
          "&:hover": {
            bgcolor: alpha(theme.palette.text.primary, 0.08),
          },
        })}
      >
        <CloseIcon />
      </IconButton>

      <Typography
        fontWeight={900}
        fontSize={{ xs: 27, md: 28 }}
        lineHeight={1.1}
        sx={{ pr: 6 }}
      >
        Agregar suscripción
      </Typography>

      <Paper
        variant="outlined"
        sx={(theme) => ({
          mt: { xs: 2.5, md: 2 },
          p: { xs: 1.8, md: 0 },
          borderRadius: { xs: 2, md: 0 },
          border: { xs: "1px solid", md: "none" },
          borderColor: { xs: theme.palette.divider, md: "transparent" },
          bgcolor: {
            xs: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.06),
            md: "transparent",
          },
          boxShadow: "none",
        })}
      >
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={(theme) => ({
              width: { xs: 54, md: 48 },
              height: { xs: 54, md: 48 },
              borderRadius: { xs: 2, md: 2 },
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.12),
              color: theme.palette.primary.main,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            })}
          >
            <StorefrontIcon fontSize={isMobile ? "large" : "medium"} />
          </Box>

          <Box sx={{ minWidth: 0, pr: 5 }}>
            <Typography
              fontSize={{ xs: 12, md: 12 }}
              fontWeight={900}
              color="primary"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              Tienda seleccionada
            </Typography>

            <Typography
              fontWeight={900}
              fontSize={{ xs: 23, md: 24 }}
              noWrap
              sx={{
                maxWidth: { xs: "calc(100vw - 125px)", md: 720 },
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tiendaNombre}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

type TabsSelectorProps = {
  tipo: TipoSuscripcion;
  onChange: (value: TipoSuscripcion) => void;
};

function TabsSelector({ tipo, onChange }: TabsSelectorProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: 2,
        overflow: "hidden",
       bgcolor: "background.paper",
       color: "text.primary",
       borderColor: "divider",
      flexShrink: 0,
      }}
    >
      <TabButton
        active={tipo === "plan"}
        icon={<CalendarMonthIcon />}
        label="Plan"
        onClick={() => onChange("plan")}
      />

      <TabButton
        active={tipo === "complemento"}
        icon={<ExtensionIcon />}
        label="Complemento"
        onClick={() => onChange("complemento")}
      />
    </Paper>
  );
}

type TabButtonProps = {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <Button
      onClick={onClick}
      startIcon={icon}
      sx={(theme) => ({
        py: { xs: 1.35, md: 1.5 },
        borderRadius: 0,
        fontWeight: 900,
        fontSize: { xs: 15, md: 15 },
        bgcolor: active
          ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.10)
          : "transparent",
        color: active ? "primary.main" : "text.secondary",
        borderBottom: active ? "3px solid" : "3px solid transparent",
        borderColor: active ? "primary.main" : "transparent",
        "&:hover": {
          bgcolor: active
            ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12)
            : theme.palette.action.hover,
        },
      })}
    >
      {label}
    </Button>
  );
}

type AgregarSuscripcionFormProps = {
  modal: ModalValue;
  isMobile?: boolean;
};

function AgregarSuscripcionForm({
  modal,
  isMobile = false,
}: AgregarSuscripcionFormProps) {
  return (
    <Stack spacing={2}>
      {modal.tipo === "plan" && (
        <FormControl fullWidth size="small">
          <InputLabel>Selecciona un plan</InputLabel>
          <Select
            label="Selecciona un plan"
            value={modal.planId}
            onChange={(e) => modal.handlePlanChange(e.target.value)}
            renderValue={(selected) => {
              const plan = planes.find(
                (item) => String(item.id) === String(selected)
              );

              return (
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <WorkspacePremiumIcon color="primary" />
                  <span>
                    {plan?.id}. {plan?.nombre}
                  </span>
                </Stack>
              );
            }}
          >
            {planes.map((plan) => (
              <MenuItem key={plan.id} value={String(plan.id)}>
                {plan.id}. {plan.nombre} - ${plan.precio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {modal.tipo === "complemento" && (
        <FormControl fullWidth size="small" disabled={modal.loadingHistorial}>
          <InputLabel>Selecciona un complemento</InputLabel>
          <Select
            label="Selecciona un complemento"
            value={modal.complementoId}
            onChange={(e) => modal.handleComplementoChange(e.target.value)}
            renderValue={(selected) => {
              const complemento = modal.complementosDisponibles.find(
                (item) => String(item.complemento_id) === String(selected)
              );

              return (
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <ExtensionIcon color="primary" />
                  <span>{complemento?.nombre}</span>
                </Stack>
              );
            }}
          >
            {modal.complementosDisponibles.map((complemento) => (
              <MenuItem
                key={complemento.complemento_id}
                value={String(complemento.complemento_id)}
              >
                {complemento.nombre} - ${complemento.precio} / {complemento.tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {modal.tipo === "complemento" &&
        !modal.loadingHistorial &&
        modal.complementosDisponibles.length === 0 && (
          <Alert severity="info">
            No hay complementos disponibles para aplicar.
          </Alert>
        )}

      {modal.mostrarCamposPago && (
        <>
          {(modal.tipo === "plan" ||
            (modal.tipo === "complemento" &&
              modal.complementoSeleccionado &&
              !modal.complementoUnicoSeleccionado)) && (
            <TextField
              label="Meses pagados"
              type="number"
              value={modal.cantidad}
              onChange={(e) => modal.handleCantidadChange(e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRangeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {(modal.tipo === "plan" ||
            (modal.tipo === "complemento" &&
              modal.complementoSeleccionado &&
              !modal.complementoUnicoSeleccionado)) && (
            <MesesInfo
              mesesPagados={modal.mesesPagados}
              mesesObtenidos={modal.mesesObtenidos}
              mesesBonificados={modal.mesesBonificados}
            />
          )}

          {modal.tipo === "complemento" &&
            modal.complementoSeleccionado &&
            modal.complementoUnicoSeleccionado && (
              <Alert severity="info" icon={<InfoOutlinedIcon />}>
                Este complemento es de pago único. Solo se registrará fecha de
                inicio.
              </Alert>
            )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: modal.complementoUnicoSeleccionado
                  ? "1fr 1fr"
                  : "1fr 1fr 1fr",
              },
              gap: { xs: 2, md: 1.5 },
            }}
          >
            <TextField
              label="Monto a pagar"
              value={modal.monto}
              onChange={(e) => modal.setMonto(e.target.value)}
              fullWidth
              size="small"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              value={modal.startsAt}
              onChange={(e) => modal.setStartsAt(e.target.value)}
              fullWidth
              label="Fecha inicio"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRangeIcon />
                  </InputAdornment>
                ),
              }}
            />

            {modal.tipo === "plan" && (
              <TextField
                value={modal.endsAt}
                onChange={(e) => modal.setEndsAt(e.target.value)}
                fullWidth
                label="Fecha fin"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRangeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {modal.tipo === "complemento" &&
              modal.complementoSeleccionado &&
              !modal.complementoUnicoSeleccionado && (
                <TextField
                  value={modal.endsAt}
                  onChange={(e) => modal.setEndsAt(e.target.value)}
                  fullWidth
                  label="Fecha fin"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
          </Box>
        </>
      )}
    </Stack>
  );
}

type MesesInfoProps = {
  mesesPagados: number;
  mesesObtenidos: number;
  mesesBonificados: number;
};

function MesesInfo({
  mesesPagados,
  mesesObtenidos,
  mesesBonificados,
}: MesesInfoProps) {
  return (
    <Alert
      severity="info"
      icon={<InfoOutlinedIcon />}
      sx={(theme) => ({
        borderRadius: 2,
        bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.16 : 0.10),
        color: theme.palette.text.primary,
        lineHeight: 1.45,
        "& .MuiAlert-icon": {
          color: theme.palette.info.main,
        },
        "& .MuiAlert-message": {
          width: "100%",
        },
      })}
    >
      {mesesBonificados > 0 ? (
        <>
          Por cada 5 meses pagados, obtienes 1 mes adicional sin costo.
          <br />
          En este caso, al pagar {mesesPagados} mes(es) obtienes{" "}
          <strong>{mesesObtenidos} mes(es)</strong> en total.
        </>
      ) : (
        <>Pagas {mesesPagados} mes(es).</>
      )}
    </Alert>
  );
}

type AgregarSuscripcionResumenProps = {
  tiendaNombre: string;
  tipo: TipoSuscripcion;
  conceptoNombre: string;
  mesesPagados: number;
  mesesObtenidos: number;
  startsAt: string;
  endsAt: string;
  monto: string;
  complementoUnicoSeleccionado: boolean;
  mobile?: boolean;
};

function AgregarSuscripcionResumen({
  tipo,
  conceptoNombre,
  mesesPagados,
  mesesObtenidos,
  startsAt,
  endsAt,
  monto,
  complementoUnicoSeleccionado,
  mobile = false,
}: AgregarSuscripcionResumenProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: mobile ? 2 : 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "fit-content",
      }}
    >
      <Stack spacing={mobile ? 1.4 : 1.8}>
        <Stack direction="row" spacing={1.3} alignItems="center">
          <Box
            sx={(theme) => ({
              width: mobile ? 36 : 42,
              height: mobile ? 36 : 42,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.12),
              color: theme.palette.primary.main,
              display: "grid",
              placeItems: "center",
            })}
          >
            <CheckBoxIcon fontSize={mobile ? "small" : "medium"} />
          </Box>

          <Typography fontWeight={900} fontSize={22}>
            Resumen
          </Typography>
        </Stack>

        <Stack spacing={mobile ? 1 : 1.2}>
          <RowResumen
            label={tipo === "plan" ? "Plan:" : "Complemento:"}
            value={conceptoNombre}
          />

          <RowResumen
            label="Meses pagados:"
            value={
              complementoUnicoSeleccionado
                ? "Pago único"
                : `${mesesPagados} mes(es)`
            }
          />

          {!complementoUnicoSeleccionado && (
            <RowResumen
              label="Meses obtenidos:"
              value={`${mesesObtenidos} mes(es)`}
              highlight
            />
          )}
        </Stack>

        <Divider />

        <Stack spacing={mobile ? 1 : 1.2}>
          <RowResumen label="Inicio:" value={formatDate(startsAt)} />

          {!complementoUnicoSeleccionado && (
            <RowResumen label="Fin:" value={formatDate(endsAt)} />
          )}
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Typography fontSize={mobile ? 15 : 16} fontWeight={800}>
            Total a pagar:
          </Typography>

          <Typography
            fontWeight={900}
            fontSize={20}
            color="primary.main"
            textAlign="right"
          >
            {formatMoney(monto)}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

type RowResumenProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function RowResumen({ label, value, highlight = false }: RowResumenProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      sx={{ py: 0.3 }}
    >
      <Typography color="text.secondary" fontSize={14}>
        {label}
      </Typography>

      <Typography
        fontWeight={900}
        textAlign="right"
        fontSize={14}
        color={highlight ? "success.main" : "text.primary"}
      >
        {value}
      </Typography>
    </Stack>
  );
}