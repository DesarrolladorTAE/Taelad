import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Typography,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StoreIcon from "@mui/icons-material/Store";
import HistoryIcon from "@mui/icons-material/History";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LogoutIcon from "@mui/icons-material/Logout";
import { brandBlack, brandBlue } from "./Shell";
import { authSession } from "../../../services/api";

const navItems = [
  { label: "Dashboard", to: "/panel", icon: <DashboardIcon />, exact: true },
  { label: "Mi cuenta", to: "/panel/mi-cuenta", icon: <AccountCircleIcon /> },
  { label: "Datos fiscales", to: "/panel/datos-fiscales", icon: <ReceiptLongIcon /> },
  { label: "Productos TAE", to: "/panel/productos-tae", icon: <StoreIcon /> },
  { label: "Historial de compras", to: "/panel/historial-compras", icon: <HistoryIcon /> },
  { label: "TAE te da más", to: "/panel/tae-te-da-mas", icon: <WorkspacePremiumIcon /> },
  { label: "Configuración", to: "/panel/configuracion", icon: <SettingsIcon /> },
];

export default function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name?: string; apellidos?: string } | null>(null);

  // Cargar sesión inicial
  useEffect(() => {
    const session = authSession.getSession();
    if (session?.user) {
      const { name, apellidos } = session.user;
      setUser({ name, apellidos: apellidos || "" });
    }
  }, []);

  // Suscribirse a:
  // - Evento custom "auth:user-changed" (mismo tab)
  // - Evento "storage" (otro tab/ventana)
  // - Enfoque/visibilidad para refrescar cuando vuelves a la pestaña
  useEffect(() => {
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const u = ce.detail;
      setUser({ name: u?.name, apellidos: u?.apellidos || "" });
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_user" && e.newValue) {
        try {
          const u = JSON.parse(e.newValue);
          setUser({ name: u?.name, apellidos: u?.apellidos || "" });
        } catch {}
      }
    };

    const refreshFromSession = () => {
      const session = authSession.getSession();
      if (session?.user) {
        const { name, apellidos } = session.user;
        setUser({ name, apellidos: apellidos || "" });
      }
    };

    const onFocus = () => refreshFromSession();
    const onVisibility = () => { if (!document.hidden) refreshFromSession(); };

    window.addEventListener("auth:user-changed", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("auth:user-changed", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleLogout = () => {
    authSession.logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Encabezado con logo y nombre del usuario */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          src="/logo/tae.png"
          alt="Logo TAE"
          sx={{ bgcolor: brandBlack, border: `2px solid ${brandBlue}`, width: 50, height: 50 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {user ? `${user.name} ${user.apellidos || ""}` : "Cargando..."}
          </Typography>
          <Chip size="small" label="Usuario" color="primary" variant="outlined" />
        </Box>
      </Box>

      <Divider />

      {/* Navegación principal */}
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

      {/* Botón de logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Salir" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
