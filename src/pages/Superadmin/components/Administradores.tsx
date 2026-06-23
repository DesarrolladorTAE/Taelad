import { useEffect, useState } from "react";
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
  Button,
  CircularProgress,
} from "@mui/material";

import { getSuperAdminAdministrators } from "../../../services/superadminService";

export default function Administradores({ volver }: any) {
  const [administradores, setAdministradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuperAdminAdministrators()
      .then((res) => {
        setAdministradores(res.data || []);
      })
      .catch((error) => {
        console.error("Error cargando administradores:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box>
      {/* HEADER */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Button variant="contained" onClick={volver}>
          Volver
        </Button>

        <Box>
          <Typography variant="h5" fontWeight={800}>
            Administradores
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Usuarios con permisos administrativos.
          </Typography>
        </Box>
      </Box>

      {/* PANEL */}
      <Card
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 4,
        })}
      >
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Registro</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {administradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Sin administradores registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  administradores.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.id}</TableCell>
                      <TableCell>{admin.name || "-"}</TableCell>
                      <TableCell>{admin.email || "-"}</TableCell>

                      <TableCell>
                        <Chip
                          label="Administrador"
                          size="small"
                          color="primary"
                        />
                      </TableCell>

                      <TableCell>
                        {admin.created_at || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}