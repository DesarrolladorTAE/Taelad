import React, { useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Drawer, FormControlLabel, Switch, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideNav from "./SideNav";

export const brandBlue = "#1577CE" as const;
export const brandOrange = "#C77B1C" as const;
export const brandBlack = "#0B0B0B" as const;
export const brandWhite = "#FFFFFF" as const;

const drawerWidth = 260;

function useBrandTheme(mode: "light" | "dark" = "light") {
  return useMemo(() => createTheme({
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
      fontFamily: ["Inter","system-ui","Segoe UI","Roboto","Helvetica Neue","Arial"].join(","),
      h4: { fontWeight: 700, letterSpacing: -0.3 },
      h5: { fontWeight: 700, letterSpacing: -0.2 },
      button: { textTransform: "none", fontWeight: 600 },
    },
  }), [mode]);
}

export default function Shell({ children, title = "" }: { children: React.ReactNode; title?: string; }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light"); // ✅ claro por defecto
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
            width: drawerWidth, flexShrink: 0, display: { xs: "none", md: "block" },
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", borderRight: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" },
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
