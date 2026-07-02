import { useCallback, useEffect, useMemo, useState } from "react";

import complementos from "../../../../utils/complementos";
import { suscripcionesGlobalService } from "../../../../services/suscripcionesGlobalService";

export type TipoSuscripcion = "plan" | "complemento";

export type Tienda = {
  id: number;
  name: string;
  plan_id: number | null;
  plan_expiration: string | null;
  is_active: boolean;
};

export type Props = {
  open: boolean;
  tienda: Tienda | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export type PlanSuscripcion = {
  id: number;
  nombre: string;
  precio: number;
};

export type Complemento = {
  complemento_id: number;
  nombre: string;
  precio: number;
  tipo: string;
  nota?: string;
  ya_aplicado?: boolean;
};

export type HistorialItem = {
  id?: number;
  store_id?: number;
  plan_id?: number | null;

  complemento_id?: number | null;
  storecomplemento_id?: number | null;
  store_complemento_id?: number | null;

  starts_at?: string | null;
  ends_at?: string | null;
  monto?: number | string | null;
  meses_pagados?: number | string | null;
  meses_obtenidos?: number | string | null;
  meses_bonificados?: number | string | null;
  cantidad?: number | string | null;

  complemento?: {
    id?: number;
    complemento_id?: number;
    nombre?: string | null;
    name?: string | null;
    tipo?: string | null;
  } | null;

  store_complemento?: {
    id?: number;
    store_id?: number;
    complemento_id?: number | null;
    cantidad?: number | string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    complemento?: {
      id?: number;
      complemento_id?: number;
      nombre?: string | null;
      name?: string | null;
      tipo?: string | null;
    } | null;
  } | null;
};

export const planes: PlanSuscripcion[] = [
  {
    id: 1,
    nombre: "Plan Demo",
    precio: 0,
  },
  {
    id: 2,
    nombre: "Plan Negocio",
    precio: 199,
  },
  {
    id: 3,
    nombre: "Plan Profesional",
    precio: 449,
  },
  {
    id: 4,
    nombre: "Plan Avanzado",
    precio: 899,
  },
];

export const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getFechaInicioRenovacion = (planExpiration?: string | null) => {
  const hoy = getToday();

  if (!planExpiration) return hoy;

  const fechaVencimiento = planExpiration.split("T")[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaVencimiento)) {
    return hoy;
  }

  return fechaVencimiento >= hoy ? fechaVencimiento : hoy;
};

export const formatMoney = (value: number | string) => {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
};

export const formatDate = (value?: string | null) => {
  if (!value) return "N/A";

  const clean = value.split("T")[0];
  const [year, month, day] = clean.split("-");

  if (!year || !month || !day) return "N/A";

  return `${day}/${month}/${year}`;
};

export const addMonths = (date: string, months: number) => {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(
    targetYear,
    normalizedMonthIndex + 1,
    0
  ).getDate();
  const finalDay = Math.min(day, lastDayOfTargetMonth);
  const d = new Date(targetYear, normalizedMonthIndex, finalDay);

  const finalYear = d.getFullYear();
  const finalMonth = String(d.getMonth() + 1).padStart(2, "0");
  const finalDayFormatted = String(d.getDate()).padStart(2, "0");

  return `${finalYear}-${finalMonth}-${finalDayFormatted}`;
};

export const normalizarTexto = (value?: string | null) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const esComplementoUnico = (complemento?: Complemento | null) => {
  return normalizarTexto(complemento?.tipo) === "unico";
};

export const normalizarCantidad = (value: string | number) => {
  const cantidad = Number(value);

  if (!Number.isFinite(cantidad) || cantidad < 1) {
    return 1;
  }

  return Math.floor(cantidad);
};

export const getMesesBonificados = (mesesPagados: number) => {
  const meses = normalizarCantidad(mesesPagados);

  return Math.floor(meses / 5);
};

export const getMesesObtenidos = (mesesPagados: number) => {
  const meses = normalizarCantidad(mesesPagados);
  const bonificados = getMesesBonificados(meses);

  return meses + bonificados;
};

export const getComplementoIdsHistorial = (item: HistorialItem): number[] => {
  const ids: Array<number | string | null | undefined> = [
    item.complemento_id,
    item.storecomplemento_id,
    item.store_complemento_id,
    item.store_complemento?.complemento_id,
    item.store_complemento?.complemento?.id,
    item.store_complemento?.complemento?.complemento_id,
    item.complemento?.id,
    item.complemento?.complemento_id,
  ];

  return ids
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
};

export const getComplementoNombreHistorial = (item: HistorialItem) => {
  return normalizarTexto(
    item.store_complemento?.complemento?.nombre ||
      item.store_complemento?.complemento?.name ||
      item.complemento?.nombre ||
      item.complemento?.name ||
      ""
  );
};

export const historialTieneComplemento = (
  historial: HistorialItem[],
  complemento: Complemento
) => {
  const complementoId = Number(complemento.complemento_id);
  const complementoNombre = normalizarTexto(complemento.nombre);

  return historial.some((item) => {
    const idsHistorial = getComplementoIdsHistorial(item);
    const nombreHistorial = getComplementoNombreHistorial(item);

    const coincidePorId = idsHistorial.includes(complementoId);
    const coincidePorNombre =
      complementoNombre !== "" && nombreHistorial === complementoNombre;

    return coincidePorId || coincidePorNombre;
  });
};

export function useAgregarSuscripcionModal({
  open,
  tienda,
  onClose,
  onSuccess,
}: Props) {
  const [tipo, setTipo] = useState<TipoSuscripcion>("plan");

  const [planId, setPlanId] = useState("1");
  const [complementoId, setComplementoId] = useState("");

  const [cantidad, setCantidad] = useState("1");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");

  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState("");

  const listaComplementos = useMemo(() => complementos as Complemento[], []);

  const planSeleccionado = planes.find((plan) => String(plan.id) === planId);

  const complementosDisponibles = useMemo(() => {
    return listaComplementos.filter((complemento) => {
      if (!esComplementoUnico(complemento)) return true;
      if (complemento.ya_aplicado) return false;

      return !historialTieneComplemento(historial, complemento);
    });
  }, [historial, listaComplementos]);

  const complementoSeleccionado = complementosDisponibles.find(
    (item) => String(item.complemento_id) === complementoId
  );

  const complementoUnicoSeleccionado =
    tipo === "complemento" && esComplementoUnico(complementoSeleccionado);

  const cantidadNumerica = normalizarCantidad(cantidad);

  const mostrarCamposPago =
    tipo === "plan" || (tipo === "complemento" && !!complementoSeleccionado);

  const mesesPagados =
    tipo === "complemento" && complementoUnicoSeleccionado
      ? 0
      : cantidadNumerica;

  const mesesBonificados =
    tipo === "complemento" && complementoUnicoSeleccionado
      ? 0
      : getMesesBonificados(mesesPagados);

  const mesesObtenidos =
    tipo === "complemento" && complementoUnicoSeleccionado
      ? 0
      : getMesesObtenidos(mesesPagados);

  const mesesMostrados =
    tipo === "complemento" && complementoUnicoSeleccionado
      ? "Pago único"
      : mesesBonificados > 0
        ? `${mesesPagados} pagado(s) → ${mesesObtenidos} obtenido(s)`
        : `${mesesPagados} mes(es)`;

  const conceptoNombre =
    tipo === "plan"
      ? planSeleccionado?.nombre || "N/A"
      : complementoSeleccionado?.nombre || "N/A";

  const cargarHistorial = useCallback(async () => {
    if (!tienda?.id) {
      setHistorial([]);
      return;
    }

    try {
      setLoadingHistorial(true);
      setError("");

      const response =
        await suscripcionesGlobalService.obtenerSuscripcionesPorTienda(
          tienda.id
        );

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setHistorial(data);
    } catch (err: any) {
      setHistorial([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo validar el historial de la tienda."
      );
    } finally {
      setLoadingHistorial(false);
    }
  }, [tienda?.id]);

  useEffect(() => {
    if (!open) return;

    const fechaInicio = getFechaInicioRenovacion(tienda?.plan_expiration);

    setStartsAt(fechaInicio);
    setCantidad("1");
    cargarHistorial();
  }, [open, tienda?.id, tienda?.plan_expiration, cargarHistorial]);

  useEffect(() => {
    if (tipo !== "complemento" || !complementoId) return;

    const existeEnDisponibles = complementosDisponibles.some(
      (item) => String(item.complemento_id) === complementoId
    );

    if (!existeEnDisponibles) {
      setComplementoId("");
      setCantidad("1");
      setEndsAt("");
      setMonto("");
      setNotas("");
      setError(
        "Este complemento es de pago único y ya está aplicado en el historial."
      );
    }
  }, [historial, complementosDisponibles, tipo, complementoId]);

  useEffect(() => {
    if (!startsAt) return;

    if (tipo === "plan") {
      setEndsAt(addMonths(startsAt, mesesObtenidos));
      return;
    }

    if (tipo === "complemento") {
      if (!complementoSeleccionado) {
        setEndsAt("");
        return;
      }

      if (complementoUnicoSeleccionado) {
        setCantidad("1");
        setEndsAt("");
        return;
      }

      setEndsAt(addMonths(startsAt, mesesObtenidos));
    }
  }, [
    tipo,
    startsAt,
    complementoSeleccionado,
    complementoUnicoSeleccionado,
    mesesObtenidos,
  ]);

  useEffect(() => {
    if (tipo === "plan") {
      const plan = planSeleccionado || planes[0];
      setMonto(String(plan.precio * cantidadNumerica));
      return;
    }

    if (tipo === "complemento" && complementoSeleccionado) {
      const precioBase = Number(complementoSeleccionado.precio || 0);

      if (complementoUnicoSeleccionado) {
        setMonto(String(precioBase));
      } else {
        setMonto(String(precioBase * cantidadNumerica));
      }

      return;
    }

    if (tipo === "complemento" && !complementoSeleccionado) {
      setMonto("");
    }
  }, [
    tipo,
    planSeleccionado,
    complementoSeleccionado,
    complementoUnicoSeleccionado,
    cantidadNumerica,
  ]);

  const resetForm = () => {
    setTipo("plan");
    setPlanId("1");
    setComplementoId("");
    setCantidad("1");
    setStartsAt("");
    setEndsAt("");
    setMonto("");
    setNotas("");
    setHistorial([]);
    setError("");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  const handleTipoChange = (value: TipoSuscripcion) => {
    setTipo(value);
    setComplementoId("");
    setCantidad("1");
    setEndsAt("");
    setMonto("");
    setNotas("");
    setError("");

    if (value === "complemento") {
      setPlanId("1");
    }
  };

  const handlePlanChange = (value: string) => {
    setPlanId(value);
    setCantidad("1");
    setError("");
  };

  const handleComplementoChange = (value: string) => {
    setComplementoId(value);
    setCantidad("1");
    setError("");
  };

  const handleCantidadChange = (value: string) => {
    const cantidadValida = normalizarCantidad(value);

    setCantidad(String(cantidadValida));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!tienda) {
        setError("Sin tienda seleccionada");
        return;
      }

      if (tipo === "plan" && (!startsAt || !endsAt || !monto)) {
        setError("Completa fechas y monto");
        return;
      }

      if (tipo === "complemento") {
        if (!complementoId || !complementoSeleccionado) {
          setError("Selecciona un complemento válido");
          return;
        }

        if (
          esComplementoUnico(complementoSeleccionado) &&
          historialTieneComplemento(historial, complementoSeleccionado)
        ) {
          setComplementoId("");
          setCantidad("1");
          setEndsAt("");
          setMonto("");
          setNotas("");
          setError(
            "Este complemento es de pago único y ya está aplicado en el historial."
          );
          return;
        }

        if (!startsAt || !monto) {
          setError("Completa fecha de inicio y monto");
          return;
        }

        if (!complementoUnicoSeleccionado && !endsAt) {
          setError("Completa la fecha de vencimiento");
          return;
        }
      }

      const payload =
        tipo === "plan"
          ? {
              store_id: tienda.id,
              plan_id: Number(planId),
              cantidad: cantidadNumerica,
              starts_at: startsAt,
              ends_at: endsAt,
              monto: Number(monto),
              meses_pagados: mesesPagados,
              meses_obtenidos: mesesObtenidos,
              meses_bonificados: mesesBonificados,
            }
          : {
              store_id: tienda.id,
              complemento_id: Number(complementoId),
              cantidad: complementoUnicoSeleccionado ? 1 : cantidadNumerica,
              starts_at: startsAt,
              ends_at: complementoUnicoSeleccionado ? null : endsAt,
              monto: Number(monto),
              meses_pagados: mesesPagados,
              meses_obtenidos: mesesObtenidos,
              meses_bonificados: mesesBonificados,
              notas,
            };

      await suscripcionesGlobalService.agregarSuscripcion(payload);

      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Error al guardar la suscripción"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    tipo,
    planId,
    complementoId,
    cantidad,
    startsAt,
    endsAt,
    monto,
    notas,

    loading,
    loadingHistorial,
    error,

    planSeleccionado,
    complementosDisponibles,
    complementoSeleccionado,
    complementoUnicoSeleccionado,
    cantidadNumerica,
    mostrarCamposPago,
    mesesPagados,
    mesesBonificados,
    mesesObtenidos,
    mesesMostrados,
    conceptoNombre,

    setStartsAt,
    setEndsAt,
    setMonto,
    setNotas,

    handleClose,
    handleSubmit,
    handleTipoChange,
    handlePlanChange,
    handleComplementoChange,
    handleCantidadChange,
  };
}