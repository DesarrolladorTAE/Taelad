import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../services/axiosClient";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CodeIcon from "@mui/icons-material/Code";

type Props = {
  setView?: (view: string) => void;
};

type Venta = {
  id: number;
  store_id: number;
  tienda: string;
  tipo: "plan" | "complemento" | string;
  plan_id: number | null;
  complemento_id: number | null;
  monto: number;
  fecha: string;
  facturado: boolean;
  pdf_url?: string | null;
  xml_url?: string | null;
  facturado_pg?: boolean;
  pg_folio?: string | null;
  pg_pdf_url?: string | null;
  pg_xml_url?: string | null;
};

const getCurrentMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

const formatCurrency = (value: number) => {
  return `$${Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function MiTiendaVentas({ setView }: Props) {
  const [data, setData] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);

  const [mes, setMes] = useState(getCurrentMonth());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);

      try {
        const res = await axiosClient.get("/superadmin/mitienda/ventas", {
          params: { mes },
        });

        setData(Array.isArray(res.data?.data) ? res.data.data : []);
        setSelected([]);
      } catch (error) {
        console.error("Error cargando ventas:", error);
        setData([]);
        setSelected([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [mes]);

  const filteredData = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return data;

    return data.filter((item) => {
      return (
        String(item.id ?? "").includes(value) ||
        String(item.store_id ?? "").includes(value) ||
        String(item.tienda ?? "").toLowerCase().includes(value) ||
        String(item.tipo ?? "").toLowerCase().includes(value)
      );
    });
  }, [data, search]);

  const totalVentas = useMemo(() => {
    return filteredData.reduce(
      (total, item) => total + Number(item.monto ?? 0),
      0
    );
  }, [filteredData]);

  const facturadas = useMemo(() => {
    return filteredData.filter((item) => item.facturado).length;
  }, [filteredData]);

  const pendientes = useMemo(() => {
    return filteredData.filter((item) => !item.facturado).length;
  }, [filteredData]);

  const elegibles = useMemo(() => {
    return filteredData.filter((item) => !item.facturado).length;
  }, [filteredData]);

  const selectedRows = useMemo(() => {
    return filteredData.filter((item) => selected.includes(item.id));
  }, [filteredData, selected]);

  const totalSeleccionado = useMemo(() => {
    return selectedRows.reduce(
      (total, item) => total + Number(item.monto ?? 0),
      0
    );
  }, [selectedRows]);

  const toggleSelected = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleAllElegibles = () => {
    const elegiblesIds = filteredData
      .filter((item) => !item.facturado)
      .map((item) => item.id);

    const allSelected = elegiblesIds.every((id) => selected.includes(id));

    setSelected(allSelected ? [] : elegiblesIds);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => setView?.("mitienda-dashboard")}
        sx={{ borderRadius: 3, mb: 2 }}
      >
        Volver a Mi Tienda
      </Button>

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Ventas del mes
          </Typography>

          <Typography color="text.secondary">
            Compras de planes y complementos registradas en Mi Tienda.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            size="small"
            label="Mes"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 180 },
              "& .MuiOutlinedInput-root": { borderRadius: 3 },
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            size="small"
            placeholder="Buscar tienda, ID o tipo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 320 },
              "& .MuiOutlinedInput-root": { borderRadius: 3 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ReceiptLongIcon />
                </Avatar>

                <Box>
                  <Typography fontSize={13} color="text.secondary">
                    Operaciones
                  </Typography>
                  <Typography fontSize={26} fontWeight={900}>
                    {filteredData.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <AttachMoneyIcon />
                </Avatar>

                <Box>
                  <Typography fontSize={13} color="text.secondary">
                    Total vendido
                  </Typography>
                  <Typography fontSize={26} fontWeight={900}>
                    {formatCurrency(totalVentas)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <PointOfSaleIcon />
                </Avatar>

                <Box>
                  <Typography fontSize={13} color="text.secondary">
                    Pendientes por facturar
                  </Typography>
                  <Typography fontSize={26} fontWeight={900}>
                    {pendientes}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <Typography fontSize={13} color="text.secondary">
                Seleccionadas
              </Typography>

              <Typography fontSize={26} fontWeight={900}>
                {selected.length}
              </Typography>

              <Typography fontSize={12} color="text.secondary">
                {formatCurrency(totalSeleccionado)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 5, mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography fontWeight={900}>
                Registros elegibles: {elegibles}
              </Typography>

              <Typography color="text.secondary" fontSize={13}>
                Solo las ventas sin facturar pueden seleccionarse.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip label={`Facturadas: ${facturadas}`} color="success" />
              <Chip label={`Pendientes por facturar: ${pendientes}`} color="warning" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box
          sx={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredData.length === 0 ? (
        <Card sx={{ borderRadius: 5 }}>
          <CardContent>
            <Typography fontWeight={900}>Sin ventas disponibles</Typography>

            <Typography color="text.secondary">
              No existen registros para el mes o filtro seleccionado.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      elegibles > 0 &&
                      filteredData
                        .filter((item) => !item.facturado)
                        .every((item) => selected.includes(item.id))
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < elegibles
                    }
                    onChange={toggleAllElegibles}
                  />
                </TableCell>

                <TableCell sx={{ fontWeight: 900 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Tienda</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Monto</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>PDF</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>XML</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.map((v) => {
                const disabled = Boolean(v.facturado);

                return (
                  <TableRow key={v.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(v.id)}
                        disabled={disabled}
                        onChange={() => toggleSelected(v.id)}
                      />
                    </TableCell>

                    <TableCell>{v.id}</TableCell>

                    <TableCell>
                      <Box>
                        <Typography fontWeight={800}>
                          {v.tienda ?? "Sin tienda"}
                        </Typography>

                        <Typography fontSize={12} color="text.secondary">
                          Store ID: {v.store_id}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          v.tipo === "plan"
                            ? "Plan"
                            : v.tipo === "complemento"
                            ? "Complemento"
                            : v.tipo
                        }
                        color={v.tipo === "plan" ? "primary" : "secondary"}
                      />
                    </TableCell>

                    <TableCell>{formatCurrency(Number(v.monto ?? 0))}</TableCell>

                    <TableCell>{v.fecha ?? "N/A"}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={v.facturado ? "Facturado" : "Sin facturar"}
                        color={v.facturado ? "success" : "warning"}
                      />
                    </TableCell>

                    <TableCell>
                      {v.pdf_url ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PictureAsPdfIcon />}
                          href={v.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ borderRadius: 3 }}
                        >
                          PDF
                        </Button>
                      ) : (
                        <Typography fontSize={12} color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {v.xml_url ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CodeIcon />}
                          href={v.xml_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ borderRadius: 3 }}
                        >
                          XML
                        </Button>
                      ) : (
                        <Typography fontSize={12} color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}