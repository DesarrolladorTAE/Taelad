import { createTheme } from "@mui/material/styles";

export const getTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",

      primary: {
        main: "#1577CE",
      },

      secondary: {
        main: "#C77B1C",
      },

      background: {
        default: darkMode ? "#0F1115" : "#F5F6FA",
        paper: darkMode ? "#171A21" : "#FFFFFF",
      },

      text: {
        primary: darkMode ? "#F9FAFB" : "#111827",
        secondary: darkMode ? "#9CA3AF" : "#6B7280",
      },

      divider: darkMode ? "#2B3140" : "#E5E7EB",

      action: {
        hover: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      },
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily: [
        "Inter",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Arial",
      ].join(","),
    },

    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
    },
  });