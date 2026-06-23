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
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import Swal from "sweetalert2";

import {
  getSuperAdminUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../services/superadminService";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import TableContainer from "@mui/material/TableContainer";
import IconButton from "@mui/material/IconButton";


export default function Usuarios() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const initialForm = {
    name: "",
    apellidos: "",
    email: "",
    phone: "",
    role: "",
    codigo_ref: "",
  };

  const [form, setForm] = useState<any>(initialForm);

  const getUserId = (user: any) => {
    return user?.id ?? user?.user_id ?? user?.id_user ?? null;
  };

  const getRoleName = (role: any) => {
    switch (String(role)) {
      case "1":
        return "Usuario";
      case "2":
        return "Administrador";
      case "3":
        return "SuperAdministrador";
      default:
        return "-";
    }
  };
 const [page, setPage] = useState(1);
const [perPage] = useState(16);

const [pagination, setPagination] = useState({
  current_page: 1,
  last_page: 1,
  per_page: 16,
  total: 0,
});
useEffect(() => {
  cargarUsuarios();
}, [page]);

 const cargarUsuarios = () => {
  setLoading(true);

  getSuperAdminUsers(page, perPage)
    .then((response) => {
      const data = Array.isArray(response?.data) ? response.data : [];

      setUsuarios(data);

      setPagination({
        current_page: response?.current_page || 1,
        last_page: response?.last_page || 1,
        per_page: response?.per_page || 16,
        total: response?.total || 0,
      });
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Error", "No se pudieron cargar usuarios", "error");
    })
    .finally(() => setLoading(false));
};
  const handleChange = (e: any) => {
    setForm((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.name || !form.email) {
      Swal.fire("Error", "Nombre y email son obligatorios", "error");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      await createUser(form);

      Swal.fire("Éxito", "Usuario creado correctamente", "success");

      setOpenCreate(false);
      resetForm();
      cargarUsuarios();
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "No se pudo crear usuario", "error");
    }
  };

  const openEditModal = (user: any) => {
    const id = getUserId(user);

    if (!id) {
      Swal.fire("Error", "El usuario no tiene ID válido", "error");
      return;
    }

    setEditingId(Number(id));

    setForm({
      name: user?.name || "",
      apellidos: user?.apellidos || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
      codigo_ref: user?.codigo_ref || "",
    });

    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editingId) {
      Swal.fire("Error", "ID inválido", "error");
      return;
    }

    if (!validate()) return;

    try {
      await updateUser(editingId, form);

      Swal.fire("Actualizado", "Usuario actualizado", "success");

      setOpenEdit(false);
      resetForm();
      cargarUsuarios();
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const handleDelete = async (user: any) => {
    const id = getUserId(user);

    console.log("DELETE USER:", user);
    console.log("DELETE USER ID:", id);

    if (!id) {
      Swal.fire("Error", "El usuario no tiene ID válido", "error");
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUser(id);

      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");

      setUsuarios((prev) => prev.filter((u) => getUserId(u) !== id));

      cargarUsuarios();
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Usuarios
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarUsuarios}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              resetForm();
              setOpenCreate(true);
            }}
          >
            Crear usuario
          </Button>
        </Box>
      </Box>

<Card
  sx={{
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  }}
>
  <CardContent
  sx={{
    p: 2,
    "&:last-child": {
      pb: 2,
    },
  }}
>
  {loading ? (
    <CircularProgress />
  ) : isMobile ? (

    // VISTA MÓVIL
    <Stack spacing={1.5}>
      {usuarios.map((u, index) => {
        const id = getUserId(u);

        return (
          <Card key={id ?? index} variant="outlined">
            <CardContent>

              <Typography fontWeight={800}>
                {u?.name} {u?.apellidos}
              </Typography>

              <Typography fontSize={13}>
                Email: {u?.email || "-"}
              </Typography>

              <Typography fontSize={13}>
                Tel: {u?.phone || "-"}
              </Typography>

              <Typography fontSize={13}>
                Rol: {getRoleName(u?.role)}
              </Typography>


              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  size="small"
                  fullWidth
                  onClick={() => openEditModal(u)}
                >
                  Editar
                </Button>

                <Button
                  size="small"
                  fullWidth
                  color="error"
                  onClick={() => handleDelete(u)}
                >
                  Eliminar
                </Button>
              </Box>

            </CardContent>
          </Card>
        );
      })}
    </Stack>

  ) : (

    
    <TableContainer
  sx={{
    width: "100%",
    maxWidth: "100%",
    maxHeight: 430,
    overflowY: "auto",
    overflowX: "auto",
  }}
>
  <Table
    stickyHeader
    size="small"
    sx={{
      width: "100%",
      tableLayout: "fixed",
    }}
  >
    <TableHead
      sx={{
        "& th": {
          backgroundColor: "background.paper",
          fontWeight: 800,
          position: "sticky",
          top: 0,
          zIndex: 10,
        },
      }}
    

>
  <TableRow>
    <TableCell sx={{ width: "5%" }}>
      ID
    </TableCell>

    <TableCell sx={{ width: "11%" }}>
      Nombre
    </TableCell>

    <TableCell sx={{ width: "13%" }}>
      Apellidos
    </TableCell>

    <TableCell sx={{ width: "23%" }}>
      Email
    </TableCell>

    <TableCell sx={{ width: "11%" }}>
      Phone
    </TableCell>

    <TableCell sx={{ width: "13%" }}>
      Role
    </TableCell>

    <TableCell sx={{ width: "9%" }}>
      Ref
    </TableCell>

    <TableCell sx={{ width: "15%" }}>
      Acciones
    </TableCell>
  </TableRow>
</TableHead>

          <TableBody>
            {usuarios.map((u, index) => {
              const id = getUserId(u);

              return (
                <TableRow key={id ?? index}>
                  <TableCell title={String(id ?? "")}>
                    {id ?? "-"}
                  </TableCell>

                  <TableCell title={u?.name || ""}>
                    {u?.name || "-"}
                  </TableCell>

                  <TableCell title={u?.apellidos || ""}>
                    {u?.apellidos || "-"}
                  </TableCell>

                  <TableCell title={u?.email || ""}>
                    {u?.email || "-"}
                  </TableCell>

                  <TableCell title={u?.phone || ""}>
                    {u?.phone || "-"}
                  </TableCell>

                  <TableCell title={getRoleName(u?.role)}>
                    {getRoleName(u?.role)}
                  </TableCell>

                  <TableCell title={u?.codigo_ref || ""}>
                    {u?.codigo_ref || "-"}
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                      }}
                    >
                      <Button
                        color="primary"
                        size="small"
                        sx={{
                          minWidth: 28,
                          width: 28,
                          height: 28,
                          p: 0,
                        }}
                        onClick={() => openEditModal(u)}
                      >
                        <EditIcon sx={{ fontSize: 17 }} />
                      </Button>

                      <Button
                        color="error"
                        size="small"
                        sx={{
                          minWidth: 28,
                          width: 28,
                          height: 28,
                          p: 0,
                        }}
                        onClick={() => handleDelete(u)}
                      >
                        <DeleteIcon sx={{ fontSize: 17 }} />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </CardContent>
</Card>
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Crear usuario</DialogTitle>

        <DialogContent>
          <TextField
            name="name"
            label="Nombre"
            value={form.name}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="apellidos"
            label="Apellidos"
            value={form.apellidos}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="email"
            label="Email"
            value={form.email}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="role"
            label="Role"
            value={form.role}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="codigo_ref"
            label="Codigo Ref"
            value={form.codigo_ref}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
 
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Editar usuario</DialogTitle>

        <DialogContent>
          <TextField
            label="ID"
            value={editingId || ""}
            fullWidth
            margin="dense"
            disabled
          />

          <TextField
            name="name"
            label="Nombre"
            value={form.name}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="apellidos"
            label="Apellidos"
            value={form.apellidos}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="email"
            label="Email"
            value={form.email}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="role"
            label="Role"
            value={form.role}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />

          <TextField
            name="codigo_ref"
            label="Codigo Ref"
            value={form.codigo_ref}
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}