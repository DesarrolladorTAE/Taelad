import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
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

const ROLE_OPTIONS = [
  { value: "1", label: "Usuario" },
  { value: "2", label: "Administrador" },
  { value: "3", label: "Superadministrador" },
];

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
    role: "1",
    password: "",
    codigo_ref: "",
  };

  const [form, setForm] = useState<any>(initialForm);

  const [page, setPage] = useState(1);
  const [perPage] = useState(16);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 16,
    total: 0,
  });

  const getUserId = (user: any) => {
    return user?.id ?? user?.user_id ?? user?.id_user ?? null;
  };

  const normalizeRoleValue = (role: any) => {
    const value = String(role ?? "").trim().toLowerCase();

    if (value === "1" || value === "usuario" || value === "user") {
      return "1";
    }

    if (
      value === "2" ||
      value === "administrador" ||
      value === "admin"
    ) {
      return "2";
    }

    if (
      value === "3" ||
      value === "superadministrador" ||
      value === "superadmin" ||
      value === "super_admin"
    ) {
      return "3";
    }

    return "1";
  };

  const getRoleName = (role: any) => {
    const value = normalizeRoleValue(role);

    switch (value) {
      case "1":
        return "Usuario";
      case "2":
        return "Administrador";
      case "3":
        return "Superadministrador";
      default:
        return "-";
    }
  };

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
    const { name, value } = e.target;

    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = (mode: "create" | "edit") => {
    if (!form.name || !form.email) {
      Swal.fire("Error", "Nombre y email son obligatorios", "error");
      return false;
    }

    if (mode === "create" && !form.password) {
      Swal.fire("Error", "La contraseña es obligatoria", "error");
      return false;
    }

    if (mode === "create" && String(form.password).length < 8) {
      Swal.fire(
        "Error",
        "La contraseña debe tener mínimo 8 caracteres",
        "error",
      );
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!validate("create")) return;

    try {
      await createUser({
        name: form.name,
        apellidos: form.apellidos,
        email: form.email,
        phone: form.phone,
        role: normalizeRoleValue(form.role),
        password: form.password,
      });

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
      role: normalizeRoleValue(user?.role),
      password: "",
      codigo_ref: user?.codigo_ref || "",
    });

    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editingId) {
      Swal.fire("Error", "ID inválido", "error");
      return;
    }

    if (!validate("edit")) return;

    try {
      await updateUser(editingId, {
        name: form.name,
        apellidos: form.apellidos,
        email: form.email,
        phone: form.phone,
        role: normalizeRoleValue(form.role),
      });

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

  const renderRoleSelect = () => (
    <TextField
      select
      name="role"
      label="Rol"
      value={normalizeRoleValue(form.role)}
      fullWidth
      margin="dense"
      onChange={handleChange}
    >
      {ROLE_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        gap={2}
        mb={3}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Typography variant="h5" fontWeight={800}>
          Usuarios
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap">
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

                      <Typography fontSize={13}>
                        Ref: {u?.codigo_ref || "-"}
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
                  "& td, & th": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
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
                    <TableCell sx={{ width: "5%" }}>ID</TableCell>
                    <TableCell sx={{ width: "11%" }}>Nombre</TableCell>
                    <TableCell sx={{ width: "13%" }}>Apellidos</TableCell>
                    <TableCell sx={{ width: "23%" }}>Email</TableCell>
                    <TableCell sx={{ width: "11%" }}>Phone</TableCell>
                    <TableCell sx={{ width: "13%" }}>Rol</TableCell>
                    <TableCell sx={{ width: "9%" }}>Ref</TableCell>
                    <TableCell sx={{ width: "15%" }}>Acciones</TableCell>
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

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
      >
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
            name="password"
            label="Contraseña"
            type="password"
            value={form.password || ""}
            fullWidth
            margin="dense"
            onChange={handleChange}
            helperText="Mínimo 8 caracteres."
          />

          {renderRoleSelect()}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar usuario</DialogTitle>

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

          {renderRoleSelect()}

          <TextField
            name="codigo_ref"
            label="Código Ref"
            value={form.codigo_ref || ""}
            fullWidth
            margin="dense"
            disabled
            helperText="El código de referido no se puede modificar."
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
