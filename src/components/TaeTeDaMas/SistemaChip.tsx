// src/components/TaeTeDaMas/SistemaChip.tsx
import { Chip, Typography } from "@mui/material";

type Props = {
  value?: string | null;
};

export function SistemaChip({ value }: Props) {
  const SISTEMAS_CHIP: Record<
    string,
    { label: string; bg: string; color: string }
  > = {
    mtelmx: {
      label: "MiTiendaEnLineaMX",
      bg: "#FFC107",
      color: "#111111",
    },

    taeconta: {
      label: "TAEConta",
      bg: "#FF7A00", // Naranja intenso
      color: "#ffffff",
    },

    clicmenu: {
      label: "ClicMenu",
      bg: "#C95E38", // Terracota del logo
      color: "#ffffff",
    },

    telorecargo: {
      label: "TeLoRecargo",
      bg: "#0B57D0",
      color: "#ffffff",
    },

    tae: {
      label: "TAE",
      bg: "#1E40AF", // Azul diferente al de TeLoRecargo
      color: "#ffffff",
    },
  };

  const key = (value || "").toLowerCase().trim();
  const config = SISTEMAS_CHIP[key];

  if (!config) {
    return (
      <Typography sx={{ fontSize: { xs: 11, md: 12 } }}>
        {value || "—"}
      </Typography>
    );
  }

  return (
    <Chip
      size="small"
      label={config.label}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: "none",
        borderRadius: "8px",
        px: 0.4,
        boxShadow: "0 2px 6px rgba(0,0,0,.12)",
        fontSize: { xs: 10, md: 11 },
      }}
    />
  );
}