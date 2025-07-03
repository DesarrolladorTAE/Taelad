import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Avatar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  LocationOn,
  Email,
  WhatsApp,
  Facebook,
  Instagram,
  MusicNote,
  YouTube,
  ExpandLess,
  ExpandMore,
  LocalTaxi,
  AttachMoney,
  RequestQuote,
  Call,
  StarBorder,
} from "@mui/icons-material";

const EnlacesTerrestres: React.FC = () => {
  const [open, setOpen] = useState(false);

  const whatsappLink =
    "https://wa.me/5210000000000?text=Hola,%20quiero%20pedir%20un%20taxi";
  const emailLink = "mailto:baseuribe@hotmail.com";
  const logoUrl = "/Tarjetas/Banners/juliotaxi.png";

  const buttonStyle = {
    width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
    mx: "auto",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(180deg, #ec008c 0%, #c40072 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: 4,
          p: 3,
          color: "#fff",
          boxShadow: 3,
          textAlign: "center",
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Avatar
            src={logoUrl}
            alt="Logo Conotaxi"
            sx={{
              width: 180,
              height: 180,
              mx: "auto",
              mb: 2,
              variant: "square", // opcional
            }}
          />

          <Typography variant="h5" fontWeight="bold" mb={3}>
            CONOTAXI
          </Typography>

          {/* Botones centrados */}
          <Stack spacing={1.5} mb={2} alignItems="center" width="100%">
            <Button
              variant="contained"
              startIcon={<Call />}
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Contacto
            </Button>

            <Button
              variant="contained"
              startIcon={<Email />}
              href={emailLink}
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                border: "1px solid #fff",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              E-mail
            </Button>

            <Button
              variant="contained"
              startIcon={<WhatsApp />}
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...buttonStyle,
                bgcolor: "#25D366",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#1EBE5D" },
              }}
            >
              Pedir taxi
            </Button>

            <Button
              variant="outlined"
              startIcon={<AttachMoney />}
              href="https://link.clip.mx/Taxienlaces/pagar"
              target="_blank"
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                border: "1px solid #fff",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Pagar
            </Button>

            <Button
              variant="outlined"
              startIcon={<RequestQuote />}
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                border: "1px solid #fff",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Facturar
            </Button>
          </Stack>

          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Nuestros Servicios
          </Typography>

          <List
            component="nav"
            aria-label="servicios"
            sx={{
              color: "white",
              width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
              mx: "auto",
            }}
          >
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon sx={{ color: "white" }}>
                <LocalTaxi />
              </ListItemIcon>
              <ListItemText primary="Modalidades de Servicio" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  "Viajes foráneos",
                  "Viajes por hora",
                  "Traslados ejecutivos",
                  "Servicios programados",
                  "Unidades con clima",
                ].map((item) => (
                  <ListItemButton key={item} sx={{ pl: 4 }}>
                    <ListItemIcon sx={{ color: "white" }}>
                      <StarBorder />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </List>
        </div>

        <Box mt={4}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Síguenos en redes
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <IconButton href="#" target="_blank" sx={{ color: "#fff" }}>
              <MusicNote />
            </IconButton>
            <IconButton href="#" target="_blank" sx={{ color: "#fff" }}>
              <Instagram />
            </IconButton>
            <IconButton href="#" target="_blank" sx={{ color: "#fff" }}>
              <Facebook />
            </IconButton>
            <IconButton href="#" target="_blank" sx={{ color: "#fff" }}>
              <YouTube />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default EnlacesTerrestres;
