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
  Email,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter as X,
  YouTube,
  ExpandLess,
  ExpandMore,
  LocalTaxi,
  AttachMoney,
  RequestQuote,
  Call,
  StarBorder,
  MusicNote,
} from "@mui/icons-material";

import { SvgIcon, SvgIconProps } from "@mui/material";
// import { FaTiktok } from "react-icons/fa6"; // <- fa6, no fa




const EnlacesTerrestres: React.FC = () => {
  const [open, setOpen] = useState(false);

  const logoUrl = "/Tarjetas/Banners/juliotaxi.png";

  const buttonStyle = {
    width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
    mx: "auto",
  };
  const mensaje = encodeURIComponent("Hola, necesito una factura 📄");
  const facturarLink = `https://api.whatsapp.com/send?phone=525614219586&text=${mensaje}`;

  const TwitterXIcon = (props: SvgIconProps) => (
    <SvgIcon {...props}>
      <path d="M21.35 3H17.7l-4.6 6.33L8.13 3H2.5l7.07 10.27L2.65 21h3.65l4.9-6.75L15.8 21h5.65l-7.4-10.67L21.35 3z" />
    </SvgIcon>
  );


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
              variant: "square",
            }}
          />

          <Typography variant="h5" fontWeight="bold" mb={3}>
            CONOTAXI
          </Typography>

          <Stack spacing={1.5} mb={2} alignItems="center" width="100%">
            <Button
              variant="contained"
              startIcon={<Call />}
              href="tel:5620670367"
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
              href="mailto:conotaxitx@gmail.com"
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
              href="https://wa.me/5620670367?text=Hola,%20necesito%20un%20taxi%20por%20favor%20🙏"
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
              href="https://clip.mx/@Taxienlaces"
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
              href={facturarLink}
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
              href="https://www.facebook.com/ConoTaxi"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <Facebook />
            </IconButton>
            <IconButton
              href="https://www.instagram.com/cono_taxi/"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <Instagram />
            </IconButton>
            <IconButton
              href="https://x.com/ConsejoTx"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <TwitterXIcon />
            </IconButton>

            <IconButton
              href="https://www.youtube.com/@hugoflores1601"
              target="_blank"
              sx={{ color: "#fff" }}
            >
              <YouTube />
            </IconButton>
            <IconButton
              href="https://www.tiktok.com/@conotaxi"
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
