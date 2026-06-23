import {
  Box,
  Button,
  Typography,
  Divider,
  Switch,
  Avatar,
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

export default function SideNav({ darkMode, setDarkMode, setView }: Props) {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    usersApi
      .getMe()
      .then((res) => {
        console.log("USUARIO:", res.data);
        setUser(res.data.data ?? res.data.user ?? res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USER");
    navigate("/auth/login");
  };

  const itemStyle = {
    color: darkMode ? "#FFFFFF" : "#111827",
    justifyContent: "flex-start",
    mb: 1,
    gap: 1,
    textTransform: "none",
    fontWeight: 600,
  };

  const nombreCompleto = `${user?.name || ""} ${user?.apellidos || ""}`.trim();

  return (
    <Box
      sx={{
        width: 280,
        background: darkMode ? "#111318" : "#FFFFFF",
        color: darkMode ? "#FFFFFF" : "#111827",
        p: 3,
        minHeight: "100vh",
        borderRight: darkMode ? "1px solid #2B3140" : "1px solid #E5E7EB",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 4,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg,#1577CE,#C77B1C)",
            color: "#FFFFFF",
          }}
        >
          <AdminPanelSettings />
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Administradora Paty
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              mt: 0.5,
              color: darkMode ? "#D1D5DB" : "#374151",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 185,
            }}
          >
            {nombreCompleto || "Cargando usuario..."}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              mt: 0.3,
              color: darkMode ? "#9CA3AF" : "#6B7280",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 185,
            }}
          >
            {user?.email || ""}
          </Typography>
        </Box>
      </Box>

      <Button fullWidth sx={itemStyle} onClick={() => setView("dashboard")}>
        <Dashboard />
        Dashboard
      </Button>

      <Button fullWidth sx={itemStyle} onClick={() => setView("metricas")}>
        <Analytics />
        Métricas generales
      </Button>

      <Button fullWidth sx={itemStyle} onClick={() => setView("sistemas")}>
        <Apps />
        Sistemas
      </Button>

      <Button fullWidth sx={itemStyle} onClick={() => setView("facturacion")}>
        <ReceiptLong />
        Facturación
      </Button>

      <Button fullWidth sx={itemStyle} onClick={() => setView("usuarios")}>
        <People />
        Usuarios
      </Button>

      <Button
        fullWidth
        sx={itemStyle}
        onClick={() => setView("administradores")}
      >
        <AdminPanelSettings />
        Administradores
      </Button>

      <Divider
        sx={{
          my: 3,
          borderColor: darkMode ? "#2B3140" : "#E5E7EB",
        }}
      />

      <Button fullWidth sx={itemStyle} onClick={() => setView("configuracion")}>
        <Settings />
        Configuración
      </Button>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          gap: 1,
        }}
      >
        <DarkMode />

        <Typography
          sx={{
            flex: 1,
            fontSize: 14,
          }}
        >
          Oscuro
        </Typography>

        <Switch
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
      </Box>

      <Button
        fullWidth
        onClick={logout}
        sx={{
          ...itemStyle,
          mt: 4,
        }}
      >
        <Logout />
        Cerrar sesión
      </Button>
    </Box>
  );
}