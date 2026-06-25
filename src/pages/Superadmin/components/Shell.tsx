import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SideNav, { SIDEBAR_WIDTH } from "./SideNav";

type Props = {
  children: (
    darkMode: boolean,
    view: string,
    setView: (view: string) => void
  ) => React.ReactNode;
};

const VIEW_STORAGE_KEY = "superadmin_view";

export default function Shell({ children }: Props) {
  const [darkMode, setDarkMode] = useState(false);

  const [view, setViewState] = useState<string>(() => {
    if (typeof window === "undefined") return "dashboard";
    return localStorage.getItem(VIEW_STORAGE_KEY) || "dashboard";
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const setView = (nextView: string) => {
    setViewState(nextView);

    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_STORAGE_KEY, nextView);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    }
  }, [view]);

  const handleNavigate = (nextView: string) => {
    setView(nextView);
    setMobileOpen(false);
  };

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      })}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          backgroundColor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography fontWeight={800} noWrap>
            Panel administrador
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <SideNav
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setView={handleNavigate}
          activeView={view}
        />
      </Drawer>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <SideNav
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setView={setView}
          activeView={view}
        />
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          boxSizing: "border-box",
          p: { xs: 2, sm: 2.5, md: 3 },
          pt: { xs: 9, md: 3 },
        }}
      >
        <Box sx={{ width: "100%", minWidth: 0 }}>
          {children(darkMode, view, setView)}
        </Box>
      </Box>
    </Box>
  );
}