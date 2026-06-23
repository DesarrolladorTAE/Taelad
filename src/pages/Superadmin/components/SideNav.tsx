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
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usersApi } from "../../../services/api";

type Props = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  setView: (view: string) => void;
};

export const SIDEBAR_WIDTH = 280;

export default function SideNav({
  darkMode,
  setDarkMode,
  setView,
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

  const logout = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USER");
    navigate("/auth/login");
  };

  const nombreCompleto =
    `${user?.name || ""} ${user?.apellidos || ""}`.trim();

  const menuButtonSx = (theme: any) => ({
    color: theme.palette.text.primary,
    justifyContent: "flex-start",
    mb: 1,
    gap: 1,
    textTransform: "none",
    fontWeight: 600,
    minHeight: 42,
    borderRadius: 2,
  });

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
      {/* HEADER */}
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

      {/* MENU */}
      <Button fullWidth sx={menuButtonSx} onClick={() => setView("dashboard")}>
        <Dashboard /> Dashboard
      </Button>

      <Button fullWidth sx={menuButtonSx} onClick={() => setView("metricas")}>
        <Analytics /> Métricas generales
      </Button>

      <Button fullWidth sx={menuButtonSx} onClick={() => setView("sistemas")}>
        <Apps /> Sistemas
      </Button>

      <Button fullWidth sx={menuButtonSx} onClick={() => setView("facturacion")}>
        <ReceiptLong /> Facturación
      </Button>

      <Button fullWidth sx={menuButtonSx} onClick={() => setView("usuarios")}>
        <People /> Usuarios
      </Button>

      <Button fullWidth sx={menuButtonSx} onClick={() => setView("administradores")}>
        <AdminPanelSettings /> Administradores
      </Button>

      <Button fullWidth sx={menuButtonSx} onClick={() => setView("configuracion")}>
        <Settings /> Configuración
      </Button>

      {/* DARK MODE TOGGLE */}
      <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
        <DarkMode />

        <Typography flex={1} fontSize={14}>
          Oscuro
        </Typography>

        <Switch
          checked={darkMode}
          onChange={(e) => {
            const value = e.target.checked;

            setDarkMode(value);
            localStorage.setItem(
              "theme",
              value ? "dark" : "light"
            );
          }}
        />
      </Box>

      {/* LOGOUT */}
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