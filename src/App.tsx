import { useEffect, useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import AOS from "aos";

import { getTheme } from "./theme";
import AllRoutes from "./routes/Routes";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    AOS.init();
  }, []);

  // sincronización activa (MISMA pestaña + otras pestañas)
  useEffect(() => {
    const syncTheme = () => {
      const mode = localStorage.getItem("theme") === "dark";
      setDarkMode(mode);
    };

    window.addEventListener("storage", syncTheme);

    // 🔥 clave: sincroniza cambios dentro de la misma pestaña
    const interval = setInterval(syncTheme, 300);

    return () => {
      window.removeEventListener("storage", syncTheme);
      clearInterval(interval);
    };
  }, []);

  const theme = useMemo(() => getTheme(darkMode), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <AllRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}