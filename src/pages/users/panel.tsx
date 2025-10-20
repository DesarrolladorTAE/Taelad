<<<<<<< HEAD
import React from "react";
import { Routes, Route } from "react-router-dom";
import Shell from "./components/Shell";
import Dashboard from "./components/Dashboard";
import MiCuenta from "./components/MiCuenta";
import DatosFiscales from "./components/DatosFiscales";
import Configuracion from "./components/Configuracion";
import ProductosTae from "./components/ProductosTae";
import HistorialCompras from "./components/HistorialCompras";
import TaeTeDaMas from "./components/TaeTeDaMas";
import SistemaDetalle from "./components/SistemaDetalle";

export default function UsersApp() {
  return (
    <Routes>
      <Route path="/" element={<Shell title="Panel de Sistemas"><Dashboard/></Shell>} />
      <Route path="/mi-cuenta" element={<Shell title="Mi cuenta"><MiCuenta/></Shell>} />
      <Route path="/datos-fiscales" element={<Shell title="Datos fiscales"><DatosFiscales/></Shell>} />
      <Route path="/configuracion" element={<Shell title="Configuración"><Configuracion/></Shell>} />

      {/* Secciones nuevas */}
      <Route path="/productos-tae" element={<Shell title="Productos TAE"><ProductosTae/></Shell>} />
      <Route path="/historial-compras" element={<Shell title="Historial de compras"><HistorialCompras/></Shell>} />
      <Route path="/tae-te-da-mas" element={<Shell title="TAE te da más"><TaeTeDaMas/></Shell>} />

      {/* Detalles por sistema */}
      <Route path="/sistema/taeconta" element={<Shell title="TAECONTA"><SistemaDetalle title="TAECONTA" image="/app/taeconta.png" /></Shell>} />
      <Route path="/sistema/mitienda" element={<Shell title="MiTiendaEnLineaMX"><SistemaDetalle title="MiTiendaEnLineaMX" image="/app/mitienda.png" /></Shell>} />
      <Route path="/sistema/telorecargo" element={<Shell title="Te Lo Recargo"><SistemaDetalle title="Te Lo Recargo" image="/app/telorecargo.png" /></Shell>} />
      <Route path="/sistema/tbt" element={<Shell title="The Business Ticket"><SistemaDetalle title="The Business Ticket" image="/app/thebusinessticket.svg" /></Shell>} />
    </Routes>
=======
import React, { useMemo, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Breadcrumbs,
  Link as MLink,
  Paper,
  Tabs,
  Tab,
  type PaletteMode,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StoreIcon from "@mui/icons-material/Store";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import BusinessIcon from "@mui/icons-material/Business";
import LogoutIcon from "@mui/icons-material/Logout";

// ===================== PALETA =====================
export const brandBlue = "#1577CE" as const;
export const brandOrange = "#C77B1C" as const;
export const brandBlack = "#0B0B0B" as const;
export const brandWhite = "#FFFFFF" as const;

// ===================== THEME =====================
const useBrandTheme = (mode: PaletteMode = "dark") =>
  useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: brandBlue },
          secondary: { main: brandOrange },
          background: {
            default: mode === "dark" ? "#0A0A0A" : brandWhite,
            paper: mode === "dark" ? "#111213" : "#F8FAFC",
          },
          text: {
            primary: mode === "dark" ? brandWhite : "#0E141B",
            secondary: mode === "dark" ? "#D1D5DB" : "#334155",
          },
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: [
            "Inter",
            "ui-sans-serif",
            "system-ui",
            "-apple-system",
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "Noto Sans",
            "Apple Color Emoji",
            "Segoe UI Emoji",
          ].join(","),
          h4: { fontWeight: 700, letterSpacing: -0.3 },
          h5: { fontWeight: 700, letterSpacing: -0.2 },
          button: { textTransform: "none", fontWeight: 600 },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(6px)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: { root: { borderRadius: 16 } },
          },
        },
      }),
    [mode]
  );

// ===================== TIPOS =====================
interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  exact?: boolean;
}

interface BreadcrumbItem { label: string; to: string }

interface PageProps {
  title: string;
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

interface ShellProps {
  children: ReactNode;
  title?: string;
}

interface SideNavProps {
  onNavigate?: () => void;
}

interface SystemDef {
  key: string;
  title: string;
  description: string;
  color: string;
  icon: ReactNode;
  image: string;
  to: string;
}

interface SystemCardProps { sys: SystemDef }

interface SistemaDetalleProps { title: string; image: string }

// ===================== LAYOUT =====================
const drawerWidth = 260;

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: <DashboardIcon />, exact: true },
  { label: "Mi cuenta", to: "/mi-cuenta", icon: <AccountCircleIcon /> },
  { label: "Datos fiscales", to: "/datos-fiscales", icon: <ReceiptLongIcon /> },
  { label: "Configuración", to: "/configuracion", icon: <SettingsIcon /> },
];

function Shell({ children, title = "" }: ShellProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PaletteMode>("dark");
  const theme = useBrandTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            backdropFilter: "blur(8px)",
            background: theme.palette.mode === "dark" ? "rgba(10,10,10,0.6)" : "rgba(255,255,255,0.6)",
          }}
        >
          <Toolbar>
            <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {title || "Panel de Sistemas"}
            </Typography>
            <FormControlLabel
              control={<Switch checked={mode === "dark"} onChange={() => setMode(mode === "dark" ? "light" : "dark")} />}
              label={mode === "dark" ? "Oscuro" : "Claro"}
            />
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: brandBlue }}>R</Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer móvil */}
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          <SideNav onNavigate={() => setOpen(false)} />
        </Drawer>

        {/* Drawer fijo */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            },
          }}
          open
        >
          <SideNav />
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minHeight: "100vh" }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function SideNav({ onNavigate }: SideNavProps) {
  const navigate = useNavigate();
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar src="/app/logo.png" alt="Logo" sx={{ bgcolor: brandBlack, border: `2px solid ${brandBlue}` }}>TAE</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Tecnologías Administrativas ELAD</Typography>
          <Chip size="small" label="Suite" color="primary" variant="outlined" />
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.to}
              onClick={onNavigate}
              sx={{ "&.active": { bgcolor: "action.selected" } }}
              end={item.exact}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/")}> 
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Salir" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

// ===================== PAGES =====================
const systems: SystemDef[] = [
  {
    key: "taeconta",
    title: "TAECONTA",
    description: "Contabilidad, facturación CFDI 4.0, nómina 1.2 y más.",
    color: brandOrange,
    icon: <BusinessIcon />,
    image: "/app/taeconta.png",
    to: "/sistema/taeconta",
  },
  {
    key: "mitiendaenlineamx",
    title: "MiTiendaEnLineaMX",
    description: "POS + Tienda en línea con reportes y suscripciones.",
    color: brandOrange,
    icon: <StoreIcon />,
    image: "/app/mitienda.png",
    to: "/sistema/mitienda",
  },
  {
    key: "telorecargo",
    title: "Te Lo Recargo",
    description: "Recargas electrónicas para revendedores y retail.",
    color: "#2bd3f5ff",
    icon: <FlashOnIcon />,
    image: "/app/telorecargo.png",
    to: "/sistema/telorecargo",
  },
  {
    key: "thebusinessticket",
    title: "The Business Ticket",
    description: "Tickets, control y trazabilidad de soporte.",
    color: "#8B5CF6",
    icon: <ConfirmationNumberIcon />,
    image: "/app/thebusinessticket.svg",
    to: "/sistema/tbt",
  },
];

function Dashboard() {
  return (
    <Page title="Dashboard">
      <Grid container spacing={2}>
        {systems.map((s) => (
          <Grid key={s.key} item xs={12} sm={6} lg={3}>
            <SystemCard sys={s} />
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}

function SystemCard({ sys }: SystemCardProps) {
  const navigate = useNavigate();
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={() => navigate(sys.to)} sx={{ flex: 1 }}>
        <CardMedia component="img" height="140" image={sys.image} alt={sys.title} />
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Avatar sx={{ bgcolor: sys.color, width: 28, height: 28 }}>{sys.icon}</Avatar>
            <Typography variant="h6" fontWeight={800}>{sys.title}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">{sys.description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function Page({ title, children, breadcrumbs }: PageProps) {
  return (
    <Stack spacing={2}>
      <Stack>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            {breadcrumbs.map((b, i) => (
              <MLink key={`${b.to}-${i}`} component={NavLink} color="inherit" to={b.to}>
                {b.label}
              </MLink>
            ))}
            <Typography color="text.primary">{title}</Typography>
          </Breadcrumbs>
        )}
        <Typography variant="h4">{title}</Typography>
      </Stack>
      {children}
    </Stack>
  );
}

function MiCuenta() {
  return (
    <Page title="Mi cuenta">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 96, height: 96, bgcolor: brandBlue }}>RA</Avatar>
              <Button variant="outlined">Cambiar foto</Button>
              <Stack spacing={1} sx={{ width: "100%" }}>
                <TextField label="Nombre" fullWidth defaultValue="Raúl Alvarez" />
                <TextField label="Email" fullWidth defaultValue="raul@ejemplo.com" />
                <TextField label="Teléfono" fullWidth defaultValue="+52 221 691 9071" />
                <Button variant="contained" size="large">Guardar cambios</Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Accesos rápidos</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label="Seguridad" variant="outlined" />
              <Chip label="Privacidad" variant="outlined" />
              <Chip label="Notificaciones" variant="outlined" />
              <Chip label="Suscripciones" variant="outlined" />
            </Stack>
          </Paper>
          <Box sx={{ height: 16 }} />
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Preferencias</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControlLabel control={<Switch defaultChecked />} label="Modo compacto" />
              <FormControlLabel control={<Switch />} label="Recordar sesión" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}

function DatosFiscales() {
  return (
    <Page title="Datos fiscales">
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Razón social" placeholder="ELAD y Asociados Consultores, S.C." />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="RFC" placeholder="EAC123456789" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Régimen fiscal" placeholder="601 - General de Ley Personas Morales" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Uso CFDI</InputLabel>
                  <Select label="Uso CFDI" defaultValue="G03">
                    <MenuItem value="G03">G03 - Gastos en general</MenuItem>
                    <MenuItem value="P01">P01 - Por definir</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Domicilio fiscal</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Calle" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="No. ext" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="No. int" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Colonia" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Municipio" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="CP" />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained">Guardar</Button>
                  <Button variant="outlined">Validar con SAT</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Archivos de certificados</Typography>
            <Stack spacing={1}>
              <Button variant="outlined">Subir .CER</Button>
              <Button variant="outlined">Subir .KEY</Button>
              <TextField label="Contraseña de sello" type="password" />
              <Button variant="contained">Guardar llaves</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}

function Configuracion() {
  const [tab, setTab] = useState(0);
  return (
    <Page title="Configuración">
      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="General" />
          <Tab label="Notificaciones" />
          <Tab label="Integraciones" />
          <Tab label="Avanzado" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre comercial" placeholder="Tecnologías Administrativas ELAD" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Dominio" placeholder="mitiendaenlineamx.com.mx" /></Grid>
              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch defaultChecked />} label="Modo oscuro por defecto" /></Grid>
              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch />} label="Habilitar beta features" /></Grid>
              <Grid item xs={12}><Button variant="contained">Guardar</Button></Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Stack spacing={2}>
              <FormControlLabel control={<Switch defaultChecked />} label="WhatsApp" />
              <FormControlLabel control={<Switch />} label="Correo electrónico" />
              <FormControlLabel control={<Switch />} label="SMS" />
              <Button variant="contained">Guardar preferencias</Button>
            </Stack>
          )}
          {tab === 2 && (
            <Stack spacing={2}>
              <TextField fullWidth label="API Key (Conekta)" placeholder="ck_test_xxx" />
              <TextField fullWidth label="Webhook URL" placeholder="https://api.tu-dominio.com/webhooks/conekta" />
              <Button variant="contained">Guardar integraciones</Button>
            </Stack>
          )}
          {tab === 3 && (
            <Stack spacing={2}>
              <FormControlLabel control={<Switch />} label="Activar modo mantenimiento" />
              <Button color="error" variant="outlined">Reiniciar caché</Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Page>
  );
}

function SistemaDetalle({ title, image }: SistemaDetalleProps) {
  return (
    <Page
      title={title}
      breadcrumbs={[{ label: "Dashboard", to: "/" }]}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <img src={image} alt={title} style={{ width: 120, borderRadius: 12 }} />
              <Box>
                <Typography variant="h6">Bienvenido a {title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accesos rápidos, KPIs y acciones frecuentes del sistema.
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {["Resumen", "Reportes", "Usuarios", "Ajustes"].map((t) => (
                <Grid key={t} item xs={12} sm={6} lg={3}>
                  <Card>
                    <CardActionArea>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700}>{t}</Typography>
                        <Typography variant="body2" color="text.secondary">Entrar</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Estado</Typography>
            <Stack spacing={1}>
              <Chip label="Activo" color="success" />
              <Chip label="Sin incidencias" color="info" variant="outlined" />
              <Chip label="Último acceso: hace 2h" variant="outlined" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}

// ===================== APP (ROUTER) =====================
export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Shell title="Panel de Sistemas">
              <Dashboard />
            </Shell>
          }
        />
        <Route
          path="/mi-cuenta"
          element={
            <Shell title="Mi cuenta">
              <MiCuenta />
            </Shell>
          }
        />
        <Route
          path="/datos-fiscales"
          element={
            <Shell title="Datos fiscales">
              <DatosFiscales />
            </Shell>
          }
        />
        <Route
          path="/configuracion"
          element={
            <Shell title="Configuración">
              <Configuracion />
            </Shell>
          }
        />
        <Route
          path="/sistema/taeconta"
          element={
            <Shell title="TAECONTA">
              <SistemaDetalle title="TAECONTA" image="/app/taeconta.png" />
            </Shell>
          }
        />
        <Route
          path="/sistema/mitienda"
          element={
            <Shell title="MiTiendaEnLineaMX">
              <SistemaDetalle title="MiTiendaEnLineaMX" image="/app/mitienda.png" />
            </Shell>
          }
        />
        <Route
          path="/sistema/telorecargo"
          element={
            <Shell title="Te Lo Recargo">
              <SistemaDetalle title="Te Lo Recargo" image="/app/telorecargo.png" />
            </Shell>
          }
        />
        <Route
          path="/sistema/tbt"
          element={
            <Shell title="The Business Ticket">
              <SistemaDetalle title="The Business Ticket" image="/app/thebusinessticket.svg" />
            </Shell>
          }
        />
      </Routes>
    </>
>>>>>>> 897231601a7809a98afd4b539e3338fff585ad47
  );
}
