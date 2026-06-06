import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  // Avatar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  Email,
  WhatsApp,
  Facebook,
  Instagram,
  ExpandLess,
  ExpandMore,
  LocalTaxi,
  AttachMoney,
  RequestQuote,
  Call,
  StarBorder,
  MusicNote,
} from "@mui/icons-material";

const EnlacesTerrestres: React.FC = () => {
  const [open, setOpen] = useState(false);

  const logoUrl = "/Tarjetas/Banners/juliotaxi.jpeg";

  const buttonStyle = {
    width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
    mx: "auto",
  };

  const mensaje = encodeURIComponent("Hola, necesito una factura 📄");

  const facturarLink = `https://api.whatsapp.com/send?phone=525614219586&text=${mensaje}`;

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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                background: "#111",
                borderRadius: "20px",
                p: 2,
                width: {
                  xs: 280,
                  sm: 340,
                  md: 400,
                },
                border: "2px solid rgba(255,255,255,.25)",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1)",
              }}
            >
              <Box
                component="img"
                src={logoUrl}
                alt="Frente Mexicano del Transporte"
                sx={{
                  width: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>

          <Typography variant="h5" fontWeight="bold" mb={3}>
            Frente Mexicano del Transporte
          </Typography>

          <Stack spacing={1.5} mb={2} alignItems="center" width="100%">
            <Button
              variant="contained"
              startIcon={<Call />}
              href="tel:5614219586"
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
            >
              Contacto
            </Button>

            <Button
              variant="contained"
              startIcon={<Email />}
              href="mailto:baseuribe@hotmail.com"
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                border: "1px solid #fff",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
            >
              E-mail
            </Button>

            <Button
              variant="contained"
              startIcon={<WhatsApp />}
              href="https://wa.me/5614219586?text=Hola,%20necesito%20un%20taxi%20por%20favor%20🙏"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...buttonStyle,
                bgcolor: "#25D366",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "#1EBE5D",
                },
              }}
            >
              Pedir Taxi
            </Button>

            <Button
              variant="outlined"
              startIcon={<AttachMoney />}
              href="https://linkdenegocio.mx/@enlacesterrestres/pagar"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                border: "1px solid #fff",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
            >
              Pagar
            </Button>

            <Button
              variant="outlined"
              startIcon={<RequestQuote />}
              href={facturarLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...buttonStyle,
                bgcolor: "#000",
                border: "1px solid #fff",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
            >
              Facturar
            </Button>
          </Stack>

          <Box
            sx={{
              ...buttonStyle,
              mt: 1,
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,.25)",
            }}
          >
            <Button
              fullWidth
              href="tel:*765"
              sx={{
                p: 0,
                minHeight: "unset",
                borderRadius: 0,
                display: "block",
                "&:hover": {
                  opacity: 0.95,
                  transform: "scale(1.01)",
                },
                transition: "all .25s ease",
              }}
            >
              <Box
                component="img"
                src="/Tarjetas/Banners/mensajesos.png"
                alt="Línea SOS Mujer"
                sx={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                }}
              />
            </Button>
          </Box>
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Nuestros Servicios
          </Typography>

          <List
            component="nav"
            aria-label="servicios"
            sx={{
              color: "white",
              width: {
                xs: "100%",
                sm: "80%",
                md: "60%",
                lg: "50%",
              },
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
                  "Reservaciones",
                  "Traslado de mascotas",
                  "Paquetería",
                  "Chofer",
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

          <Box
            sx={{
              mt: 2,
              width: "100%",
              overflow: "hidden",
              borderRadius: "16px",
              mx: "auto",

              "@keyframes taxiCarousel": {
                "0%": {
                  transform: "translateX(0)",
                },
                "100%": {
                  transform: "translateX(-50%)",
                },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "max-content",
                animation: "taxiCarousel 20s linear infinite",
                alignItems: "center",
                gap: 0,
              }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <Box
                  key={index}
                  component="img"
                  src="/Tarjetas/Banners/taxiseguro.png"
                  alt="Taxi Seguro"
                  sx={{
                    height: {
                      xs: 50,
                      sm: 70,
                      md: 90,
                    },
                    objectFit: "contain",
                    flexShrink: 0,
                    mr: "-12px",
                  }}
                />
              ))}
            </Box>
          </Box>

          <Typography variant="body2" mt={2}>
            ¡Contamos con facturación electrónica!
          </Typography>
        </div>

        <Box mt={4}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Síguenos en redes
          </Typography>

          <Stack direction="row" justifyContent="center" spacing={2}>
            <IconButton
              href="https://www.facebook.com/enlaces.terrestres.52/"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <Facebook />
            </IconButton>

            <IconButton
              href="https://www.instagram.com/terrestresenlaces/"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <Instagram />
            </IconButton>

            <IconButton
              href="https://www.tiktok.com/@enlaces.terrestre2?_t=ZS-8xkanqN6Kqf&_r=1"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <MusicNote />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default EnlacesTerrestres;
