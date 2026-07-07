import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Grid,
  Link as MLink,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  InputAdornment,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Email,
  Lock,
  Person,
  Phone,
  Close,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { setAuthToken } from "../../services/axiosClient";

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
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
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
    <Button
      fullWidth
      onClick={onClick}
      disabled={disabled}
      variant="outlined"
      sx={{
        py: 1.3,
        borderColor: "#dadce0",
        color: brandBlack,
        bgcolor: brandWhite,
        "&:hover": { borderColor: "#dadce0", bgcolor: "rgba(0,0,0,.04)" },
        display: "flex",
        alignItems: "center",
        gap: 1.2,
      }}
    >
      <Box
        component="span"
        sx={{ display: "inline-flex", width: 20, height: 20 }}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 533.5 544.3"
        >
          <path
            fill="#4285f4"
            d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h147.8c-6.4 34.6-26 63.9-55.4 83.6v69.4h89.6c52.4-48.3 79.5-119.4 79.5-198z"
          />
          <path
            fill="#34a853"
            d="M272 544.3c72.2 0 132.9-23.9 177.2-64.9l-89.6-69.4c-24.9 16.7-56.7 26.5-87.6 26.5-67.3 0-124.4-45.4-144.9-106.3H36.1v66.6C79.8 487.5 170.9 544.3 272 544.3z"
          />
          <path
            fill="#fbbc05"
            d="M127.1 330.2c-10.4-31.1-10.4-64.6 0-95.7V167.9H36.1c-38.9 77.8-38.9 170.7 0 248.6l91-66.3z"
          />
          <path
            fill="#ea4335"
            d="M272 106.7c37.7-.6 74 12.9 101.6 38.2l75.9-75.9C405.1 24.3 343.5 0 272 0 170.9 0 79.8 56.8 36.1 160.2l91 66.3c20.5-61 77.6-106.3 144.9-106.3z"
          />
        </svg>
      </Box>
      Continuar con Google
    </Button>
  );
}

export default function Signin() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  const [values, setValues] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    accept: false,
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [otpOpen, setOtpOpen] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [sendingCode, setSendingCode] = React.useState(false);
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

  React.useEffect(() => {
    if (!otpOpen) return;
    if (countdown <= 0) return;

    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpOpen, countdown]);

  const onChange =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;

      if (field === "phone") {
        v = v.replace(/\D/g, "").slice(0, 10);
      }

      setValues((s) => ({ ...s, [field]: v }));
    };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!values.firstName.trim()) e.firstName = "Nombre obligatorio";
    if (!values.lastName.trim()) e.lastName = "Apellido obligatorio";

    if (!values.email.trim()) {
      e.email = "Correo obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      e.email = "Correo inválido";
    }

    if (values.phone.length !== 10) {
      e.phone = "El teléfono debe tener 10 dígitos";
    }

    if (!values.password) {
      e.password = "Contraseña obligatoria";
    }

    if (!values.accept) {
      e.accept = "Debes aceptar términos";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate("/"), 0);
  };

  const handleGoogleClick = () => {
    setSnack({
      open: true,
      msg: "Integración con Google pendiente",
      type: "info",
    });
  };

  const requestOtp = async () => {
    try {
      setSendingCode(true);

      const { data } = await authApi.requestCode(values.phone);

      setSnack({
        open: true,
        msg: data?.message || "Código enviado por WhatsApp.",
        type: "success",
      });

      setOtpOpen(true);
      setOtp("");
      setOtpError("");
      setCountdown(60);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo enviar el código. Intenta más tarde.";

      setSnack({ open: true, msg, type: "error" });
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await requestOtp();
  };

  const handleConfirmRegister = async () => {
    try {
      if (!/^\d{6}$/.test(otp)) {
        setOtpError("Ingresa el código de 6 dígitos.");
        return;
      }

      setOtpError("");
      setSubmitting(true);

      const payload = {
        name: values.firstName,
        apellidos: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        terminos: values.accept,
        code: otp,
      };

      const { data } = await authApi.register(payload);
      const res = data?.data;

      if (res?.token && res?.user) {
        setAuthToken(res.token);
        localStorage.setItem("token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));

        window.dispatchEvent(new Event("auth-updated"));
      }

      setSnack({ open: true, msg: "Registro exitoso", type: "success" });
      setOtpOpen(false);
      navigate("/panel");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo completar el registro.";

      setSnack({ open: true, msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    await requestOtp();
  };

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

          <IconButton
            onClick={handleClose}
            aria-label="Cerrar"
            sx={{
              p: 1,
              position: "absolute",
              right: 10,
              top: 10,
              color: brandBlack,
              bgcolor: "rgba(0,0,0,.04)",
              "&:hover": { bgcolor: "rgba(0,0,0,.08)" },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 4 }}>
          <Box textAlign="center" mb={1}>
            <Typography variant="h5" fontWeight={700}>
              Crear cuenta
            </Typography>

            <Typography color="text.secondary">
              Regístrate para empezar con TAE
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={onSubmit} mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={values.firstName}
                  onChange={onChange("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={values.lastName}
                  onChange={onChange("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Correo electrónico"
                  value={values.email}
                  onChange={onChange("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono (10 dígitos)"
                  value={values.phone}
                  onChange={onChange("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  inputProps={{ inputMode: "numeric" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="tel"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Contraseña"
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
                          onMouseDown={(event) => event.preventDefault()}
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.accept}
                      onChange={(e) =>
                        setValues((s) => ({ ...s, accept: e.target.checked }))
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Acepto los{" "}
                      <MLink href="#" underline="hover">
                        Términos
                      </MLink>{" "}
                      y la{" "}
                      <MLink href="#" underline="hover">
                        Política de privacidad
                      </MLink>
                      .
                    </Typography>
                  }
                />

                {!!errors.accept && (
                  <Typography color="error" variant="caption">
                    {errors.accept}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={sendingCode}
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
                    sendingCode ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : null
                  }
                >
                  {sendingCode ? "Enviando código..." : "Crear cuenta"}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }}>o</Divider>
              </Grid>

              <Grid item xs={12}>
                <GoogleButton
                  onClick={handleGoogleClick}
                  disabled={sendingCode}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={() => navigate("/auth/login")}
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
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Verifica tu teléfono

          <IconButton
            onClick={() => setOtpOpen(false)}
            aria-label="Cerrar"
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enviamos un código de 6 dígitos por WhatsApp al{" "}
            <b>{values.phone}</b>.
          </Typography>

          <TextField
            fullWidth
            label="Código de verificación"
            value={otp}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(v);
              setOtpError("");
            }}
            error={!!otpError}
            helperText={otpError || "Ingresa el código que recibiste."}
            inputProps={{ inputMode: "numeric" }}
          />

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
              onClick={handleResend}
              disabled={countdown > 0 || sendingCode}
              size="small"
            >
              Reenviar código
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOtpOpen(false)}>Cancelar</Button>

          <Button
            onClick={handleConfirmRegister}
            variant="contained"
            disabled={!otp || otp.length !== 6 || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : null
            }
          >
            {submitting ? "Verificando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
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