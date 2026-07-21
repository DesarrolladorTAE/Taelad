import { Helmet } from "react-helmet-async";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArticleRounded,
  HomeRounded,
} from "@mui/icons-material";
import {
  Link as RouterLink,
} from "react-router-dom";

import {
  Navbar1,
} from "../../components/navbar";
import TaeFooter from "../../components/TaeFooter";
import BackToTop from "../../components/BackToTop";

function NotFound() {
  return (
    <>
      <Helmet>
        <html lang="es-MX" />

        <title>
          Página no encontrada | Tecnologías Administrativas ELAD
        </title>

        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet"
        />

        <meta
          name="googlebot"
          content="noindex, nofollow, noarchive, nosnippet"
        />
      </Helmet>

      <Navbar1
        classname="navbar-light"
        isLogoDark={false}
      />

      <main>
        <Container
          maxWidth="md"
          sx={{
            minHeight: {
              xs: "72vh",
              md: "76vh",
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: {
              xs: 8,
              md: 10,
            },
          }}
        >
          <Box
            component="section"
            aria-labelledby="not-found-title"
            sx={{
              width: "100%",
              textAlign: "center",
              px: {
                xs: 2,
                sm: 4,
              },
            }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: {
                  xs: "5rem",
                  sm: "7rem",
                  md: "9rem",
                },
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.06em",
                color: "primary.main",
                mb: 2,
              }}
            >
              404
            </Typography>

            <Typography
              id="not-found-title"
              component="h1"
              variant="h3"
              fontWeight={800}
              gutterBottom
            >
              Página no encontrada
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 620,
                mx: "auto",
                mb: 4,
                fontSize: {
                  xs: "1rem",
                  sm: "1.1rem",
                },
              }}
            >
              La dirección que intentas visitar no existe,
              fue eliminada o cambió de ubicación.
            </Typography>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                size="large"
                startIcon={
                  <HomeRounded />
                }
                sx={{
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Volver al inicio
              </Button>

              <Button
                component={RouterLink}
                to="/blogs"
                variant="outlined"
                size="large"
                startIcon={
                  <ArticleRounded />
                }
                sx={{
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Ir al blog
              </Button>
            </Stack>
          </Box>
        </Container>
      </main>

      <TaeFooter />

      <BackToTop />
    </>
  );
}

export default NotFound;