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
  Agriculture, // ícono ejemplo
  StarBorder, // ícono ejemplo para subelementos
} from "@mui/icons-material";

const TarjetaJennys: React.FC = () => {
  const [open, setOpen] = useState(false);
  const whatsappLink =
    "https://wa.me/529621529658?text=Hola,%20quiero%20más%20información%20sobre%20tus%20productos";
  const logoUrl = "/Tarjetas/Banners/jennysbananasandfruits.png";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(180deg, #FFA726 0%, #FB8C00 100%)",
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
            alt="Jenny's Bananas and Fruits"
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              border: "3px solid white",
            }}
          />
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Jennys Bananas and Fruits
          </Typography>

          <Stack spacing={1} mb={2}>
            <Button
              variant="contained"
              color="warning"
              href="tel:+529621529658"
              fullWidth
            >
              Contacto
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#a8431e", // color marrón oscuro
                border: "1px solid #f6c07c", // borde claro como en la imagen
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#933b1a", // un poco más oscuro al hacer hover
                },
              }}
              fullWidth
              startIcon={<Email />}
              href="mailto:jennysbananas2022@gmail.com"
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
                backgroundColor: "#a8431e", // color marrón oscuro
                border: "1px solid #f6c07c", // borde claro como en la imagen
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#933b1a", // un poco más oscuro al hacer hover
                },
              }}
              fullWidth
              startIcon={<LocationOn />}
              href="https://maps.app.goo.gl/C4tPoXzafqGnP3rW6"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ubicación
            </Button>
          </Stack>

          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Nuestros Servicios
          </Typography>

          <List component="nav" aria-label="servicios" sx={{ color: "white" }}>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon sx={{ color: "white" }}>
                <Agriculture />
              </ListItemIcon>
              <ListItemText primary="Agroindustria y derivados del plátano macho" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  "Harina de plátano",
                  "Botanas",
                  "Tortillas",
                  "Polvorones",
                  "Puré de plátano",
                  "Y más...",
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

            <ListItemButton>
              <ListItemIcon sx={{ color: "white" }}>
                <StarBorder />
              </ListItemIcon>
              <ListItemText primary="Venta de productos de valor agregado" />
            </ListItemButton>
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
              href="https://www.tiktok.com/@jennysbananasandfruits"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <MusicNote />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.instagram.com/jennysbananas2022"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <Instagram />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.facebook.com/bananasSuchiate"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <Facebook />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.youtube.com/@jennysbananasandfruits1061"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#fff" }}
            >
              <YouTube />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default TarjetaJennys;
