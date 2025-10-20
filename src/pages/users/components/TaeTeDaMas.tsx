import React from "react";
import { Grid, Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PercentIcon from "@mui/icons-material/Percent";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import Page from "./Page";

const perks = [
  { icon: <WorkspacePremiumIcon/>, titulo: "Referidos TAE", desc: "Gana comisiones por recomendar nuestros sistemas.", tag: "Nuevo" },
  { icon: <PercentIcon/>, titulo: "Descuentos por volumen", desc: "Mejor precio al contratar más módulos.", tag: "-10%" },
  { icon: <HeadsetMicIcon/>, titulo: "Soporte prioritario", desc: "Atención preferente para planes anuales.", tag: "Prioridad" },
];

export default function TaeTeDaMas() {
  return (
    <Page title="TAE te da más">
      <Grid container spacing={2}>
        {perks.map((p, idx) => (
          <Grid key={idx} item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  {p.icon}
                  <Typography variant="h6" fontWeight={800}>{p.titulo}</Typography>
                  <Chip size="small" label={p.tag} color="primary" />
                </Stack>
                <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}
