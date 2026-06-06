import React from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, Typography } from "@mui/material";
import Page from "./Page";

const rows = [
  { id: "F-00123", concepto: "Suscripción MiTienda (Mensual)", monto: 299, fecha: "2025-09-30", timbrado: true },
  { id: "F-00131", concepto: "TAECONTA Folios (25)", monto: 199, fecha: "2025-10-05", timbrado: false },
];

export default function HistorialCompras() {
  return (
    <Page title="Historial de compras">
      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Folio</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell align="right">Monto (MXN)</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Factura</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.concepto}</TableCell>
                <TableCell align="right">${r.monto}</TableCell>
                <TableCell>{r.fecha}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {r.timbrado ? <Chip size="small" label="Timbrada" color="success" /> : <Chip size="small" label="Sin facturar" color="warning" />}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary">* Conecta tu backend para datos reales.</Typography>
    </Page>
  );
}
