import * as React from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Grid,
  Link as MLink,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import {
  Email,
  Lock,
  Close,
  Phone,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import {
  authSession,
  requestResetCode,
  resetPasswordByCodeAndLogin,
} from "../../services/api/index";

const brandBlue = "#1577CE";
const brandOrange = "#C77B1C";
const brandBlack = "#0B0B0B";
const brandWhite = "#FFFFFF";

const theme = createTheme({
  palette: {
    primary: { main: brandBlue },
    secondary: { main: brandOrange },
    text: { primary: brandBlack },
    background: { default: brandWhite, paper: brandWhite },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});

function GoogleButton({
  onClick,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button fullWidth onClick={onClick} disabled={disabled} variant="outlined">
      Continuar con Google
    </Button>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  const [values, setValues] = React.useState({
    email_or_phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotStep, setForgotStep] = React.useState<1 | 2>(1);
  const [fp, setFp] = React.useState({
    phone: "",
    code: "",
    new_password: "",
    confirm_password: "",
  });
  const [fpErr, setFpErr] = React.useState<Record<string, string>>({});
  const [sendingCode, setSendingCode] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const redirectByRole = (roleValue: number) => {
    if (roleValue === 3) {
      navigate("/superadmin");
    } else if (roleValue === 2) {
      navigate("/admin");
    } else {
      navigate("/panel");
    }
  };

  React.useEffect(() => {
    if (!forgotOpen || forgotStep !== 2) return;
    if (countdown <= 0) return;

    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotOpen, forgotStep, countdown]);

  const onChange =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((s) => ({ ...s, [field]: e.target.value }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    const raw = values.email_or_phone.trim();

    if (!raw) {
      e.email_or_phone = "Correo o teléfono obligatorio";
    } else {
      const isEmail = /^\S+@\S+\.\S+$/.test(raw);
      const numericOnly = raw.replace(/\D/g, "");
      const isPhone = /^\d{10}$/.test(numericOnly);

      if (!isEmail && !isPhone) {
        e.email_or_phone =
          "Ingresa un correo válido o un teléfono de 10 dígitos";
      }
    }

    if (!values.password) {
      e.password = "Contraseña obligatoria";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate("/"), 0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const identifier = /^\d+$/.test(values.email_or_phone)
        ? values.email_or_phone.replace(/\D/g, "")
        : values.email_or_phone;

      const { user } = await authSession.login(identifier, values.password);

      setSnack({ open: true, msg: `¡Hola, ${user.name}!`, type: "success" });

      const role = Number(user.role);
      redirectByRole(role);
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email_or_phone?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.message ||
        "No se pudo iniciar sesión.";

      setSnack({ open: true, msg: apiMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => {
    setForgotOpen(true);
    setForgotStep(1);
    setFp({ phone: "", code: "", new_password: "", confirm_password: "" });
    setFpErr({});
    setCountdown(60);
  };

  const validatePhone = () => {
    const e: Record<string, string> = {};
    const phone = fp.phone.replace(/\D/g, "").slice(0, 10);

    if (!/^\d{10}$/.test(phone)) {
      e.phone = "El teléfono debe tener 10 dígitos";
    }

    setFpErr(e);
    return Object.keys(e).length === 0;
  };

  const requestCode = async () => {
    if (!validatePhone()) return;

    try {
      setSendingCode(true);
      await requestResetCode(fp.phone.replace(/\D/g, "").slice(0, 10));
      setSnack({
        open: true,
        msg: "Código enviado por WhatsApp",
        type: "success",
      });
      setForgotStep(2);
      setCountdown(60);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo enviar el código.";
      setSnack({ open: true, msg, type: "error" });
    } finally {
      setSendingCode(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0 || sendingCode) return;
    await requestCode();
  };

  const validateReset = () => {
    const e: Record<string, string> = {};

    if (!/^\d{6}$/.test(fp.code)) e.code = "Código de 6 dígitos requerido";
    if (!fp.new_password) e.new_password = "Contraseña obligatoria";
    else if (fp.new_password.length < 8)
      e.new_password = "Mínimo 8 caracteres";
    if (fp.confirm_password !== fp.new_password) e.confirm_password = "No coincide";

    setFpErr(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validateReset()) return;

    try {
      setResetting(true);

      const phone = fp.phone.replace(/\D/g, "").slice(0, 10);

      await resetPasswordByCodeAndLogin({
        phone,
        code: fp.code,
        new_password: fp.new_password,
      });

      setSnack({
        open: true,
        msg: "Contraseña actualizada. Sesión iniciada.",
        type: "success",
      });
      setForgotOpen(false);
      navigate("/panel");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.code?.[0] ||
        err?.response?.data?.errors?.phone?.[0] ||
        err?.message ||
        "No se pudo restablecer la contraseña.";

      setSnack({ open: true, msg, type: "error" });
    } finally {
      setResetting(false);
    }
  };

  const handleGoogleClick = () => {
    setSnack({
      open: true,
      msg: "Integración con Google pendiente",
      type: "info",
    });
  };

  const isOnlyDigits = /^\d+$/.test(values.email_or_phone || "");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh" }} />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            overflow: "visible",
            boxShadow: "0 24px 60px rgba(0,0,0,.15)",
            border: "1px solid rgba(0,0,0,.06)",
          },
        }}
        BackdropProps={{
          sx: {
            background:
              "linear-gradient(115deg, rgba(21,119,206,.25), rgba(199,123,28,.25))",
            backdropFilter: "blur(3px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: 5,
          }}
        >
          <Box
            component="img"
            src="/logo/tae.png"
            alt="Logo TAE"
            sx={{ width: 96, height: "auto" }}
          />

          <Button
            onClick={handleClose}
            aria-label="Cerrar"
            sx={{
              minWidth: 0,
              p: 1,
              position: "absolute",
              right: 10,
              top: 10,
              color: brandBlack,
              bgcolor: "rgba(0,0,0,.04)",
              "&:hover": { bgcolor: "rgba(0,0,0,.08)" },
              borderRadius: "50%",
            }}
          >
            <Close fontSize="small" />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 4 }}>
          <Box textAlign="center" mb={1}>
            <Typography variant="h5" fontWeight={700}>
              Iniciar sesión
            </Typography>
            <Typography color="text.secondary">
              Bienvenido de vuelta. Ingresa tus credenciales.
            </Typography>
          </Box>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={onSubmit}
            mt={3}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo o teléfono (10 dígitos)"
                  placeholder="correo@dominio.com o 7441234567"
                  name="tae_login_identifier"
                  value={values.email_or_phone}
                  onChange={onChange("email_or_phone")}
                  error={!!errors.email_or_phone}
                  helperText={errors.email_or_phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="off"
                  autoFocus
                  inputProps={{
                    inputMode: isOnlyDigits ? "numeric" : "text",
                    autoComplete: "off",
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Contraseña"
                  name="tae_login_password"
                  value={values.password}
                  onChange={onChange("password")}
                  error={!!errors.password}
                  helperText={errors.password}
                  autoComplete="new-password"
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <MLink
                    component="button"
                    type="button"
                    onClick={openForgot}
                    underline="hover"
                    sx={{ fontSize: 13, color: "text.secondary" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </MLink>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    backgroundImage: `linear-gradient(135deg, ${brandBlue}, ${brandOrange})`,
                    boxShadow: "0 10px 24px rgba(21,119,206,.24)",
                    "&:hover": {
                      filter: "brightness(.96)",
                      boxShadow: "0 10px 24px rgba(199,123,28,.24)",
                      backgroundImage: `linear-gradient(135deg, ${brandBlue}, ${brandOrange})`,
                    },
                  }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : null
                  }
                >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }}>o</Divider>
              </Grid>

              <Grid item xs={12}>
                <GoogleButton onClick={handleGoogleClick} disabled={loading} />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={() => navigate("/auth/signup")}
                  sx={{
                    py: 1.3,
                    borderColor: brandBlack,
                    color: brandBlack,
                    ":hover": {
                      borderColor: brandBlack,
                      bgcolor: "rgba(0,0,0,.04)",
                    },
                  }}
                >
                  ¿No tienes cuenta? Crear cuenta
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Recuperar contraseña
          <IconButton
            onClick={() => setForgotOpen(false)}
            aria-label="Cerrar"
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {forgotStep === 1 && (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Ingresa tu teléfono de 10 dígitos. Te enviaremos un código por
                WhatsApp.
              </Typography>

              <TextField
                fullWidth
                label="Teléfono"
                value={fp.phone}
                onChange={(e) =>
                  setFp((s) => ({
                    ...s,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                error={!!fpErr.phone}
                helperText={fpErr.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ inputMode: "numeric" }}
                autoComplete="tel"
              />
            </>
          )}

          {forgotStep === 2 && (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Enviamos un código de 6 dígitos por WhatsApp al{" "}
                <b>{fp.phone}</b>.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Código de verificación"
                    value={fp.code}
                    onChange={(e) =>
                      setFp((s) => ({
                        ...s,
                        code: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    error={!!fpErr.code}
                    helperText={fpErr.code || "Ingresa el código recibido."}
                    inputProps={{ inputMode: "numeric" }}
                    autoComplete="one-time-code"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nueva contraseña"
                    value={fp.new_password}
                    onChange={(e) =>
                      setFp((s) => ({
                        ...s,
                        new_password: e.target.value,
                      }))
                    }
                    error={!!fpErr.new_password}
                    helperText={fpErr.new_password}
                    autoComplete="new-password"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmar contraseña"
                    value={fp.confirm_password}
                    onChange={(e) =>
                      setFp((s) => ({
                        ...s,
                        confirm_password: e.target.value,
                      }))
                    }
                    error={!!fpErr.confirm_password}
                    helperText={fpErr.confirm_password}
                    autoComplete="new-password"
                  />
                </Grid>
              </Grid>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Typography variant="caption" color="text.secondary">
                  {countdown > 0
                    ? `Puedes reenviar en ${countdown}s`
                    : "¿No recibiste el código?"}
                </Typography>

                <Button
                  onClick={resendCode}
                  disabled={countdown > 0 || sendingCode}
                  size="small"
                >
                  Reenviar código
                </Button>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {forgotStep === 1 ? (
            <>
              <Button onClick={() => setForgotOpen(false)}>Cancelar</Button>
              <Button
                onClick={requestCode}
                variant="contained"
                disabled={sendingCode}
                startIcon={
                  sendingCode ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : null
                }
              >
                {sendingCode ? "Enviando..." : "Enviar código"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setForgotOpen(false)}>Cancelar</Button>
              <Button
                onClick={handleReset}
                variant="contained"
                disabled={
                  resetting ||
                  !fp.code ||
                  !fp.new_password ||
                  !fp.confirm_password
                }
                startIcon={
                  resetting ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : null
                }
              >
                {resetting ? "Actualizando..." : "Actualizar y entrar"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.type}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}