import { Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

type Props = {
  onClick: () => void;
};

export default function BackButton({ onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      startIcon={<ArrowBack />}
      sx={{
        mb: 3,
        textTransform: "none",
        fontWeight: 700,
      }}
    >
      Volver al panel
    </Button>
  );
}