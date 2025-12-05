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
  ExpandLess,
  ExpandMore,
  Discount, 
  StarBorder, 
} from "@mui/icons-material";

const TarjetaJennys: React.FC = () => {
  const [open, setOpen] = useState(false);
  const whatsappLink =
   "https://wa.me/3131182277?text=Hola,%20quiero%20más%20información%20sobre%20el%20Balneario%20Rancho%20Santa%20María,%20promociones%20y%20costos.%20Gracias!";
  const logoUrl = "/Tarjetas/Banners/balneario_rancho_santa_maria.png";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(180deg,rgb(38, 179, 255) 0%,rgb(0, 154, 148) 100%)",
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
            alt=" Balneario Rancho Santa Maria"
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              border: "3px solid white",
            }}
          />
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Balneario Rancho Santa Maria
          </Typography>

          <Stack spacing={1} mb={2}>
            <Button
              variant="contained"
              color="warning"
              href="tel:+523131182277"
              fullWidth
            >
              Contacto
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "rgb(220, 173, 5)", // color marrón oscuro
                border: "1px solidrgb(239, 137, 48)", // borde claro como en la imagen
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#933b1a", // un poco más oscuro al hacer hover
                },
              }}
              fullWidth
              startIcon={<Email />}
              href="mailto:balneario.rancho.santa.maria@gmail.com"
            >
              E-mail
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#25D366",
                "&:hover": { backgroundColor: "#1EBE5D" },
              }}
              fullWidth
              startIcon={<WhatsApp />}
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              color="warning"
              sx={{
                backgroundColor: "rgb(220, 173, 5)", // color marrón oscuro
                border: "1px solid #f6c07c", // borde claro como en la imagen
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#933b1a", // un poco más oscuro al hacer hover
                },
              }}
              fullWidth
              startIcon={<LocationOn />}
              href="https://maps.app.goo.gl/bxzRype6BXPtWiUh7"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ubicación
            </Button>
          </Stack>
          {/* <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Balneario Rancho Santa María
          </Typography> */}

          <List component="nav" aria-label="servicios" sx={{ color: "white" }}>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon sx={{ color: "white" }}>
                <Discount />
              </ListItemIcon>
              <ListItemText primary="Promociones y servicios" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  "Miércoles a viernes entrada GRATIS consumiendo en restaurante de mariscos y snacks",
                  "Opción de traer tus alimentos por solo $50 por persona (solo miércoles a viernes)",
                  "2 albercas medianas para niños y adultos",
                  "Lunes con acceso a 4 albercas y toboganes GRATIS al consumir alimentos",
                  "O paga entrada si traes tus alimentos (lunes únicamente)",
                  "No aplica en sábado, domingo ni días festivos",
                  "Prohibido el ingreso de envases de vidrio",
                  "Costo: $40 niños (3 a 10 años), $80 adolescentes y adultos",
                  "Ubicación: Km 32 de la autopista Colima-Manzanillo, Tecomán, cerca de Tecolapa",
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

        {/* Footer con íconos */}
        <Box mt={4}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Síguenos en redes
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <IconButton
              component="a"
              href="https://vm.tiktok.com/ZMexAJeUv/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <MusicNote />
            </IconButton>
            <IconButton
              component="a"
              href="https://instagram.com/balneario_rancho_santa_maria?igshid=YjM2YjNmNDA="
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <Instagram />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.facebook.com/balniariorancho.stamaria?mibextid=ZbWKwL"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <Facebook />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default TarjetaJennys;
