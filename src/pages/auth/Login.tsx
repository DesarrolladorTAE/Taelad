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
  Divider,
  FormControlLabel,
  Grid,
  Link as MLink,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Si quieres seguir usando las imágenes de tus assets:
import google from "../../assets/images/auth-icon/google.png";
import twitter from "../../assets/images/auth-icon/twitter.png";
import facebook from "../../assets/images/auth-icon/facebook.png";

// Paleta basada en tu logo
const brandBlue   = "#1577CE";
const brandOrange = "#C77B1C";
const brandBlack  = "#0B0B0B";
const brandWhite  = "#FFFFFF";

const theme = createTheme({
  palette: {
    primary:   { main: brandBlue },
    secondary: { main: brandOrange },
    text: { primary: brandBlack },
    background: { default: brandWhite, paper: brandWhite },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

export default function Login() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  const [values, setValues] = React.useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const onChange =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setValues((s) => ({ ...s, [field]: v as any }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.email.trim()) e.email = "Correo obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Correo inválido";
    if (!values.password) e.password = "Contraseña obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    setOpen(false);
    // Vuelve a la pantalla anterior o a la que prefieras:
    setTimeout(() => navigate(-1), 0);
    // o: navigate("/landing", { replace: true })
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: login contra tu API
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Fondo detrás del modal (opcional) */}
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
            border: `1px solid rgba(0,0,0,.06)`,
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
        {/* Header con logo y botón cerrar */}
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
            src="/logo/tae.png"   // ← tu ruta de logo en assets públicos
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

          <Box component="form" noValidate onSubmit={onSubmit} mt={3}>
            <Grid container spacing={2}>
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
                  autoFocus
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña"
                  value={values.password}
                  onChange={onChange("password")}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="current-password"
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  

                  {/* Implementa esta ruta cuando la tengas */}
                  <MLink
                    component="button"
                    type="button"
                    onClick={() => navigate("/auth/forgot")}
                    underline="hover"
                    sx={{ fontSize: 13, color: "text.secondary" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </MLink>
                </Box>
              </Grid>

              <Grid item xs={12}>
                {/* Botón principal con gradiente azul → naranja */}
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
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
                >
                  Iniciar sesión
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
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
                    ":hover": { borderColor: brandBlack, bgcolor: "rgba(0,0,0,.04)" },
                  }}
                >
                  ¿No tienes cuenta? Crear cuenta
                </Button>
              </Grid>


            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
