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
  FormControlLabel,
  Grid,
  Link as MLink,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  InputAdornment,
  Divider,
} from "@mui/material";
import { Email, Lock, Person, Phone, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Colores basados en tu logo
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
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const onChange =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (field === "phone") {
        v = v.replace(/\D/g, "").slice(0, 10); // solo 10 dígitos
      }
      setValues((s) => ({ ...s, [field]: v }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.firstName.trim()) e.firstName = "Nombre obligatorio";
    if (!values.lastName.trim())  e.lastName  = "Apellido obligatorio";
    if (!values.email.trim())     e.email     = "Correo obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Correo inválido";
    if (values.phone.length !== 10) e.phone   = "El teléfono debe tener 10 dígitos";
    if (!values.password)          e.password = "Contraseña obligatoria";
    if (!values.accept)            e.accept   = "Debes aceptar términos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    setOpen(false);
    // vuelve a la vista anterior o cambia por navigate("/landing", { replace: true })
    setTimeout(() => navigate(-1), 0);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: enviar datos a tu API
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Un container para centrar el modal (opcional, solo para fondo) */}
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
            src="/logo/tae.png"   // ← tu ruta de asset
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
                  autoComplete="new-password"
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
                  Crear cuenta
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
                  onClick={() => navigate("/auth/login")}
                  sx={{
                    py: 1.3,
                    borderColor: brandBlack,
                    color: brandBlack,
                    ":hover": { borderColor: brandBlack, bgcolor: "rgba(0,0,0,.04)" },
                  }}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
