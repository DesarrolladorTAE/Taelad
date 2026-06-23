import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

export default function Facturacion() {
  const data: any[] = [];

  return (
    <Box>
      {/* HEADER */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Facturación
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Control general de pagos, suscripciones y movimientos.
        </Typography>
      </Box>

      {/* PANEL */}
      <Card
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 4,
        })}
      >
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Sin registros
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.cliente}</TableCell>
                    <TableCell>{item.plan}</TableCell>
                    <TableCell>{item.monto}</TableCell>
                    <TableCell>
                      <Chip label={item.estado || "-"} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}