import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function Configuracion() {
  return (
    <Box>
      {/* HEADER */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Configuración
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Ajustes generales del panel SuperAdmin.
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
          {/* Nombre sistema */}
          <Box mb={3}>
            <Typography mb={1} fontWeight={600}>
              Nombre del sistema
            </Typography>

            <TextField fullWidth placeholder="Nombre del sistema" />
          </Box>

          {/* Correo soporte */}
          <Box mb={3}>
            <Typography mb={1} fontWeight={600}>
              Correo de soporte
            </Typography>

            <TextField
              fullWidth
              type="email"
              placeholder="soporte@dominio.com"
            />
          </Box>

          {/* Estado */}
          <Box mb={3}>
            <FormControl fullWidth>
              <InputLabel>Estado general</InputLabel>

              <Select label="Estado general" defaultValue="Activo">
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* BOTÓN */}
          <Button variant="contained" fullWidth>
            Guardar configuración
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}