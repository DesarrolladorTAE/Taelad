import {
  Box,
  Button,
  Typography,
  Switch,
} from "@mui/material";

import {
  Dashboard,
  People,
  AdminPanelSettings,
  ReceiptLong,
  Analytics,
  Apps,
  Logout,
  Settings,
  DarkMode,
  Loyalty,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usersApi } from "../../../services/api";

type Props = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  setView: (view: string) => void;
  activeView?: string;
};

export const SIDEBAR_WIDTH = 280;

export default function SideNav({
  darkMode,
  setDarkMode,
  setView,
  activeView = "dashboard",
}: Props) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    usersApi
      .getMe()
      .then((res) => {
        setUser(res.data.data ?? res.data.user ?? res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedTheme === "dark" || savedDarkMode === "true") {
      setDarkMode(true);
      localStorage.setItem("theme", "dark");
      localStorage.setItem("darkMode", "true");
      return;
    }

    if (savedTheme === "light" || savedDarkMode === "false") {
      setDarkMode(false);
      localStorage.setItem("theme", "light");
      localStorage.setItem("darkMode", "false");
    }
  }, [setDarkMode]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USER");
    localStorage.removeItem("superadmin_view");
    navigate("/auth/login");
  };

  const cambiarVista = (view: string) => {
    localStorage.setItem("superadmin_view", view);
    setView(view);

    if (view === "tea-te-da-mas") {
      window.setTimeout(() => {
        window.dispatchEvent(new Event("tea-te-da-mas:reset"));
      }, 0);
    }
  };

  const cambiarModoOscuro = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem("theme", value ? "dark" : "light");
    localStorage.setItem("darkMode", value ? "true" : "false");
  };

  const nombreCompleto =
    `${user?.name || ""} ${user?.apellidos || ""}`.trim();

  const isActive = (view: string) => {
    if (view === "sistemas") {
      return (
        activeView === "sistemas" ||
        activeView.startsWith("mitienda-")
      );
    }

    return activeView === view;
  };

  const menuButtonSx = (view: string) => (theme: any) => {
    const active = isActive(view);

    return {
      color: active
        ? theme.palette.primary.main
        : theme.palette.text.primary,
      backgroundColor: active
        ? theme.palette.action.selected
        : "transparent",
      justifyContent: "flex-start",
      mb: 1,
      gap: 1,
      textTransform: "none",
      fontWeight: active ? 800 : 600,
      minHeight: 42,
      borderRadius: 2,
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    };
  };

  return (
    <Box
      component="aside"
      sx={(theme) => ({
        width: SIDEBAR_WIDTH,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderRight: `1px solid ${theme.palette.divider}`,
        p: 3,
        overflowY: "auto",
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <Box
          component="img"
          src="/logo/logo.png"
          alt="Logo"
          sx={{ width: 55, height: "auto" }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={15} fontWeight={800} noWrap>
            Administrador
          </Typography>

          <Typography fontSize={12} noWrap>
            {nombreCompleto || "Cargando usuario..."}
          </Typography>

          <Typography fontSize={11} noWrap sx={{ opacity: 0.7 }}>
            {user?.email || ""}
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        sx={menuButtonSx("dashboard")}
        onClick={() => cambiarVista("dashboard")}
      >
        <Dashboard /> Dashboard
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("metricas")}
        onClick={() => cambiarVista("metricas")}
      >
        <Analytics /> Métricas generales
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("sistemas")}
        onClick={() => cambiarVista("sistemas")}
      >
        <Apps /> Sistemas
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("tea-te-da-mas")}
        onClick={() => cambiarVista("tea-te-da-mas")}
      >
        <Loyalty /> TEA te da más
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("facturacion")}
        onClick={() => cambiarVista("facturacion")}
      >
        <ReceiptLong /> Facturación
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("usuarios")}
        onClick={() => cambiarVista("usuarios")}
      >
        <People /> Usuarios
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("administradores")}
        onClick={() => cambiarVista("administradores")}
      >
        <AdminPanelSettings /> Administradores
      </Button>

      <Button
        fullWidth
        sx={menuButtonSx("configuracion")}
        onClick={() => cambiarVista("configuracion")}
      >
        <Settings /> Configuración
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
        <DarkMode />

        <Typography flex={1} fontSize={14}>
          Oscuro
        </Typography>

        <Switch
          checked={Boolean(darkMode)}
          color="primary"
          onChange={(e) => cambiarModoOscuro(e.target.checked)}
        />
      </Box>

      <Button
        fullWidth
        onClick={logout}
        sx={{ mt: 4, fontWeight: 600, gap: 1 }}
      >
        <Logout /> Cerrar sesión
      </Button>
    </Box>
  );
}