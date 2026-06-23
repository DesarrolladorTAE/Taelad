import { Box } from "@mui/material";
import { useState } from "react";
import SideNav from "./SideNav";

type Props = {
  children: (
    darkMode: boolean,
    view: string,
    setView: (view: string) => void
  ) => React.ReactNode;
};

export default function Shell({ children }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState("dashboard");

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: darkMode ? "#0F1115" : "#F5F6FA",
        color: darkMode ? "#FFFFFF" : "#111827",
      }}
    >
      <SideNav
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setView={setView}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          p: 4,
          transition: "all .25s ease",
        }}
      >
        {children(darkMode, view, setView)}
      </Box>
    </Box>
  );
}