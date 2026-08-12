export type TaecontaTimbreDetail =
  | "total"
  | "asignados"
  | "disponibles"
  | "respaldo";

export type TaecontaSection =
  | "dashboard"
  | "historial"
  | "planes"
  | "paquetes"
  | "preferencias"
  | "reporte-ventas";

export type TaecontaEmpresaFilters = {
  search: string;
  month: number | "";
  year: number | "";
  indicadorId: number | "";
};

export type TaecontaIndicador = {
  id: number;
  nombre: string;
  color: string;
};